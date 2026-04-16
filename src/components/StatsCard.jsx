function StatsCard({ label, value }) {
  return (
    <article className="stat-card">
      <span>{label}:</span>
      <h2>{value}</h2>
    </article>
  )
}

export default StatsCard