import { useState, useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  ScatterChart, Scatter, ComposedChart,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { Plus, Trash2, BarChart3, RefreshCw } from 'lucide-react'
import { exercises, CATEGORIES } from '../data/exercises'
import { useWorkouts } from '../hooks/useWorkouts'
import { format, parseISO, subMonths } from 'date-fns'
import ExerciseImage from '../components/ExerciseImage'

const METRICS = [
  { key: 'maxWeight', label: 'Max Weight (lbs)' },
  { key: 'totalVolume', label: 'Volume (lbs)' },
  { key: 'totalReps', label: 'Total Reps' },
  { key: 'oneRepMax', label: 'Est. 1RM' },
  { key: 'setsCount', label: 'Sets' },
]

const CHART_PALETTE = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm shadow-xl">
      <p className="text-gray-400 mb-2 text-xs">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  )
}

function ComparisonChart({ workouts, getWorkoutsByExercise }) {
  const [selectedExIds, setSelectedExIds] = useState([exercises[0].id])
  const [metric, setMetric] = useState('maxWeight')
  const [chartType, setChartType] = useState('line')
  const [range, setRange] = useState(3)

  const loggedIds = useMemo(() => {
    const ids = new Set()
    workouts.forEach((w) => w.exercises.forEach((e) => ids.add(e.exerciseId)))
    return ids
  }, [workouts])

  const chartData = useMemo(() => {
    const cutoff = subMonths(new Date(), range)
    const allDates = new Set()
    const byEx = {}
    selectedExIds.forEach((exId) => {
      const history = getWorkoutsByExercise(exId).filter((d) => parseISO(d.date) >= cutoff)
      byEx[exId] = {}
      history.forEach((d) => {
        const label = format(parseISO(d.date), 'MMM d')
        byEx[exId][label] = d[metric] || 0
        allDates.add(label)
      })
    })
    return [...allDates].sort().map((label) => {
      const entry = { label }
      selectedExIds.forEach((exId) => {
        const ex = exercises.find((e) => e.id === exId)
        entry[ex?.name || exId] = byEx[exId][label] || null
      })
      return entry
    })
  }, [workouts, selectedExIds, metric, range])

  const toggleExercise = (id) => {
    setSelectedExIds((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id].slice(0, 5)
    )
  }

  const renderLines = () =>
    selectedExIds.map((exId, i) => {
      const ex = exercises.find((e) => e.id === exId)
      const color = CATEGORIES[ex?.category]?.color || CHART_PALETTE[i % CHART_PALETTE.length]
      const name = ex?.name || exId
      if (chartType === 'bar') return <Bar key={exId} dataKey={name} name={name} fill={color} radius={[3, 3, 0, 0]} maxBarSize={24} />
      if (chartType === 'area') return <Area key={exId} dataKey={name} name={name} stroke={color} fill={color} fillOpacity={0.1} strokeWidth={2} dot={false} />
      return <Line key={exId} dataKey={name} name={name} stroke={color} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} connectNulls />
    })

  const ChartWrapper = chartType === 'bar' ? BarChart : chartType === 'area' ? AreaChart : LineChart

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
      <h2 className="text-base font-semibold text-white">Exercise Comparison</h2>

      <div className="flex flex-wrap gap-3 items-center">
        <select value={metric} onChange={(e) => setMetric(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none">
          {METRICS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
        </select>
        <div className="flex gap-1 p-1 bg-gray-800 rounded-lg">
          {['line', 'bar', 'area'].map((t) => (
            <button key={t} onClick={() => setChartType(t)} className={`px-2.5 py-1 rounded text-xs capitalize transition-colors ${chartType === t ? 'bg-gray-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>{t}</button>
          ))}
        </div>
        <div className="flex gap-1 p-1 bg-gray-800 rounded-lg">
          {[1, 3, 6, 12].map((m) => (
            <button key={m} onClick={() => setRange(m)} className={`px-2.5 py-1 rounded text-xs transition-colors ${range === m ? 'bg-gray-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>{m}M</button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[...loggedIds].map((exId) => {
          const ex = exercises.find((e) => e.id === exId)
          const active = selectedExIds.includes(exId)
          const color = CATEGORIES[ex?.category]?.color || '#10b981'
          return (
            <button
              key={exId}
              onClick={() => toggleExercise(exId)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border"
              style={active ? { color, backgroundColor: color + '18', borderColor: color + '40' } : { color: '#6b7280', borderColor: '#374151' }}
            >
              {ex?.name}
            </button>
          )
        })}
      </div>

      {chartData.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-gray-600 text-sm">Select exercises to compare</div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <ChartWrapper data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v?.toLocaleString()} />
            <Tooltip content={<CUSTOM_TOOLTIP />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            {renderLines()}
          </ChartWrapper>
        </ResponsiveContainer>
      )}
    </div>
  )
}

function FrequencyChart({ workouts }) {
  const data = useMemo(() => {
    const last30 = {}
    for (let i = 0; i < 30; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = format(d, 'yyyy-MM-dd')
      const label = format(d, 'MMM d')
      const dayWorkouts = workouts.filter((w) => w.date === key)
      const exercises = dayWorkouts.reduce((s, w) => s + w.exercises.length, 0)
      last30[key] = { label, exercises, workouts: dayWorkouts.length }
    }
    return Object.values(last30).reverse()
  }, [workouts])

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h2 className="text-base font-semibold text-white mb-4">Workout Frequency — 30 Days</h2>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barSize={10}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<CUSTOM_TOOLTIP />} />
          <Bar dataKey="exercises" name="Exercises" fill="#10b981" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function MuscleDistributionChart({ workouts }) {
  const data = useMemo(() => {
    const counts = {}
    workouts.forEach((w) => {
      w.exercises.forEach((e) => {
        counts[e.category] = (counts[e.category] || 0) + e.sets.filter((s) => s.completed).length
      })
    })
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({
        name: CATEGORIES[key]?.label || key,
        value,
        color: CATEGORIES[key]?.color || '#10b981',
      }))
  }, [workouts])

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h2 className="text-base font-semibold text-white mb-4">Muscle Group Distribution</h2>
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-gray-600 text-sm">No data yet</div>
      ) : (
        <div className="flex items-center gap-6">
          <ResponsiveContainer width="50%" height={180}>
            <PieChart>
              <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null
                  const d = payload[0].payload
                  return (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-xs">
                      <p style={{ color: d.color }} className="font-semibold">{d.name}</p>
                      <p className="text-gray-300">{d.value} sets ({((d.value / total) * 100).toFixed(0)}%)</p>
                    </div>
                  )
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2">
            {data.sort((a, b) => b.value - a.value).map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-gray-300">{d.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(d.value / total) * 100}%`, backgroundColor: d.color }} />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">{d.value} sets</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function VolumeProgressionChart({ workouts, getWorkoutsByExercise }) {
  const [exId, setExId] = useState('')
  const [cumulative, setCumulative] = useState(false)

  const loggedIds = useMemo(() => {
    const ids = []
    workouts.forEach((w) => w.exercises.forEach((e) => { if (!ids.includes(e.exerciseId)) ids.push(e.exerciseId) }))
    return ids
  }, [workouts])

  const chartData = useMemo(() => {
    if (!exId) return []
    let history = getWorkoutsByExercise(exId)
    let cum = 0
    return history.map((d) => {
      cum += d.totalVolume
      return {
        label: format(parseISO(d.date), 'MMM d'),
        volume: d.totalVolume,
        cumulative: cum,
      }
    })
  }, [exId, workouts])

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-base font-semibold text-white">Volume Progression</h2>
        <div className="flex items-center gap-3">
          <select value={exId} onChange={(e) => setExId(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none">
            <option value="">Select exercise…</option>
            {loggedIds.map((id) => {
              const ex = exercises.find((e) => e.id === id)
              return <option key={id} value={id}>{ex?.name || id}</option>
            })}
          </select>
          <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
            <input type="checkbox" checked={cumulative} onChange={(e) => setCumulative(e.target.checked)} className="accent-emerald-500" />
            Cumulative
          </label>
        </div>
      </div>

      {!exId || chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-gray-600 text-sm">
          {!exId ? 'Select an exercise above' : 'No data for this exercise'}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
            <Tooltip content={<CUSTOM_TOOLTIP />} />
            {!cumulative && <Area dataKey="volume" name="Volume" fill="url(#volGrad)" stroke="#10b981" strokeWidth={2} />}
            {cumulative && <Line dataKey="cumulative" name="Cumulative Volume" stroke="#10b981" strokeWidth={2.5} dot={false} />}
            {!cumulative && <Bar dataKey="volume" name="Volume (lbs)" fill="#10b981" radius={[3, 3, 0, 0]} fillOpacity={0} barSize={1} />}
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default function CustomCharts() {
  const { workouts, loading, getWorkoutsByExercise, getMuscleRadar } = useWorkouts()
  const radarData = useMemo(() => getMuscleRadar(60), [workouts])

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Custom Charts</h1>
        <p className="text-gray-500 text-sm mt-0.5">Visualize your training data any way you want</p>
      </div>

      {workouts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <BarChart3 size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium text-gray-400">No data yet</p>
          <p className="text-sm mt-1">Log workouts to build your charts.</p>
        </div>
      ) : (
        <div className="space-y-5">
          <ComparisonChart workouts={workouts} getWorkoutsByExercise={getWorkoutsByExercise} />

          <div className="grid lg:grid-cols-2 gap-5">
            <MuscleDistributionChart workouts={workouts} />

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-base font-semibold text-white mb-4">Muscle Balance Radar — 60 Days</h2>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1f2937" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Radar name="Sets" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <FrequencyChart workouts={workouts} />

          <VolumeProgressionChart workouts={workouts} getWorkoutsByExercise={getWorkoutsByExercise} />
        </div>
      )}
    </div>
  )
}
