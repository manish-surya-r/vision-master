import { useEffect, useMemo, useState } from 'react'
import ExerciseCard from './components/ExerciseCard'
import ProgressBar from './components/ProgressBar'
import RestOverlay from './components/RestOverlay'
import { EXERCISES, symptomKeys } from './data/exercises'

const pages = ['home', 'library', 'session', 'progress', 'science']
const defaultProgress = { sessions: 0, streak: 0, lastDate: null, totalMinutes: 0, symptomHistory: [] }

function loadProgress() {
  const raw = localStorage.getItem('vision_master_progress')
  if (!raw) return defaultProgress
  try {
    return { ...defaultProgress, ...JSON.parse(raw) }
  } catch {
    return defaultProgress
  }
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default function App() {
  const [activePage, setActivePage] = useState('home')
  const [progress, setProgress] = useState(loadProgress)
  const [sessionIndex, setSessionIndex] = useState(0)
  const [sessionStart, setSessionStart] = useState(null)
  const [completedSteps, setCompletedSteps] = useState([])
  const [cueVisible, setCueVisible] = useState(false)
  const [mode, setMode] = useState('both')
  const [restSeconds, setRestSeconds] = useState(0)
  const [summary, setSummary] = useState(null)
  const [symptoms, setSymptoms] = useState({ strain: 3, blur: 3, headache: 3, dryness: 3, comfort: 3 })

  useEffect(() => {
    localStorage.setItem('vision_master_progress', JSON.stringify(progress))
  }, [progress])

  useEffect(() => {
    if (restSeconds <= 0) return
    const timer = setInterval(() => setRestSeconds((s) => s - 1), 1000)
    return () => clearInterval(timer)
  }, [restSeconds])

  const currentExercise = EXERCISES[sessionIndex]
  const sessionProgress = ((sessionIndex + 1) / EXERCISES.length) * 100

  const averages = useMemo(() => {
    if (!progress.symptomHistory.length) return null
    const totals = symptomKeys.reduce((acc, key) => ({ ...acc, [key]: 0 }), {})
    progress.symptomHistory.forEach((entry) => {
      symptomKeys.forEach((key) => {
        totals[key] += Number(entry[key] || 0)
      })
    })
    const count = progress.symptomHistory.length
    return symptomKeys.reduce((acc, key) => ({ ...acc, [key]: (totals[key] / count).toFixed(1) }), {})
  }, [progress.symptomHistory])

  const startSession = (index = 0) => {
    setActivePage('session')
    setSessionIndex(index)
    setSessionStart(Date.now())
    setCompletedSteps([])
    setCueVisible(false)
    setMode('both')
    setRestSeconds(0)
    setSummary(null)
  }

  const markComplete = () => {
    setCompletedSteps((prev) => (prev.includes(sessionIndex) ? prev : [...prev, sessionIndex]))
    setCueVisible(true)
    setTimeout(() => setCueVisible(false), 900)
  }

  const finishSession = () => {
    const elapsedMinutes = Math.max(1, Math.round((Date.now() - sessionStart) / 60000))
    const today = todayIso()
    setProgress((prev) => {
      const previousDate = prev.lastDate
      let streak = prev.streak || 0
      if (!previousDate) streak = 1
      else {
        const diff = Math.round((new Date(today) - new Date(previousDate)) / 86400000)
        if (diff === 1) streak += 1
        else if (diff > 1) streak = 1
      }
      return {
        ...prev,
        sessions: prev.sessions + 1,
        totalMinutes: prev.totalMinutes + elapsedMinutes,
        streak,
        lastDate: today,
      }
    })

    setSummary({ minutes: elapsedMinutes, completed: completedSteps.length, mode: mode === 'both' ? 'Both eyes' : 'Single eye' })
  }

  const nextExercise = () => {
    if (sessionIndex >= EXERCISES.length - 1) {
      finishSession()
      return
    }
    setRestSeconds(12)
    const delay = 12000
    setTimeout(() => {
      setSessionIndex((i) => i + 1)
    }, delay)
  }

  const saveSymptoms = (e) => {
    e.preventDefault()
    setProgress((prev) => ({
      ...prev,
      symptomHistory: [{ ...symptoms, date: todayIso() }, ...prev.symptomHistory].slice(0, 25),
    }))
    alert('Symptom check saved.')
  }

  return (
    <div className="app-shell">
      <header>
        <div className="container topbar">
          <div>
            <h1>Vision Master</h1>
            <p>Guided, research-inspired visual skills training on screen.</p>
          </div>
          <nav>
            {pages.map((page) => (
              <button key={page} className={`btn ${activePage === page ? 'active' : ''}`} onClick={() => setActivePage(page)}>
                {page[0].toUpperCase() + page.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="container main">
        {activePage === 'home' && (
          <section className="home-grid">
            <article className="card hero">
              <h2>Build visual comfort with calm, structured sessions.</h2>
              <p>
                Vision Master supports training for convergence, accommodation, tracking, scanning, attention,
                and overall visual comfort. This is educational training, not medical treatment.
              </p>
              <button className="btn primary" onClick={() => setActivePage('library')}>Quick Start</button>
            </article>
            <aside className="card stats">
              <div><strong>10</strong><span>Distinct exercises</span></div>
              <div><strong>{progress.sessions}</strong><span>Sessions completed</span></div>
              <div><strong>{progress.streak}</strong><span>Current streak</span></div>
            </aside>
          </section>
        )}

        {activePage === 'library' && (
          <section>
            <div className="section-head">
              <h2>Exercise Library</h2>
              <button className="btn primary" onClick={() => startSession(0)}>Start Session</button>
            </div>
            <div className="card-grid">
              {EXERCISES.map((exercise, idx) => (
                <ExerciseCard key={exercise.id} exercise={exercise} onStart={() => startSession(idx)} />
              ))}
            </div>
          </section>
        )}

        {activePage === 'session' && (
          <section>
            {!summary ? (
              <div className="session-grid">
                <article className="card">
                  <h2>{currentExercise.name}</h2>
                  <p><strong>What it trains:</strong> {currentExercise.trains}</p>
                  <p>{currentExercise.how}</p>
                  <p><strong>Distance:</strong> {currentExercise.distance}</p>
                  <div className="toggle-row">
                    <button className={`btn ${mode === 'both' ? 'active' : ''}`} onClick={() => setMode('both')}>Both eyes</button>
                    <button
                      className={`btn ${mode === 'single' ? 'active' : ''}`}
                      onClick={() => setMode('single')}
                      disabled={currentExercise.eyes === 'Both eyes'}
                    >
                      Single eye
                    </button>
                  </div>
                  <div className="target-area">
                    <div className="target-dot" style={{ transform: `translate(${Math.sin(sessionIndex + Date.now() / 1000) * 110}px, ${Math.cos(sessionIndex + Date.now() / 1300) * 35}px)` }} />
                  </div>
                  <p className={`cue ${cueVisible ? 'on' : ''}`}>✓ Step completed</p>
                </article>

                <aside className="card flow">
                  <p>Exercise {sessionIndex + 1} of {EXERCISES.length}</p>
                  <ProgressBar value={sessionProgress} />
                  <p className="small">Use smooth eye movement, natural blinking, and pause if discomfort increases.</p>
                  <button className="btn primary full" onClick={markComplete}>Mark Step Complete</button>
                  <button className="btn secondary full" onClick={nextExercise}>Next Exercise</button>
                </aside>
                <RestOverlay secondsLeft={restSeconds} />
              </div>
            ) : (
              <article className="card summary">
                <h2>Session Summary</h2>
                <p><strong>Completed exercises:</strong> {summary.completed} / {EXERCISES.length}</p>
                <p><strong>Time spent:</strong> {summary.minutes} minutes</p>
                <p><strong>Mode at finish:</strong> {summary.mode}</p>
                <div className="summary-actions">
                  <button className="btn secondary" onClick={() => setActivePage('progress')}>Go to Progress</button>
                  <button className="btn primary" onClick={() => startSession(0)}>Start New Session</button>
                </div>
                <form className="symptoms" onSubmit={saveSymptoms}>
                  <h3>Symptom Self-Check</h3>
                  {symptomKeys.map((key) => (
                    <label key={key}>
                      <span>{key[0].toUpperCase() + key.slice(1)}</span>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={symptoms[key]}
                        onChange={(e) => setSymptoms((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                      />
                      <span>{symptoms[key]}</span>
                    </label>
                  ))}
                  <button className="btn secondary" type="submit">Save Symptom Check</button>
                </form>
              </article>
            )}
          </section>
        )}

        {activePage === 'progress' && (
          <section className="card">
            <h2>Progress</h2>
            <div className="metric-grid">
              <div><strong>{progress.sessions}</strong><span>Session count</span></div>
              <div><strong>{progress.streak}</strong><span>Streak (days)</span></div>
              <div><strong>{progress.totalMinutes}</strong><span>Total minutes</span></div>
            </div>
            <h3>Symptom Feedback</h3>
            {averages ? (
              <ul className="feedback-list">
                {symptomKeys.map((key) => (
                  <li key={key}><span>{key}</span><strong>{averages[key]} / 5</strong></li>
                ))}
              </ul>
            ) : (
              <p>No symptom feedback yet. Complete a session and save your self-check.</p>
            )}
          </section>
        )}

        {activePage === 'science' && (
          <section className="card">
            <h2>Science</h2>
            <p className="small">
              These drills are research-informed training tasks for visual skills. They may help some people improve
              visual comfort or control, but outcomes vary. They are not a substitute for professional eye care.
            </p>
            <div className="card-grid">
              {EXERCISES.map((exercise) => (
                <article key={exercise.id} className="card exercise-card">
                  <h3>{exercise.name}</h3>
                  <p><strong>Trains:</strong> {exercise.trains}</p>
                  <p>{exercise.science}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="container footer">
        Disclaimer: Vision Master supports visual skills practice only. It does not diagnose, treat, or cure eye
        conditions and does not replace care from a licensed professional.
      </footer>
    </div>
  )
}
