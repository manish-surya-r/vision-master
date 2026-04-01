export default function ExerciseCard({ exercise, onStart }) {
  return (
    <article className="card exercise-card">
      <span className="pill">Exercise {exercise.id}</span>
      <h3>{exercise.name}</h3>
      <p><strong>What it trains:</strong> {exercise.trains}</p>
      <p><strong>How to perform:</strong> {exercise.how}</p>
      <p><strong>Recommended distance:</strong> {exercise.distance}</p>
      <p><strong>Eyes used:</strong> {exercise.eyes}</p>
      {onStart && <button className="btn secondary" onClick={onStart}>Start From Here</button>}
    </article>
  )
}
