import { useState, useCallback } from 'react'
import Layout from '../components/Layout'
import TaskItem from '../components/TaskItem'
import { getTasks } from '../lib/notion'
import { isOverdue, isToday, isTomorrow, isThisWeek, formatDate } from '../lib/dates'

function groupByDeadline(tasks) {
  const active = tasks.filter(t => t.status !== 'Done' && t.dueDate)
  const noDue = tasks.filter(t => t.status !== 'Done' && !t.dueDate)

  const overdue = active.filter(t => isOverdue(t.dueDate, t.status))
  const today = active.filter(t => isToday(t.dueDate))
  const tomorrow = active.filter(t => isTomorrow(t.dueDate))
  const thisWeek = active.filter(t =>
    !isOverdue(t.dueDate, t.status) && !isToday(t.dueDate) && !isTomorrow(t.dueDate) && isThisWeek(t.dueDate)
  )
  const later = active.filter(t => !isThisWeek(t.dueDate) && !isOverdue(t.dueDate, t.status))

  return { overdue, today, tomorrow, thisWeek, later, noDue }
}

function DeadlineGroup({ title, tasks, onStatusChange, accent }) {
  if (tasks.length === 0) return null
  return (
    <section>
      <p
        className="text-xs font-medium uppercase tracking-wider mb-2"
        style={{ color: accent || '#A8A29E' }}
      >
        {title} — {tasks.length}
      </p>
      <div className="space-y-1.5">
        {tasks.map(task => (
          <TaskItem key={task.id} task={task} onStatusChange={onStatusChange} />
        ))}
      </div>
    </section>
  )
}

export default function Deadlines({ initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks)

  const groups = groupByDeadline(tasks)

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

  const handleTaskAdded = useCallback((newTask) => {
    setTasks(prev => [newTask, ...prev])
  }, [])

  const totalActive = tasks.filter(t => t.status !== 'Done').length

  return (
    <Layout onTaskAdded={handleTaskAdded}>
      <div className="space-y-6">

        <div>
          <h1 className="font-serif text-2xl font-medium text-stone-800">Deadlines</h1>
          <p className="text-sm text-stone-400 mt-0.5">{totalActive} active task{totalActive !== 1 ? 's' : ''}</p>
        </div>

        <DeadlineGroup
          title="Overdue"
          tasks={groups.overdue}
          onStatusChange={handleStatusChange}
          accent="#DC2626"
        />
        <DeadlineGroup
          title="Today"
          tasks={groups.today}
          onStatusChange={handleStatusChange}
          accent="#B45309"
        />
        <DeadlineGroup
          title="Tomorrow"
          tasks={groups.tomorrow}
          onStatusChange={handleStatusChange}
          accent="#B45309"
        />
        <DeadlineGroup
          title="This week"
          tasks={groups.thisWeek}
          onStatusChange={handleStatusChange}
          accent="#639922"
        />
        <DeadlineGroup
          title="Later"
          tasks={groups.later}
          onStatusChange={handleStatusChange}
        />
        <DeadlineGroup
          title="No date"
          tasks={groups.noDue}
          onStatusChange={handleStatusChange}
        />

        {totalActive === 0 && (
          <p className="text-sm text-stone-400 py-8 text-center">All clear!</p>
        )}

      </div>
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
