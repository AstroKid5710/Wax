import { useState, useCallback } from 'react'
import Layout from '../components/Layout'
import TaskItem from '../components/TaskItem'
import { getTasks } from '../lib/notion'
import { CLASS_NAMES, CLASS_CONFIG } from '../lib/constants'

const STATUS_FILTERS = ['All', 'Not started', 'In progress', 'Done']

export default function Tasks({ initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [classFilter, setClassFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = tasks.filter(t => {
    const classMatch = classFilter === 'All' || t.class === classFilter
    const statusMatch = statusFilter === 'All' || t.status === statusFilter
    return classMatch && statusMatch
  })

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

  return (
    <Layout onTaskAdded={handleTaskAdded}>
      <div className="space-y-4">

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Class filter */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setClassFilter('All')}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                classFilter === 'All'
                  ? 'bg-stone-800 text-cream'
                  : 'bg-white border border-stone-200 text-stone-500 hover:text-stone-800'
              }`}
            >
              All classes
            </button>
            {CLASS_NAMES.map(cn => {
              const cfg = CLASS_CONFIG[cn]
              const active = classFilter === cn
              return (
                <button
                  key={cn}
                  onClick={() => setClassFilter(active ? 'All' : cn)}
                  className="text-xs px-3 py-1.5 rounded-full font-medium transition-colors"
                  style={{
                    background: active ? cfg.color : cfg.light,
                    color: active ? 'white' : cfg.color,
                  }}
                >
                  {cn}
                </button>
              )
            })}
          </div>
        </div>

        {/* Status filter */}
        <div className="flex gap-1">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`wax-tab text-xs ${
                statusFilter === s ? 'wax-tab-active' : 'wax-tab-inactive'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="text-xs text-stone-400">
          {filtered.length} task{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* Task list */}
        {filtered.length === 0 ? (
          <p className="text-sm text-stone-400 py-8 text-center">No tasks here!</p>
        ) : (
          <div className="space-y-1.5">
            {filtered.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
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
