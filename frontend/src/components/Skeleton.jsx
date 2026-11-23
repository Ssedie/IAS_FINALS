export default function Skeleton({ width = '100%', height = 16, radius = 10, style }) {
  return <div className="skeleton" style={{ width, height, borderRadius: radius, ...style }} aria-hidden="true" />;
}

export function TxSkeletons({ count = 4 }) {
  return (
    <div role="status" aria-label="Loading transactions">
      {Array.from({ length: count }, (_, i) => (
        <div className="tx" key={i}>
          <Skeleton width={44} height={44} radius={14} />
          <div className="tx-main">
            <Skeleton width="55%" height={14} />
            <Skeleton width="30%" height={12} style={{ marginTop: 8 }} />
          </div>
          <Skeleton width={70} height={16} />
        </div>
      ))}
    </div>
  );
}