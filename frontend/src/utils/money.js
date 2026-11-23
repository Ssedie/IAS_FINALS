// All arithmetic is done in integer centavos. Strings are only parsed, never float-multiplied.
const formatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

export const MIN_CENTAVOS = 100; // 1.00
export const MAX_CENTAVOS = 5000000; // 50000.00

// Accepts "1234.5", "1,234.50", or the number 1234.5. Returns integer centavos or null.
export function toCentavos(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim().replace(/,/g, '');
  const match = /^(-?)(\d+)(?:\.(\d{1,2})\d*)?$/.exec(text);
  if (!match) return null;
  const [, sign, whole, frac = ''] = match;
  const cents = Number(whole) * 100 + Number(frac.padEnd(2, '0'));
  return sign ? -cents : cents;
}

// 25000 -> "250.00" (the string format the API expects)
export function toAmountString(centavos) {
  const sign = centavos < 0 ? '-' : '';
  const abs = Math.abs(centavos);
  const whole = Math.trunc(abs / 100);
  const frac = String(abs % 100).padStart(2, '0');
  return `${sign}${whole}.${frac}`;
}

export function formatCentavos(centavos) {
  return formatter.format(Number(toAmountString(centavos)));
}

// Works for API values that are numbers or strings. Display only.
export function formatMoney(value) {
  const centavos = toCentavos(value);
  return centavos === null ? '₱0.00' : formatCentavos(centavos);
}

// Keep only digits and one decimal point, max 2 decimals.
export function sanitizeAmountInput(raw) {
  const cleaned = raw.replace(/[^\d.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  if (rest.length === 0) return whole.slice(0, 7);
  return `${whole.slice(0, 7)}.${rest.join('').slice(0, 2)}`;
}

// "250" | "250." | "250.5" -> centavos, or null when the text is not a valid amount.
export function parseAmount(text) {
  const trimmed = String(text ?? '').trim().replace(/\.$/, '');
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  return toCentavos(trimmed);
}

// UX-only validation. The server stays the authority.
export function validateAmount(text) {
  if (!String(text ?? '').trim()) return 'Enter an amount.';
  const centavos = parseAmount(text);
  if (centavos === null) return 'Enter a valid amount, like 250.00.';
  if (centavos < MIN_CENTAVOS) return `The minimum amount is ${formatCentavos(MIN_CENTAVOS)}.`;
  if (centavos > MAX_CENTAVOS) return `The maximum is ${formatCentavos(MAX_CENTAVOS)} per transaction.`;
  return '';
}