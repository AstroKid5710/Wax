import { useState, useCallback } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import { getTasks } from '../lib/notion'
import { CLASS_CONFIG } from '../lib/constants'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function isoDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function buildGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function CalendarContent({ initialTasks }) {
  const now = new Date()
  const [current, setCurrent] = useState(new Date(now.getFullYear(), now.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState(null)

  const year = current.getFullYear()
  const month = current.getMonth()
  const cells = buildGrid(year, month)

  const todayIso = isoDate(now.getFullYear(), now.getMonth(), now.getDate())

  // Group tasks by date key (YYYY-MM-DD)
  const byDate = {}
  initialTasks.forEach(t => {
    if (!t.dueDate) return
    const key = t.dueDate.split('T')[0]
    if (!byDate[key]) byDate[key] = []
    byDate[key].push(t)
  })

  const prevMonth = () => { setCurrent(new Date(year, month - 1, 1)); setSelectedDay(null) }
  const nextMonth = () => { setCurrent(new Date(year, month + 1, 1)); setSelectedDay(null) }
  const goToday = () => {
    setCurrent(new Date(now.getFullYear(), now.getMonth(), 1))
    setSelectedDay(now.getDate())
  }

  const selectedIso = selectedDay ? isoDate(year, month, selectedDay) : null
  const selectedTasks = selectedIso ? (byDate[selectedIso] || []) : []
  const selectedLabel = selectedDay
    ? new Date(year, month, selectedDay).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      })
    : null

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium text-stone-800">
          {MONTH_NAMES[month]} {year}
        </h1>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="wax-btn wax-btn-ghost px-2.5">←</button>
          <button onClick={goToday} className="wax-btn wax-btn-ghost text-xs">Today</button>
          <button onClick={nextMonth} className="wax-btn wax-btn-ghost px-2.5">→</button>
        </div>
      </div>

      {/* Grid */}
      <div className="wax-card overflow-hidden">
        {/* Day header row */}
        <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50">
          {DAY_LABELS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-medium text-stone-400 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) {
              return (
                <div
                  key={`e-${i}`}
                  className="h-[72px] border-b border-r border-stone-100 bg-stone-50/40 last:border-r-0"
                  style={{ borderRight: (i + 1) % 7 === 0 ? 'none' : undefined }}
                />
              )
            }

            const iso = isoDate(year, month, day)
            const dayTasks = byDate[iso] || []
            const isToday = iso === todayIso
            const isSelected = day === selectedDay
            const isWeekend = i % 7 === 0 || i % 7 === 6

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                className={`h-[72px] p-2 text-left transition-colors border-b border-stone-100 hover:bg-cream-dark/60
                  ${isSelected ? 'bg-cream-dark' : isWeekend ? 'bg-stone-50/60' : ''}
                `}
                style={{ borderRight: (i + 1) % 7 === 0 ? 'none' : '1px solid #f5f4f0' }}
              >
                {/* Day number */}
                <div
                  className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 transition-colors ${
                    isToday
                      ? 'bg-stone-800 text-cream'
                      : isSelected
                      ? 'bg-stone-200 text-stone-800'
                      : 'text-stone-500'
                  }`}
                >
                  {day}
                </div>

                {/* Task indicators */}
                <div className="flex flex-wrap gap-0.5">
                  {dayTasks.slice(0, 5).map((t, ti) => {
                    const cfg = CLASS_CONFIG[t.class] || { color: '#78716C' }
                    const isDone = t.status === 'Done'
                    return (
                      <div
                        key={ti}
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: isDone ? '#D6D3CD' : cfg.color }}
                        title={t.name}
                      />
                    )
                  })}
                  {dayTasks.length > 5 && (
                    <span className="text-[9px] text-stone-400 leading-none self-end">
                      +{dayTasks.length - 5}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(CLASS_CONFIG).map(([name, cfg]) => (
          <div key={name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
            <span className="text-xs text-stone-500">{name}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-stone-300" />
          <span className="text-xs text-stone-400">Done</span>
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div>
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">
            {selectedLabel} · {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}
          </p>

          {selectedTasks.length === 0 ? (
            <div className="wax-card px-5 py-8 text-center">
              <div className="text-2xl mb-2">○</div>
              <p className="text-sm text-stone-400">Nothing due this day.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {selectedTasks.map(task => {
                const cfg = CLASS_CONFIG[task.class] || { color: '#78716C', light: '#F5F5F4' }
                const isDone = task.status === 'Done'
                return (
                  <div
                    key={task.id}
                    className="wax-card px-4 py-3 flex items-center gap-3"
                    style={{ opacity: isDone ? 0.6 : 1 }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: isDone ? '#D6D3CD' : cfg.color }}
                    />
                    <span className={`flex-1 text-sm ${isDone ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                      {task.name}
                    </span>
                    {task.class && (
                      <span
                        className="text-xs px-2 py-0.5 rounded font-medium flex-shrink-0"
                        style={{ color: cfg.color, background: cfg.light }}
                      >
                        {task.class}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${
                      isDone ? 'text-stone-400 bg-stone-100' :
                      task.status === 'In progress' ? 'text-amber-700 bg-amber-50' :
                      'text-stone-400 bg-stone-100'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function CalendarPage({ initialTasks }) {
  // eslint-disable-next-line no-unused-vars
  const handleTaskAdded = useCallback(() => {}, [])

  return (
    <Layout onTaskAdded={handleTaskAdded}>
      <Head><title>Calendar · Wax</title></Head>
      <CalendarContent initialTasks={initialTasks} />
    </Layout>
  )
}

export async function getServerSideProps() {
  try {
    const tasks = await getTasks()
    return { props: { initialTasks: tasks } }
  } catch {
    return { props: { initialTasks: [] } }
  }
}
