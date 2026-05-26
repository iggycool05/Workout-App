import { useState, useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Dumbbell, PlusCircle, History, TrendingUp, BarChart3, Settings, Menu, X, LogOut, LayoutTemplate, CloudUpload } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/exercises', icon: Dumbbell, label: 'Exercises' },
  { to: '/log', icon: PlusCircle, label: 'Log Workout' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/charts', icon: BarChart3, label: 'Custom Charts' },
  { to: '/templates', icon: LayoutTemplate, label: 'Templates' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

const OFFLINE_QUEUE_KEY = 'fittrack-offline-queue'

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { user, signOut } = useAuth()
  const [pendingCount, setPendingCount] = useState(() => {
    try { return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]').length }
    catch { return 0 }
  })

  useEffect(() => {
    const handler = (e) => setPendingCount(e.detail)
    window.addEventListener('fittrack-queue-change', handler)
    return () => window.removeEventListener('fittrack-queue-change', handler)
  }, [])

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'FT'

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-900 border-r border-gray-800 transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Dumbbell size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">FitTrack</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100 border border-transparent'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-200 truncate">{user?.email}</p>
              <p className="text-xs text-gray-600">Signed in</p>
            </div>
            <button
              onClick={signOut}
              title="Sign out"
              className="text-gray-600 hover:text-red-400 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-800 bg-gray-950/80 backdrop-blur px-4 lg:px-6">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          {pendingCount > 0 ? (
            <div className="flex items-center gap-2 text-sm text-amber-400 animate-pulse">
              <CloudUpload size={15} />
              {pendingCount} pending sync
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Connected
            </div>
          )}
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
