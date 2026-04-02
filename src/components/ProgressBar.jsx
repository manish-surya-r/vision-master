export default function ProgressBar({ value }) {
  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={value} aria-valuemin="0" aria-valuemax="100">
      <span style={{ width: `${value}%` }} />
    </div>
  )
}
