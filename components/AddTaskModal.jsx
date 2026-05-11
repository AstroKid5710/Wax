import { useState, useEffect, useRef } from 'react'
import { CLASS_NAMES, CLASS_CONFIG, PRIORITY_OPTIONS } from '../lib/constants'

export default function AddTaskModal({ isOpen, onClose, onSave, prefill = null }) {
  const [name, setName] = useState('')
  const [className, setClassName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const nameRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      if (prefill) {
        setName(prefill.name || '')
        setClassName(prefill.class || '')
        setDueDate(prefill.dueDate || '')
        setPriority(prefill.priority || 'Medium')
        setNotes(prefill.notes || '')
      } else {
        setName('')
        setClassName('')
        setDueDate('')
        setPriority('Medium')
        setNotes('')
      }
      setTimeout(() => nameRef.current?.focus(), 50)
    }
  }, [isOpen, prefill])

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave({ name: name.trim(), class: className, dueDate, priority, notes })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'Enter' && e.metaKey) handleSave()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl border border-stone-200 shadow-xl p-5 sm:p-6">
        {/* Handle — mobile only */}
        <div className="sm:hidden w-10 h-1 rounded-full bg-stone-200 mx-auto mb-4" />

        <h2 className="text-base font-medium text-stone-800 mb-4">New task</h2>

        <div className="space-y-3">
          {/* Name */}
          <input
            ref={nameRef}
            type="text"
            placeholder="Task name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="wax-input"
          />

          {/* Class + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <select
              value={className}
              onChange={e => setClassName(e.target.value)}
              className="wax-input"
            >
              <option value="">Class</option>
              {CLASS_NAMES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="wax-input"
            >
              {PRIORITY_OPTIONS.map(p => (
                <option key={p} value={p}>{p} priority</option>
              ))}
            </select>
          </div>

          {/* Due date */}
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="wax-input"
          />

          {/* Class color pills */}
          {className && (
            <div className="flex flex-wrap gap-1.5">
              {CLASS_NAMES.map(c => {
                const cfg = CLASS_CONFIG[c]
                return (
                  <button
                    key={c}
                    onClick={() => setClassName(c)}
                    className="text-xs px-2.5 py-1 rounded-full font-medium transition-all"
                    style={{
                      background: className === c ? cfg.color : cfg.light,
                      color: className === c ? 'white' : cfg.color,
                    }}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          )}

          {/* Notes */}
          <textarea
            placeholder="Notes (optional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            className="wax-input resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="wax-btn wax-btn-ghost flex-1">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="wax-btn wax-btn-primary flex-1 disabled:opacity-50"
          >
            {saving ? 'Adding...' : 'Add task'}
          </button>
        </div>

        <p className="text-xs text-stone-400 text-center mt-2">
          ⌘ + Enter to save
        </p>
      </div>
    </div>
  )
}
