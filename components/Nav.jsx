import Link from 'next/link'
import { useRouter } from 'next/router'

const TABS = [
  { label: 'Dashboard', href: '/' },
  { label: 'Tasks', href: '/tasks' },
  { label: 'Deadlines', href: '/deadlines' },
  { label: 'Subjects', href: '/subjects' },
]

function VinylLogo() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="13" cy="13" r="12.5" fill="#1C1C1A" />
      <circle cx="13" cy="13" r="9" fill="#2C2C2A" />
      <circle cx="13" cy="13" r="6" fill="#3A3A38" />
      <circle cx="13" cy="13" r="7.5" fill="none" stroke="#4a4a48" strokeWidth="0.6" />
      <circle cx="13" cy="13" r="10.5" fill="none" stroke="#4a4a48" strokeWidth="0.6" />
      <circle cx="13" cy="13" r="2.2" fill="#FAF7F2" />
    </svg>
  )
}

export default function Nav({ onAddTask }) {
  const router = useRouter()

  return (
    <header className="bg-cream border-b border-stone-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <VinylLogo />
            <span className="font-serif text-xl font-medium text-stone-800 tracking-tight">
              Wax
            </span>
          </div>

          {/* Tabs — hidden on mobile, shown on sm+ */}
          <nav className="hidden sm:flex items-center gap-1">
            {TABS.map(tab => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`wax-tab ${
                  router.pathname === tab.href
                    ? 'wax-tab-active'
                    : 'wax-tab-inactive'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>

          {/* Right: add button + avatar */}
          <div className="flex items-center gap-2">
            <button
              onClick={onAddTask}
              className="hidden sm:flex wax-btn wax-btn-primary items-center gap-1.5"
            >
              <span className="text-base leading-none">+</span>
              Add task
            </button>
            <button
              onClick={onAddTask}
              className="sm:hidden w-8 h-8 rounded-full bg-stone-800 text-cream flex items-center justify-center text-lg leading-none"
            >
              +
            </button>
            <div className="w-8 h-8 rounded-full bg-chem flex items-center justify-center text-chem-light text-xs font-medium flex-shrink-0">
              X
            </div>
          </div>

        </div>

        {/* Mobile tab bar */}
        <div className="flex sm:hidden gap-1 pb-2 overflow-x-auto">
          {TABS.map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`wax-tab whitespace-nowrap text-xs ${
                router.pathname === tab.href
                  ? 'wax-tab-active'
                  : 'wax-tab-inactive'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
