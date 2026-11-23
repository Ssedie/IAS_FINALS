export default function EmptyState({ title, text, action }) {
  return (
    <div className="empty">
      <p className="empty-title">{title}</p>
      {text ? <p className="empty-text">{text}</p> : null}
      {action}
    </div>
  );
}