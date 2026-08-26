import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Dumbbell, Flame, Clock, TrendingUp, Plus, ChevronRight } from 'lucide-react'
import { useWorkouts } from '../hooks/useWorkouts'
import { format, parseISO } from 'date-fns'
import { CATEGORIES } from '../data/exercises'

function StatCard({ icon: Icon, label, value, sub, color = 'emerald' }) {
  const colors = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  }
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${colors[color]}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  )
}

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value?.toLocaleString()}</p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { workouts, loading, getWeeklyStats, getDailyVolume, getMuscleRadar, getPersonalRecords } = useWorkouts()

  const stats = useMemo(() => getWeeklyStats(7), [workouts])
  const dailyVolume = useMemo(() => getDailyVolume(14), [workouts])
  const radarData = useMemo(() => getMuscleRadar(30), [workouts])
  const prs = useMemo(() => getPersonalRecords(), [workouts])
  const prList = Object.values(prs).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  const recentWorkouts = workouts.slice(0, 5)

  const fmtVol = (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString()

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
          <Dumbbell size={36} className="text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to FitTrack</h1>
        <p className="text-gray-400 max-w-md mb-8">
          Track your workouts, monitor progress with detailed charts, and hit new personal records.
        </p>
        <Link
          to="/log"
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          <Plus size={18} />
          Log Your First Workout
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Last 7 days</p>
        </div>
        <Link
          to="/log"
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus size={15} />
          New Workout
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Dumbbell} label="Workouts" value={stats.workoutsCount} sub="this week" color="emerald" />
        <StatCard icon={Flame} label="Volume" value={`${fmtVol(stats.totalVolume)} lbs`} sub="total lifted" color="orange" />
        <StatCard icon={Clock} label="Duration" value={`${stats.totalDuration}m`} sub="total time" color="blue" />
        <StatCard icon={TrendingUp} label="PRs" value={prList.length} sub="all time" color="purple" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Volume bar chart */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-4">Volume — Last 14 Days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyVolume} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtVol} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Bar dataKey="volume" name="Volume (lbs)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Muscle radar */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-4">Muscle Balance — 30 Days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1f2937" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Radar name="Sets" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent workouts + PRs */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Recent Workouts</h2>
            <Link to="/history" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentWorkouts.map((w) => {
              const cats = [...new Set(w.exercises.map((e) => e.category))]
              const totalSets = w.exercises.reduce((s, e) => s + e.sets.filter((st) => st.completed).length, 0)
              return (
                <div key={w.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-200">
                      {format(parseISO(w.date), 'EEE, MMM d')}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {w.exercises.length} exercise{w.exercises.length !== 1 ? 's' : ''} · {totalSets} sets
                      {w.duration ? ` · ${w.duration}m` : ''}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {cats.slice(0, 3).map((c) => (
                      <span
                        key={c}
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: CATEGORIES[c]?.color + '20', color: CATEGORIES[c]?.color }}
                      >
                        {CATEGORIES[c]?.label}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Personal Records</h2>
            <Link to="/progress" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              Progress <ChevronRight size={12} />
            </Link>
          </div>
          {prList.length === 0 ? (
            <p className="text-gray-500 text-sm">No records yet. Start logging workouts!</p>
          ) : (
            <div className="space-y-3">
              {prList.map((pr, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-200">{pr.exerciseName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{format(parseISO(pr.date), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-400">{pr.weight} lbs</span>
                    {pr.reps && <span className="text-xs text-gray-500 ml-1">× {pr.reps}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
