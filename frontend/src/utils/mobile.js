const LOCAL = /^09\d{9}$/;
const INTERNATIONAL = /^\+639\d{9}$/;

export function cleanMobile(value) {
  return String(value ?? '').replace(/[\s-]/g, '');
}

export function isValidMobile(value) {
  const cleaned = cleanMobile(value);
  return LOCAL.test(cleaned) || INTERNATIONAL.test(cleaned);
}

// 09171234567 -> +639171234567. Anything else is returned cleaned but unchanged.
export function normalizeMobile(value) {
  const cleaned = cleanMobile(value);
  return LOCAL.test(cleaned) ? `+63${cleaned.slice(1)}` : cleaned;
}