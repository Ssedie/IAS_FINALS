import { useId } from 'react';

export default function Input({ label, error, hint, prefix, id: idProp, ...rest }) {
  const auto = useId();
  const id = idProp || auto;
  const messageId = `${id}-msg`;
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className="control">
        {prefix ? (
          <span className="prefix" aria-hidden="true">
            {prefix}
          </span>
        ) : null}
        <input id={id} aria-invalid={error ? true : undefined} aria-describedby={error || hint ? messageId : undefined} {...rest} />
      </div>
      {error ? (
        <p id={messageId} className="field-msg err" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="field-msg">
          {hint}
        </p>
      ) : null}
    </div>
  );
}