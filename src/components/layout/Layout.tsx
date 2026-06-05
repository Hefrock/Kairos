import { Outlet, NavLink } from 'react-router-dom'
import { useTheme } from '@/contexts/ThemeContext'

// Phase 2: add 'digest' tab here
const NAV_ITEMS = [
  { to: '/study',    label: 'Study' },
  { to: '/browse',   label: 'Browse' },
  { to: '/progress', label: 'Progress' },
  { to: '/settings', label: 'Settings' },
]

export default function Layout() {
  const { isDark, toggle } = useTheme()

  return (
    <div className="min-h-dvh flex flex-col bg-parchment dark:bg-ink transition-colors duration-200">
      {/* Header */}
      <header className="bg-ink px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <span className="font-display text-gold text-xl tracking-widest">KAIROS</span>
          <span className="block text-xs text-gold/50 tracking-[0.4em] font-body font-light">
            memory · method · moment
          </span>
        </div>
        <button
          onClick={toggle}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-8 h-8 flex items-center justify-center rounded-full text-gold/60 hover:text-gold hover:bg-white/10 transition-colors"
        >
          {isDark ? (
            // Sun icon — click to go light
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-5 h-5">
              <circle cx="12" cy="12" r="4.5"/>
              <line x1="12" y1="2" x2="12" y2="4.5"/>
              <line x1="12" y1="19.5" x2="12" y2="22"/>
              <line x1="2" y1="12" x2="4.5" y2="12"/>
              <line x1="19.5" y1="12" x2="22" y2="12"/>
              <line x1="4.93" y1="4.93" x2="6.64" y2="6.64"/>
              <line x1="17.36" y1="17.36" x2="19.07" y2="19.07"/>
              <line x1="4.93" y1="19.07" x2="6.64" y2="17.36"/>
              <line x1="17.36" y1="6.64" x2="19.07" y2="4.93"/>
            </svg>
          ) : (
            // Moon icon — click to go dark
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
            </svg>
          )}
        </button>
      </header>

      {/* Nav */}
      <nav className="bg-ink-mid px-4 flex gap-1 shrink-0">
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `px-4 py-3 text-sm rounded-t transition-colors ${
                isActive
                  ? 'text-gold bg-parchment/10 dark:bg-parchment/10'
                  : 'text-gold/60 hover:text-gold hover:bg-white/5'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Page content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
