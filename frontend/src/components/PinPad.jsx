import Input from './Input';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

// Controlled 4-digit PIN entry. The value lives only in the parent's state and is cleared after each submit.
export default function PinPad({ value, onChange, disabled = false }) {
  const press = (digit) => {
    if (!disabled && value.length < 4) onChange(value + digit);
  };
  return (
    <div className="pin">
      <Input
        label="4-digit PIN"
        type="password"
        inputMode="numeric"
        maxLength={4}
        autoComplete="off"
        name="wallet-pin"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, 4))}
        className="pin-input"
      />
      <div className="pin-dots" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={i < value.length ? 'on' : ''} />
        ))}
      </div>
      <div className="pin-grid">
        {KEYS.map((k) => (
          <button key={k} type="button" disabled={disabled} onClick={() => press(k)} aria-label={`Digit ${k}`}>
            {k}
          </button>
        ))}
        <span />
        <button type="button" disabled={disabled} onClick={() => press('0')} aria-label="Digit 0">
          0
        </button>
        <button type="button" disabled={disabled || value.length === 0} onClick={() => onChange(value.slice(0, -1))} aria-label="Delete last digit">
          ⌫
        </button>
      </div>
    </div>
  );
}