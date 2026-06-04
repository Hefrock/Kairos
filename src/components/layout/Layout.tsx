import { Outlet, NavLink } from 'react-router-dom'

// Phase 2: add 'digest' tab here
const NAV_ITEMS = [
  { to: '/study',    label: 'Study' },
  { to: '/browse',   label: 'Browse' },
  { to: '/progress', label: 'Progress' },
  { to: '/settings', label: 'Settings' },
]

export default function Layout() {
  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="bg-ink px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <span className="font-display text-gold text-xl tracking-widest">KAIROS</span>
          <span className="block text-xs text-gold/50 tracking-[0.4em] font-body font-light">
            memory · method · moment
          </span>
        </div>
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
                  ? 'text-gold bg-parchment/10'
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
