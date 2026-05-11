import { useState } from 'react'
import Nav from './Nav'
import AddTaskModal from './AddTaskModal'

export default function Layout({ children, onTaskAdded }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [prefill, setPrefill] = useState(null)

  const openModal = (data = null) => {
    setPrefill(data)
    setModalOpen(true)
  }

  const handleSave = async (taskData) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    })
    if (!res.ok) throw new Error('Failed to create task')
    const newTask = await res.json()
    onTaskAdded?.(newTask)
  }

  return (
    <div className="min-h-screen bg-cream">
      <Nav onAddTask={() => openModal()} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {typeof children === 'function' ? children({ openModal }) : children}
      </main>
      <AddTaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        prefill={prefill}
      />
    </div>
  )
}
