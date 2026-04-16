function ResultBox({ isVisible, title, message }) {
  if (!isVisible) return null

  return (
    <section className="result-box">
      <div>
        <p className="result-label">Resultado final</p>
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </section>
  )
}

export default ResultBox