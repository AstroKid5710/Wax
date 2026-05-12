import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { getTasks, getTaskById } from '../lib/notion'
import { CLASS_CONFIG } from '../lib/constants'

const WORK_SECS = 25 * 60
const BREAK_SECS = 5 * 60
const POMODOROS_PER_SET = 4

function BigVinyl({ isSpinning, timeStr }) {
  return (
    <div className="relative" style={{ width: 224, height: 224 }}>
      {/* Spinning disc */}
      <div
        className="absolute inset-0"
        style={{
          animation: 'vinyl-spin 4s linear infinite',
          animationPlayState: isSpinning ? 'running' : 'paused',
        }}
      >
        <svg width="224" height="224" viewBox="0 0 224 224" aria-hidden="true">
          <circle cx="112" cy="112" r="111" fill="#1C1C1A" />
          <circle cx="112" cy="112" r="102" fill="none" stroke="#2a2a28" strokeWidth="1.5" />
          <circle cx="112" cy="112" r="90"  fill="none" stroke="#2a2a28" strokeWidth="1.5" />
          <circle cx="112" cy="112" r="78"  fill="none" stroke="#2a2a28" strokeWidth="1.5" />
          <circle cx="112" cy="112" r="66"  fill="none" stroke="#2a2a28" strokeWidth="1.5" />
          <circle cx="112" cy="112" r="54"  fill="none" stroke="#2a2a28" strokeWidth="1.5" />
          <circle cx="112" cy="112" r="42"  fill="none" stroke="#2a2a28" strokeWidth="1.5" />
          {/* Center label */}
          <circle cx="112" cy="112" r="30" fill="#FAF7F2" />
          {/* Spindle hole */}
          <circle cx="112" cy="112" r="3.5" fill="#1C1C1A" />
        </svg>
      </div>

      {/* Time — always upright, overlaid on center label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className="font-mono font-bold tracking-tight select-none"
          style={{ fontSize: 20, color: '#1C1C1A', lineHeight: 1 }}
        >
          {timeStr}
        </span>
      </div>
    </div>
  )
}

export default function Focus({ task: initialTask, allTasks }) {
  const router = useRouter()
  const [task, setTask] = useState(initialTask)
  const [mode, setMode] = useState('work')
  const [timeLeft, setTimeLeft] = useState(WORK_SECS)
  const [isRunning, setIsRunning] = useState(false)
  const [pomodorosDone, setPomodorosDone] = useState(0)
  const intervalRef = useRef(null)

  const cfg = task
    ? (CLASS_CONFIG[task.class] || { color: '#78716C', light: '#F5F5F4', dark: '#44403C' })
    : { color: '#78716C', light: '#F5F5F4', dark: '#44403C' }

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setIsRunning(false)
            if (mode === 'work') {
              setPomodorosDone(d => d + 1)
              setMode('break')
              return BREAK_SECS
            } else {
              setMode('work')
              return WORK_SECS
            }
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning, mode])

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')

  const reset = () => {
    setIsRunning(false)
    setTimeLeft(mode === 'work' ? WORK_SECS : BREAK_SECS)
  }

  const skip = () => {
    setIsRunning(false)
    if (mode === 'work') {
      setPomodorosDone(d => d + 1)
      setMode('break')
      setTimeLeft(BREAK_SECS)
    } else {
      setMode('work')
      setTimeLeft(WORK_SECS)
    }
  }

  const markDone = async () => {
    if (!task) return
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Done' }),
    })
    router.push('/')
  }

  const dotsInSet = pomodorosDone % POMODOROS_PER_SET

  return (
    <>
      <Head>
        <title>Focus · Wax</title>
      </Head>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAF7F2' }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </Link>

          <div className="flex items-center gap-2">
            <span
              className="text-xs font-medium uppercase tracking-widest"
              style={{ color: mode === 'work' ? cfg.color : '#A8A29E' }}
            >
              {mode === 'work' ? 'Focus' : 'Break'}
            </span>
            {task?.class && (
              <span
                className="text-xs px-2 py-0.5 rounded font-medium"
                style={{ color: cfg.color, background: cfg.light }}
              >
                {task.class}
              </span>
            )}
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col items-center justify-center gap-7 px-6 pb-12">

          {/* Task name or picker */}
          {task ? (
            <div className="text-center max-w-xs">
              <p className="font-serif text-2xl font-medium text-stone-800 leading-snug">
                {task.name}
              </p>
              {task.dueDate && (
                <p className="text-xs text-stone-400 mt-1">due {task.dueDate}</p>
              )}
            </div>
          ) : (
            <div className="w-full max-w-sm">
              <p className="text-sm text-stone-400 mb-3 text-center">Pick a task to focus on</p>
              <div className="space-y-2">
                {allTasks.length === 0 ? (
                  <p className="text-sm text-stone-400 text-center py-4">No active tasks!</p>
                ) : (
                  allTasks.slice(0, 6).map(t => {
                    const tcfg = CLASS_CONFIG[t.class] || { color: '#78716C', light: '#F5F5F4' }
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTask(t)}
                        className="w-full text-left px-4 py-3 bg-white rounded-xl border border-stone-200 hover:border-stone-300 transition-colors flex items-center gap-3"
                      >
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tcfg.color }} />
                        <span className="text-sm text-stone-800 flex-1">{t.name}</span>
                        {t.class && (
                          <span className="text-xs" style={{ color: tcfg.color }}>{t.class}</span>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* Vinyl */}
          <BigVinyl isSpinning={isRunning} timeStr={`${mm}:${ss}`} />

          {/* Pomodoro dots */}
          <div className="flex items-center gap-2">
            {Array.from({ length: POMODOROS_PER_SET }).map((_, i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                style={{ background: i < dotsInSet ? cfg.color : '#E7E5E4' }}
              />
            ))}
            {pomodorosDone >= POMODOROS_PER_SET && (
              <span className="text-xs text-stone-400 ml-1">
                {Math.floor(pomodorosDone / POMODOROS_PER_SET)} set{Math.floor(pomodorosDone / POMODOROS_PER_SET) > 1 ? 's' : ''} done
              </span>
            )}
          </div>

          {/* Play / pause */}
          <button
            onClick={() => setIsRunning(r => !r)}
            className="flex items-center justify-center w-16 h-16 rounded-full text-white transition-all shadow-sm hover:shadow-md active:scale-95"
            style={{ background: cfg.color }}
            aria-label={isRunning ? 'Pause' : 'Start'}
          >
            {isRunning ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                <rect x="4.5" y="3.5" width="4" height="13" rx="1.5" />
                <rect x="11.5" y="3.5" width="4" height="13" rx="1.5" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                <path d="M5.5 3.5l12 6.5-12 6.5V3.5z" />
              </svg>
            )}
          </button>

          {/* Reset / Skip */}
          <div className="flex items-center gap-6">
            <button
              onClick={reset}
              className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={skip}
              className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
            >
              Skip {mode === 'work' ? '→ break' : '→ focus'}
            </button>
          </div>

          {/* Mark done */}
          {task && (
            <button
              onClick={markDone}
              className="text-sm text-stone-400 hover:text-stone-700 transition-colors border border-stone-200 hover:border-stone-300 px-4 py-2 rounded-lg"
            >
              ✓ Mark as done
            </button>
          )}

        </div>
      </div>
    </>
  )
}

export async function getServerSideProps({ query }) {
  try {
    const { id } = query
    if (id) {
      const [task, tasks] = await Promise.all([getTaskById(id), getTasks()])
      return {
        props: {
          task,
          allTasks: tasks.filter(t => t.status !== 'Done'),
        },
      }
    }
    const tasks = await getTasks()
    return { props: { task: null, allTasks: tasks.filter(t => t.status !== 'Done') } }
  } catch {
    return { props: { task: null, allTasks: [] } }
  }
}
