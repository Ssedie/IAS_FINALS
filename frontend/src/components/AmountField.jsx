import Input from './Input';
import { sanitizeAmountInput } from '../utils/money';

export default function AmountField({ value, onChange, error, label = 'Amount' }) {
  return (
    <Input
      label={label}
      prefix="₱"
      inputMode="decimal"
      autoComplete="off"
      placeholder="0.00"
      value={value}
      error={error}
      onChange={(event) => onChange(sanitizeAmountInput(event.target.value))}
    />
  );
}