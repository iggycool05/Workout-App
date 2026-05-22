import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { isConfigured } from './lib/supabase'
import Layout from './components/Layout'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import ExerciseLibrary from './pages/ExerciseLibrary'
import LogWorkout from './pages/LogWorkout'
import History from './pages/History'
import Progress from './pages/Progress'
import CustomCharts from './pages/CustomCharts'

function SetupRequired() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-gray-900 border border-yellow-500/30 rounded-2xl p-8">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-5">
            <span className="text-2xl">⚙️</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Supabase not configured</h1>
          <p className="text-gray-400 text-sm mb-6">
            Create a <code className="bg-gray-800 text-yellow-300 px-1.5 py-0.5 rounded text-xs">.env.local</code> file
            inside the <code className="bg-gray-800 text-yellow-300 px-1.5 py-0.5 rounded text-xs">workout-app/</code> folder with your Supabase credentials:
          </p>
          <pre className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-sm text-emerald-300 mb-6 overflow-x-auto">
{`VITE_SUPABASE_URL=https://your-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
          </pre>
          <ol className="space-y-2 text-sm text-gray-400 list-decimal list-inside">
            <li>Go to <span className="text-white">supabase.com</span> and create a free project</li>
            <li>Run <code className="bg-gray-800 text-yellow-300 px-1.5 py-0.5 rounded text-xs">supabase/schema.sql</code> in the SQL Editor</li>
            <li>Copy your URL + anon key from <span className="text-white">Project Settings → API</span></li>
            <li>Paste them into <code className="bg-gray-800 text-yellow-300 px-1.5 py-0.5 rounded text-xs">.env.local</code> and restart the dev server</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (!isConfigured) return <SetupRequired />
  if (loading) return <Spinner />

  return (
    <Routes>
      <Route
        path="/auth"
        element={user ? <Navigate to="/" replace /> : <Auth />}
      />
      <Route
        path="/"
        element={user ? <Layout /> : <Navigate to="/auth" replace />}
      >
        <Route index element={<Dashboard />} />
        <Route path="exercises" element={<ExerciseLibrary />} />
        <Route path="log" element={<LogWorkout />} />
        <Route path="history" element={<History />} />
        <Route path="progress" element={<Progress />} />
        <Route path="charts" element={<CustomCharts />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
