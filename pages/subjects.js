import { useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import TaskItem from '../components/TaskItem'
import ProgressRing from '../components/ProgressRing'
import { getTasks } from '../lib/notion'
import { CLASS_NAMES, CLASS_CONFIG } from '../lib/constants'

export default function Subjects({ initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks)
  const router = useRouter()
  const activeClass = router.query.class || null

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

  const classesToShow = activeClass && CLASS_NAMES.includes(activeClass)
    ? [activeClass]
    : CLASS_NAMES

  return (
    <Layout onTaskAdded={handleTaskAdded}>
      <div className="space-y-6">

        {/* Class filter pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => router.push('/subjects')}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              !activeClass ? 'bg-stone-800 text-cream' : 'bg-white border border-stone-200 text-stone-500'
            }`}
          >
            All
          </button>
          {CLASS_NAMES.map(cn => {
            const cfg = CLASS_CONFIG[cn]
            const active = activeClass === cn
            return (
              <button
                key={cn}
                onClick={() => router.push(`/subjects?class=${cn}`)}
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

        {/* Subject sections */}
        {classesToShow.map(cn => {
          const cfg = CLASS_CONFIG[cn]
          const classTasks = tasks.filter(t => t.class === cn)
          const done = classTasks.filter(t => t.status === 'Done').length
          const total = classTasks.length
          const progress = total > 0 ? done / total : 0
          const active = classTasks.filter(t => t.status !== 'Done')

          return (
            <section key={cn}>
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3 rounded-xl mb-2"
                style={{ background: cfg.light }}
              >
                <div>
                  <p className="font-medium text-sm" style={{ color: cfg.color }}>{cfg.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: cfg.dark }}>
                    {done} / {total} done
                  </p>
                </div>
                <ProgressRing progress={progress} color={cfg.color} size={40} />
              </div>

              {/* Tasks */}
              {active.length === 0 ? (
                <p className="text-xs text-stone-400 px-1 py-2">All done for {cn}!</p>
              ) : (
                <div className="space-y-1.5">
                  {active.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </section>
          )
        })}

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
