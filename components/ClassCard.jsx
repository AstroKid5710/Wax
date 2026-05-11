import Link from 'next/link'
import ProgressRing from './ProgressRing'
import { CLASS_CONFIG } from '../lib/constants'

export default function ClassCard({ className, tasks = [] }) {
  const config = CLASS_CONFIG[className]
  if (!config) return null

  const total = tasks.length
  const done = tasks.filter(t => t.status === 'Done').length
  const pending = total - done
  const progress = total > 0 ? done / total : 0

  return (
    <Link href={`/subjects?class=${className}`}>
      <div
        className="bg-white rounded-xl border border-stone-200 p-3 hover:shadow-sm transition-all cursor-pointer group"
        style={{ borderTop: `2.5px solid ${config.color}` }}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="min-w-0">
            <p
              className="text-xs font-medium truncate"
              style={{ color: config.color }}
            >
              {config.label}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">
              {pending} left
            </p>
          </div>
          <ProgressRing progress={progress} color={config.color} size={34} />
        </div>
        <p className="text-xs text-stone-400">
          {done} / {total} done
        </p>
      </div>
    </Link>
  )
}
