import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { getTasks } from '../lib/notion'
import { CLASS_CONFIG } from '../lib/constants'

// ——— Daily card — shown in both normal and clean mode ———
function DailyCard({ tasks, dateStr }) {
  const hasTasks = tasks.length > 0

  return (
    <div
      id="daily-card"
      className="rounded-2xl overflow-hidden bg-white"
      style={{
        border: '1.5px solid #E7E5E0',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        width: 340,
      }}
    >
      {/* Header */}
      <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid #F0EDE8' }}>
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400 mb-1">
          Daily Tasks
        </div>
        <div className="font-serif text-[22px] font-medium text-stone-800 leading-tight">
          {dateStr}
        </div>
        <div className="text-xs text-stone-400 mt-1">
          {hasTasks
            ? `${tasks.length} task${tasks.length !== 1 ? 's' : ''} due today`
            : 'Nothing due today'}
        </div>
      </div>

      {/* Task list */}
      <div className="px-5 py-3">
        {!hasTasks ? (
          <div className="py-6 text-center">
            <div className="text-2xl mb-1.5">✓</div>
            <p className="text-sm text-stone-400">All clear!</p>
          </div>
        ) : (
          <div>
            {tasks.map((t, i) => {
              const cfg = CLASS_CONFIG[t.class] || { color: '#78716C', light: '#F5F5F4' }
              const isDone = t.status === 'Done'
              const isLast = i === tasks.length - 1
              return (
                <div
                  key={t.id}
                  className="flex items-start gap-3 py-2.5"
                  style={{ borderBottom: isLast ? 'none' : '1px solid #F5F3EF' }}
                >
                  {/* Status ring */}
                  <div
                    className="flex-shrink-0 mt-0.5"
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: `2px solid ${isDone ? cfg.color : '#D6D3CD'}`,
                      backgroundColor: isDone ? cfg.color : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isDone && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  {/* Task info */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-medium leading-snug"
                      style={{
                        color: isDone ? '#A8A29E' : '#1C1C1A',
                        textDecoration: isDone ? 'line-through' : 'none',
                      }}
                    >
                      {t.name}
                    </div>
                    {t.class && (
                      <div
                        className="text-[11px] font-semibold mt-0.5 uppercase tracking-wide"
                        style={{ color: cfg.color }}
                      >
                        {t.class}
                      </div>
                    )}
                  </div>

                  {/* In progress badge */}
                  {t.status === 'In progress' && (
                    <div
                      className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded self-start"
                      style={{ color: '#92400E', background: '#FEF3C7' }}
                    >
                      In progress
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-6 py-2.5 flex items-center justify-between"
        style={{ borderTop: '1px solid #F0EDE8' }}
      >
        <span className="font-serif text-xs italic text-stone-300">Wax</span>
        <span className="text-[10px] text-stone-300 uppercase tracking-wider">for Structured</span>
      </div>
    </div>
  )
}

// ——— Page ———
export default function DailyPage({ tasks, dateStr }) {
  const [clean, setClean] = useState(false)

  return (
    <>
      <Head><title>Today · Wax</title></Head>

      {clean ? (
        /* Clean / screenshot mode — no chrome */
        <div
          className="min-h-screen flex flex-col items-center justify-center"
          style={{ backgroundColor: '#FAF7F2' }}
        >
          <DailyCard tasks={tasks} dateStr={dateStr} />
          <button
            onClick={() => setClean(false)}
            className="mt-5 text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            ← Exit clean view
          </button>
        </div>
      ) : (
        /* Normal mode */
        <div className="min-h-screen" style={{ backgroundColor: '#FAF7F2' }}>
          {/* Nav bar */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid #E7E5E0' }}
          >
            <Link href="/" className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </Link>
            <span className="font-serif text-base font-medium text-stone-700">Today</span>
            <button
              onClick={() => setClean(true)}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
              style={{ background: '#1C1C1A', color: '#FAF7F2' }}
            >
              Clean view →
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col items-center px-4 py-10 gap-5">
            {/* Instruction hint */}
            <p className="text-xs text-stone-400 text-center max-w-xs">
              Hit <strong className="text-stone-500 font-medium">Clean view</strong> to hide the chrome,
              then screenshot the card below to import into Structured.
            </p>

            <DailyCard tasks={tasks} dateStr={dateStr} />

            {/* If there are tasks due tomorrow, show a preview toggle */}
            {tasks.length > 0 && (
              <p className="text-xs text-stone-300">
                Tasks are pulled live from Notion
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export async function getServerSideProps() {
  try {
    const now = new Date()
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })

    const allTasks = await getTasks()

    // Today's tasks + any overdue (not done) tasks
    const tasks = allTasks.filter(t => {
      if (t.status === 'Done') return false
      if (!t.dueDate) return false
      const d = t.dueDate.split('T')[0]
      return d <= todayIso
    })

    // Sort: overdue first, then by class
    tasks.sort((a, b) => {
      const da = a.dueDate.split('T')[0]
      const db = b.dueDate.split('T')[0]
      if (da !== db) return da < db ? -1 : 1
      return (a.class || '').localeCompare(b.class || '')
    })

    return { props: { tasks, dateStr } }
  } catch {
    const now = new Date()
    return {
      props: {
        tasks: [],
        dateStr: now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      },
    }
  }
}
