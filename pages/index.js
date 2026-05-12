import { useState, useCallback } from 'react'
import Link from 'next/link'
import Layout, { useModal } from '../components/Layout'
import ClassCard from '../components/ClassCard'
import TaskItem from '../components/TaskItem'
import QuickAdd from '../components/QuickAdd'
import { getTasks } from '../lib/notion'
import { CLASS_NAMES, CLASS_CONFIG } from '../lib/constants'

// ─── Stat helpers ────────────────────────────────────────────────

function calcStreak(tasks, todayISO) {
  if (!todayISO) return 0
  let streak = 0
  const d = new Date(todayISO + 'T12:00:00')
  while (streak < 365) {
    const iso = d.toISOString().split('T')[0]
    const hasDone = tasks.some(t => t.dueDate?.split('T')[0] === iso && t.status === 'Done')
    if (!hasDone) break
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

function getWeekDone(tasks, todayISO) {
  if (!todayISO) return 0
  const d = new Date(todayISO + 'T12:00:00')
  const weekStart = new Date(d)
  weekStart.setDate(d.getDate() - d.getDay())
  const weekStartISO = weekStart.toISOString().split('T')[0]
  return tasks.filter(t => {
    if (t.status !== 'Done' || !t.dueDate) return false
    const td = t.dueDate.split('T')[0]
    return td >= weekStartISO && td <= todayISO
  }).length
}

function getLast7(tasks, todayISO) {
  if (!todayISO) return []
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(todayISO + 'T12:00:00')
    d.setDate(d.getDate() - (6 - i))
    const iso = d.toISOString().split('T')[0]
    const label = d.toLocaleDateString('en-US', { weekday: 'short' })
    const count = tasks.filter(t => t.dueDate?.split('T')[0] === iso && t.status === 'Done').length
    return { iso, label, count, isToday: iso === todayISO }
  })
}

// ─── Side A Complete helpers ──────────────────────────────────────

function getSideColor(winRate) {
  if (winRate >= 100) return '#4A7C10'  // deep green
  if (winRate >= 60)  return '#BA7517'  // amber
  return '#B03A2E'                       // red
}

function getSideMessage(winRate, carried, doneTodayCount) {
  if (doneTodayCount === 0 && carried === 0) return "Nothing due today. Clean slate."
  if (doneTodayCount === 0) return "The needle hasn't dropped yet today."
  if (carried === 0)        return "Everything's waxed. Go get some rest."
  if (winRate >= 80)        return `Solid session. ${carried} track${carried !== 1 ? 's' : ''} carried forward.`
  if (winRate >= 50)        return `Decent cut. ${carried} still on the table.`
  return "Rough session. Heavy backlog on deck."
}

// ─── Widgets ─────────────────────────────────────────────────────

function DueTodayWidget({ tasks, todayISO }) {
  const dueToday = tasks.filter(t => t.dueDate?.split('T')[0] === todayISO && t.status !== 'Done')

  return (
    <div className="wax-card p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">Due Today</p>
        <div className="flex items-center gap-2">
          {dueToday.length > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
              {dueToday.length}
            </span>
          )}
          <Link href="/daily" className="text-xs text-stone-400 hover:text-stone-700 transition-colors">
            View →
          </Link>
        </div>
      </div>

      {dueToday.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-3">
          <p className="text-sm text-stone-400">All clear ✓</p>
        </div>
      ) : (
        <div className="space-y-2">
          {dueToday.slice(0, 5).map(t => {
            const cfg = CLASS_CONFIG[t.class] || { color: '#78716C' }
            return (
              <div key={t.id} className="flex items-center gap-2.5 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                <span className="text-sm text-stone-700 flex-1 truncate">{t.name}</span>
                {t.class && (
                  <span className="text-xs flex-shrink-0 font-medium" style={{ color: cfg.color }}>
                    {t.class}
                  </span>
                )}
              </div>
            )
          })}
          {dueToday.length > 5 && (
            <p className="text-xs text-stone-400 pl-4">+{dueToday.length - 5} more</p>
          )}
        </div>
      )}
    </div>
  )
}

