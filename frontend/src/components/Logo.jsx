export default function Logo({ size = 36, withName = true }) {
  return (
    <span className="logo">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill="#12b76a" />
        <path d="M18 22h24a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V28a6 6 0 0 1 6-6z" fill="#0b1b14" />
        <path d="M18 22l20-8a4 4 0 0 1 5 4v4" fill="none" stroke="#0b1b14" strokeWidth="4" strokeLinejoin="round" />
        <circle cx="40" cy="35" r="4" fill="#12b76a" />
      </svg>
      {withName && <span className="logo-name">PayWallet</span>}
    </span>
  );
}