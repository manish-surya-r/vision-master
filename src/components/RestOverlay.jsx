export default function RestOverlay({ secondsLeft }) {
  if (secondsLeft <= 0) return null
  return (
    <div className="rest-overlay">
      <div className="card rest-card">
        <h3>Rest Screen</h3>
        <p>Blink naturally, relax your gaze, and take a calm breath.</p>
        <p><strong>{secondsLeft}s</strong> until next exercise</p>
      </div>
    </div>
  )
}