function StatsWidget({ tasks, todayISO }) {
  const streak   = calcStreak(tasks, todayISO)
  const weekDone = getWeekDone(tasks, todayISO)
  const totalDone = tasks.filter(t => t.status === 'Done').length

  return (
    <div className="wax-card p-4 flex flex-col">
      <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-4">Stats</p>

      <div className="flex-1 flex flex-col justify-center gap-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center">
            <div className="font-serif text-4xl font-medium text-stone-800 leading-none mb-1">
              {streak}
            </div>
            <div className="text-xs text-stone-400">
              {streak === 1 ? 'day streak' : 'day streak'}
            </div>
          </div>

          <div className="text-center" style={{ borderLeft: '1px solid #F0EDE8' }}>
            <div className="font-serif text-4xl font-medium text-stone-800 leading-none mb-1">
              {weekDone}
            </div>
            <div className="text-xs text-stone-400">this week</div>
          </div>
        </div>

        <div className="text-center pt-3" style={{ borderTop: '1px solid #F0EDE8' }}>
          <span className="text-xs text-stone-400">{totalDone} total closed</span>
        </div>
      </div>
    </div>
  )
}

function WeeklyBarWidget({ tasks, todayISO }) {
  const last7 = getLast7(tasks, todayISO)
  const maxCount = Math.max(...last7.map(d => d.count), 1)

  return (
    <div className="wax-card p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">This Week</p>
        <p className="text-xs text-stone-400">
          {last7.reduce((s, d) => s + d.count, 0)} closed
        </p>
      </div>

      <div className="flex items-end gap-1.5" style={{ height: 72 }}>
        {last7.map(day => {
          const heightPct = Math.max((day.count / maxCount) * 100, day.count > 0 ? 8 : 0)
          return (
            <div key={day.iso} className="flex-1 flex flex-col items-center justify-end gap-1.5" style={{ height: '100%' }}>
              {/* Count above bar */}
              <div className="text-[10px] font-medium" style={{ color: day.isToday ? '#1C1C1A' : '#C4C0BB', minHeight: 14 }}>
                {day.count > 0 ? day.count : ''}
              </div>

              {/* Bar */}
              <div className="w-full relative rounded-sm overflow-hidden" style={{ height: 44 }}>
                {/* Track (empty) */}
                <div className="absolute inset-0 rounded-sm" style={{ background: '#F5F3EF' }} />
                {/* Fill */}
                <div
                  className="absolute bottom-0 w-full rounded-sm transition-all duration-500"
                  style={{
                    height: `${heightPct}%`,
                    background: day.isToday ? '#1C1C1A' : day.count > 0 ? '#C4C0BB' : 'transparent',
                  }}
                />
              </div>

              {/* Day label */}
              <span
                className="text-[10px] font-medium"
                style={{ color: day.isToday ? '#1C1C1A' : '#C4C0BB' }}
              >
                {day.label.charAt(0)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Side A Complete overlay ──────────────────────────────────────

function SideCompleteOverlay({ tasks, todayISO, dateStr, onClose }) {
  const dueToday      = tasks.filter(t => t.dueDate?.split('T')[0] === todayISO)
  const doneTodayCount = dueToday.filter(t => t.status === 'Done').length
  const carried       = tasks.filter(t => {
    if (!t.dueDate || t.status === 'Done') return false
    return t.dueDate.split('T')[0] <= todayISO
  }).length
  const totalDue  = dueToday.length
  const winRate   = totalDue > 0 ? Math.round((doneTodayCount / totalDue) * 100) : 100
  const color     = getSideColor(winRate)
  const message   = getSideMessage(winRate, carried, doneTodayCount)
  const subtext   = carried === 0 ? 'No remaining tracks' : `${carried} track${carried !== 1 ? 's' : ''} remaining`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: '#111110' }}
      onClick={onClose}
    >
      {/* Subtle horizontal groove lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(255,255,255,0.022) 11px, rgba(255,255,255,0.022) 12px)',
        }}
      />

      {/* Content — stop click propagation so clicking content doesn't close */}
      <div
        className="relative text-center px-8 max-w-sm w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Eyebrow */}
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.22em] mb-8"
          style={{ color: 'rgba(255,255,255,0.20)' }}
        >
          End of Day Report
        </p>

        {/* Big headline */}
        <div className="font-serif leading-none tracking-tight mb-2" style={{ color }}>
          <div className="text-[64px] font-medium">Wax</div>
          <div className="text-[64px] font-medium">Sealed</div>
        </div>

        {/* Date */}
        <p
          className="text-[11px] uppercase tracking-[0.15em] mt-5 mb-10"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          {dateStr} · Session complete
        </p>

        {/* Stats */}
        <div className="flex items-stretch mb-8">
          {[
            { value: doneTodayCount, label: 'Closed Today' },
            { value: carried,        label: 'Carried Forward' },
            { value: `${winRate}%`,  label: "Today's Cut" },
          ].map((s, i) => (
            <div key={i} className="flex-1 text-center" style={{
              borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none',
            }}>
              <div className="text-3xl font-mono font-bold mb-1.5" style={{ color }}>
                {s.value}
              </div>
              <div
                className="text-[9px] uppercase tracking-[0.15em]"
                style={{ color: 'rgba(255,255,255,0.22)' }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic message */}
        <p className="text-sm font-medium mb-2" style={{ color }}>
          {message}
        </p>
        <p className="text-xs mb-14" style={{ color: 'rgba(255,255,255,0.18)' }}>
          {subtext}
        </p>

        {/* Dismiss */}
        <button
          onClick={onClose}
          className="text-[10px] uppercase tracking-[0.18em] transition-opacity hover:opacity-60"
          style={{ color: 'rgba(255,255,255,0.18)' }}
        >
          Back to dashboard
        </button>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────

function DashboardContent({ initialTasks, todayISO, dateStr }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [showSideComplete, setShowSideComplete] = useState(false)
  const { openModal } = useModal()

  const upcoming = tasks
    .filter(t => t.status !== 'Done' && t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 8)

  const backlog = tasks.filter(t => t.status !== 'Done' && !t.dueDate)

  const handleStatusChange = async (id, status) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    }
  }

  return (
    <>
      <div className="space-y-5">

        {/* Quick Add */}
        <QuickAdd
          onParsed={(parsed) => openModal(parsed)}
          onManual={(text) => openModal({ name: text })}
        />

        {/* Widgets row */}
        <div className="grid grid-cols-2 gap-2.5">
          <DueTodayWidget tasks={tasks} todayISO={todayISO} />
          <StatsWidget    tasks={tasks} todayISO={todayISO} />
        </div>

        {/* Weekly bar */}
        <WeeklyBarWidget tasks={tasks} todayISO={todayISO} />

        {/* Class cards */}
        <section>
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">
            Classes
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {CLASS_NAMES.map(cn => (
              <ClassCard
                key={cn}
                className={cn}
                tasks={tasks.filter(t => t.class === cn)}
              />
            ))}
          </div>
        </section>

        {/* Upcoming */}
        <section>
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">
            Upcoming
          </p>
          {upcoming.length === 0 ? (
            <p className="text-sm text-stone-400 py-4 text-center">Nothing due — nice!</p>
          ) : (
            <div className="space-y-1.5">
              {upcoming.map(task => (
                <TaskItem key={task.id} task={task} onStatusChange={handleStatusChange} />
              ))}
            </div>
          )}
        </section>

        {/* Backlog */}
        {backlog.length > 0 && (
          <section>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">
              Backlog — {backlog.length}
            </p>
            <div className="space-y-1.5">
              {backlog.map(task => (
                <TaskItem key={task.id} task={task} onStatusChange={handleStatusChange} />
              ))}
            </div>
          </section>
        )}

        {/* Wrap up button */}
        <div className="flex justify-center pt-4 pb-2">
          <button
            onClick={() => setShowSideComplete(true)}
            className="flex items-center gap-2 text-xs text-stone-400 hover:text-stone-700 transition-colors group"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.25" />
              <circle cx="7" cy="7" r="2.5" fill="currentColor" />
            </svg>
            Wrap up the day
          </button>
        </div>

      </div>

      {/* Side A Complete overlay */}
      {showSideComplete && (
        <SideCompleteOverlay
          tasks={tasks}
          todayISO={todayISO}
          dateStr={dateStr}
          onClose={() => setShowSideComplete(false)}
        />
      )}
    </>
  )
}

export default function Dashboard({ initialTasks, todayISO, dateStr }) {
  const [tasks, setTasks] = useState(initialTasks)

  const handleTaskAdded = useCallback((newTask) => {
    setTasks(prev => [newTask, ...prev])
  }, [])

  return (
    <Layout onTaskAdded={handleTaskAdded}>
      <DashboardContent initialTasks={tasks} todayISO={todayISO} dateStr={dateStr} />
    </Layout>
  )
}

export async function getServerSideProps() {
  try {
    const tasks = await getTasks()
    const now = new Date()
    const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    return { props: { initialTasks: tasks, todayISO, dateStr } }
  } catch {
    return { props: { initialTasks: [], todayISO: '', dateStr: 'Today' } }
  }
}
