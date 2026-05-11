import { useState, useRef } from 'react'

export default function QuickAdd({ onParsed, onManual }) {
  const [input, setInput] = useState('')
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const handleKeyDown = async (e) => {
    if (e.key !== 'Enter' || !input.trim()) return
    setError(null)
    setParsing(true)
    try {
      const res = await fetch('/api/parse-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input.trim() }),
      })
      if (!res.ok) throw new Error('Parse failed')
      const parsed = await res.json()
      setInput('')
      onParsed(parsed)
    } catch {
      setError('Could not parse — filling form manually')
      onManual(input.trim())
      setInput('')
    } finally {
      setParsing(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2.5 border border-stone-200 rounded-xl px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-stone-300 transition">
        {parsing ? (
          <div className="w-3.5 h-3.5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin flex-shrink-0" />
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
            <line x1="7" y1="2" x2="7" y2="12" stroke="#A8A29E" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="2" y1="7" x2="12" y2="7" stroke="#A8A29E" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a task... or just describe it naturally"
          disabled={parsing}
          className="flex-1 text-sm text-stone-800 placeholder-stone-400 bg-transparent focus:outline-none"
        />
        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-medium flex-shrink-0">
          AI
        </span>
      </div>
      {error && (
        <p className="text-xs text-stone-400 px-1">{error}</p>
      )}
      <p className="text-xs text-stone-400 px-1">
        Try: &ldquo;chem lab report due thursday&rdquo; — press Enter
      </p>
    </div>
  )
}
