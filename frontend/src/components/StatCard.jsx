export default function StatCard({ label, value, sub, icon: Icon, color = "var(--accent)" }) {
  return (
    <article className="stat-card" style={{ "--stat-color": color }}>
      {Icon ? (
        <div className="stat-icon" aria-hidden="true">
          <Icon />
        </div>
      ) : null}
      <span>{label}</span>
      <strong>{value}</strong>
      {sub ? <small>{sub}</small> : null}
    </article>
  );
}
