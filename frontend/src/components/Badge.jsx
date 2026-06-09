const statusColors = {
  PENDING: "var(--gold)",
  ACCEPTED: "var(--accent)",
  FUNDED: "var(--purple)",
  SUBMITTED: "var(--coral)",
  APPROVED: "var(--accent)",
  DISPUTED: "var(--danger)",
  REJECTED: "var(--danger)",
  COMPLETED: "var(--muted)",
  PROCESSING: "var(--purple)",
};

export default function Badge({ children, tone, color }) {
  const badgeColor = color || statusColors[tone] || "var(--accent)";
  return (
    <span className="badge" style={{ "--badge-color": badgeColor }}>
      {children}
    </span>
  );
}
