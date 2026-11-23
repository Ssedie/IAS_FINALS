const toText = (value) => (Array.isArray(value) ? value.map(String).join(' ') : String(value));

// Turns any Axios error into { status, message, fields } of plain text.
export function parseError(error) {
  const response = error?.response;
  if (!response) {
    return { status: 0, message: 'Cannot reach PayWallet. Check your connection and try again.', fields: {} };
  }
  const { status, data } = response;
  if (status === 429) {
    return { status, message: 'Too many attempts. Please wait a minute and try again.', fields: {} };
  }
  if (status >= 500) {
    return { status, message: 'Something went wrong on our side. Please try again shortly.', fields: {} };
  }
  if (status === 400 && data && typeof data === 'object') {
    const fields = {};
    if (Array.isArray(data)) {
      fields.non_field_errors = toText(data);
    } else {
      Object.entries(data).forEach(([key, value]) => {
        fields[key] = toText(value);
      });
    }
    const first = Object.values(fields)[0];
    return { status, message: first || 'Please check the details and try again.', fields };
  }
  const detail = data && typeof data === 'object' && data.detail ? toText(data.detail) : '';
  if (status === 403) return { status, message: detail || 'Incorrect PIN.', fields: {} };
  if (status === 401) return { status, message: detail || 'Your session has expired. Please log in again.', fields: {} };
  return { status, message: detail || 'Something went wrong. Please try again.', fields: {} };
}