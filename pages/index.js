import { useState, useCallback } from 'react'
import Layout from '../components/Layout'
import ClassCard from '../components/ClassCard'
import TaskItem from '../components/TaskItem'
import QuickAdd from '../components/QuickAdd'
import { getTasks } from '../lib/notion'
import { CLASS_NAMES } from '../lib/constants'

export default function Dashboard({ initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [modalOpen, setModalOpen] = useState(false)
  const [prefill, setPrefill] = useState(null)

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

  const handleTaskAdded = useCallback((newTask) => {
    setTasks(prev => [newTask, ...prev])
  }, [])

  const openModal = useCallback((data = null) => {
    setPrefill(data)
    setModalOpen(true)
  }, [])

  return (
    <Layout onTaskAdded={handleTaskAdded} modalOpenExternal={modalOpen} prefillExternal={prefill}>
      {({ openModal: layoutOpenModal }) => (
        <div className="space-y-6">

          {/* Quick Add */}
          <QuickAdd
            onParsed={(parsed) => layoutOpenModal(parsed)}
            onManual={(text) => layoutOpenModal({ name: text })}
          />

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

          {/* Upcoming tasks */}
          <section>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">
              Upcoming
            </p>
            {upcoming.length === 0 ? (
              <p className="text-sm text-stone-400 py-4 text-center">
                Nothing due — nice!
              </p>
            ) : (
              <div className="space-y-1.5">
                {upcoming.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                  />
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
                  <TaskItem
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </section>
          )}

        </div>
      )}
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
