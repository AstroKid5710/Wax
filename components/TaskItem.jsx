import { useState } from 'react'
import { CLASS_CONFIG } from '../lib/constants'
import { dueDateLabel } from '../lib/dates'

export default function TaskItem({ task, onStatusChange }) {
  const [loading, setLoading] = useState(false)
  const config = CLASS_CONFIG[task.class] || { color: '#888', light: '#eee' }
  const isDone = task.status === 'Done'
  const dateLabel = dueDateLabel(task.dueDate, task.status)

  const handleToggle = async () => {
    if (loading) return
    setLoading(true)
    try {
      await onStatusChange(task.id, isDone ? 'Not started' : 'Done')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 bg-white rounded-lg border border-stone-200 transition-opacity ${
        isDone ? 'opacity-50' : ''
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`w-4 h-4 rounded border flex-shrink-0 transition-all flex items-center justify-center ${
          isDone
            ? 'border-transparent'
            : 'border-stone-300 hover:border-stone-400'
        }`}
        style={isDone ? { background: config.color } : {}}
        aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
      >
        {isDone && (
          <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Class dot */}
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: config.color }}
      />

      {/* Task name */}
      <span
        className={`text-sm text-stone-800 flex-1 min-w-0 truncate ${
          isDone ? 'line-through' : ''
        }`}
      >
        {task.name}
      </span>

      {/* Class label — hidden on small screens */}
      {task.class && (
        <span
          className="hidden sm:inline text-xs px-2 py-0.5 rounded font-medium flex-shrink-0"
          style={{ color: config.color, background: config.light }}
        >
          {task.class}
        </span>
      )}

      {/* Due date */}
      {dateLabel && (
        <span
          className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ${
            dateLabel.variant === 'danger'
              ? 'bg-red-50 text-red-600'
              : dateLabel.variant === 'warning'
              ? 'bg-amber-50 text-amber-700'
              : 'text-stone-400'
          }`}
        >
          {dateLabel.text}
        </span>
      )}
    </div>
  )
}
