import { useState, useMemo, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { TrendingUp, Award, ChevronDown } from 'lucide-react'
import { exercises, CATEGORIES } from '../data/exercises'
import { useWorkouts } from '../hooks/useWorkouts'
import { useSettings } from '../hooks/useSettings'
import { milesToUnit } from '../utils/units'
import { format, parseISO, subMonths } from 'date-fns'
import ExerciseImage from '../components/ExerciseImage'

const STRENGTH_METRICS = [
  { key: 'maxWeight', label: 'Max Weight (lbs)' },
  { key: 'totalVolume', label: 'Total Volume (lbs)' },
  { key: 'totalReps', label: 'Total Reps' },
  { key: 'oneRepMax', label: 'Est. 1RM (lbs)' },
  { key: 'setsCount', label: 'Sets Completed' },
]

const TIME_METRICS = [
  { key: 'maxTime', label: 'Best Set Time (s)' },
  { key: 'totalTime', label: 'Total Time (s)' },
]

const SETS_METRIC = { key: 'setsCount', label: 'Sets Completed' }

// Which metrics make sense depends on how the exercise is tracked (weight/reps, distance, or a count like steps/strokes).
const getMetrics = (ex, distanceUnit) => {
  if (!ex) return STRENGTH_METRICS
  if (ex.cardioMetric === 'distance') {
    return [
      { key: 'maxDistance', label: `Best Distance (${distanceUnit})` },
      { key: 'totalDistance', label: `Total Distance (${distanceUnit})` },
      ...TIME_METRICS,
      SETS_METRIC,
    ]
  }
  if (ex.cardioMetric === 'count') {
    const label = ex.countLabel || 'Reps'
    return [
      { key: 'totalReps', label: `Total ${label}` },
      ...TIME_METRICS,
      SETS_METRIC,
    ]
  }
  if (ex.trackTime) {
    return [...TIME_METRICS, SETS_METRIC]
  }
  return STRENGTH_METRICS
}

const CHART_TYPES = ['line', 'bar', 'area']
const RANGES = [
  { label: '1M', months: 1 },
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: 'All', months: null },
]

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  )
}

export default function Progress() {
  const { workouts, loading, getWorkoutsByExercise, getPersonalRecords } = useWorkouts()
  const { settings } = useSettings()
  const distanceUnit = settings.distanceUnit
  const [selectedExId, setSelectedExId] = useState(exercises[0].id)
  const [metric, setMetric] = useState('maxWeight')
  const [chartType, setChartType] = useState('line')
  const [range, setRange] = useState(null) // months

  const prs = useMemo(() => getPersonalRecords(), [workouts])
  const history = useMemo(() => getWorkoutsByExercise(selectedExId), [workouts, selectedExId])

  const selectedEx = exercises.find((e) => e.id === selectedExId)
  const metrics = useMemo(() => getMetrics(selectedEx, distanceUnit), [selectedEx, distanceUnit])

  useEffect(() => {
    if (!metrics.some((m) => m.key === metric)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMetric(metrics[0]?.key)
    }
  }, [metrics]) // eslint-disable-line react-hooks/exhaustive-deps

  const chartData = useMemo(() => {
    let data = history
    if (range) {
      const cutoff = subMonths(new Date(), range)
      data = data.filter((d) => parseISO(d.date) >= cutoff)
    }
    return data.map((d) => ({
      ...d,
      label: format(parseISO(d.date), 'MMM d'),
      maxDistance: Math.round(milesToUnit(d.maxDistance, distanceUnit) * 100) / 100,
      totalDistance: Math.round(milesToUnit(d.totalDistance, distanceUnit) * 100) / 100,
    }))
  }, [history, range, distanceUnit])

  const metricLabel = metrics.find((m) => m.key === metric)?.label || ''

  const pr = prs[selectedExId]
  const maxVal = chartData.reduce((m, d) => Math.max(m, d[metric] || 0), 0)
  const latestVal = chartData[chartData.length - 1]?.[metric] || 0
  const firstVal = chartData[0]?.[metric] || 0
  const improvement = firstVal > 0 ? (((latestVal - firstVal) / firstVal) * 100).toFixed(1) : null

  const chartColor = CATEGORIES[selectedEx?.category]?.color || '#10b981'

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 10, left: 0, bottom: 5 },
    }
    const axisProps = {
      XAxis: <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />,
      YAxis: <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toLocaleString()} />,
      Grid: <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />,
      Tip: <Tooltip content={<CUSTOM_TOOLTIP />} />,
    }

    if (chartType === 'bar') {
      return (
        <BarChart {...commonProps}>
          {axisProps.Grid}
          {axisProps.XAxis}
          {axisProps.YAxis}
          {axisProps.Tip}
          <Bar dataKey={metric} name={metricLabel} fill={chartColor} radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      )
    }
    if (chartType === 'area') {
      return (
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.25} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          {axisProps.Grid}
          {axisProps.XAxis}
          {axisProps.YAxis}
          {axisProps.Tip}
          <Area dataKey={metric} name={metricLabel} stroke={chartColor} fill="url(#areaGrad)" strokeWidth={2} dot={{ r: 3, fill: chartColor }} activeDot={{ r: 5 }} />
        </AreaChart>
      )
    }
    return (
      <LineChart {...commonProps}>
        {axisProps.Grid}
        {axisProps.XAxis}
        {axisProps.YAxis}
        {axisProps.Tip}
        <Line dataKey={metric} name={metricLabel} stroke={chartColor} strokeWidth={2.5} dot={{ r: 3, fill: chartColor }} activeDot={{ r: 5 }} />
        {pr && <ReferenceLine y={pr.weight} stroke={chartColor} strokeDasharray="4 4" opacity={0.5} label={{ value: 'PR', fill: chartColor, fontSize: 11 }} />}
      </LineChart>
    )
  }

  // exercises that have been logged at least once
  const loggedExerciseIds = useMemo(() => {
    const ids = new Set()
    workouts.forEach((w) => w.exercises.forEach((e) => ids.add(e.exerciseId)))
    return ids
  }, [workouts])

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Progress</h1>
        <p className="text-gray-500 text-sm mt-0.5">Track your exercise progression over time</p>
      </div>

      {workouts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <TrendingUp size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium text-gray-400">No data yet</p>
          <p className="text-sm mt-1">Log workouts to see progress charts here.</p>
        </div>
      ) : (
        <>
          {/* Exercise selector */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Exercise</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
              {exercises.filter((e) => loggedExerciseIds.has(e.id)).map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExId(ex.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-left transition-all border text-sm ${
                    selectedExId === ex.id
                      ? 'border-current bg-opacity-10'
                      : 'border-gray-800 hover:border-gray-700 text-gray-400 hover:text-gray-200'
                  }`}
                  style={selectedExId === ex.id ? { color: CATEGORIES[ex.category]?.color, backgroundColor: CATEGORIES[ex.category]?.color + '12', borderColor: CATEGORIES[ex.category]?.color + '40' } : {}}
                >
                  <ExerciseImage category={ex.category} size="sm" className="w-8 h-8 shrink-0" />
                  <span className="font-medium text-xs leading-tight">{ex.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Sessions', value: history.length },
              { label: 'PR', value: pr ? `${pr.weight} lbs` : '—' },
              { label: 'Latest', value: latestVal > 0 ? latestVal.toLocaleString() : '—' },
              { label: 'Progress', value: improvement !== null ? `${improvement > 0 ? '+' : ''}${improvement}%` : '—', color: improvement > 0 ? 'text-emerald-400' : improvement < 0 ? 'text-red-400' : 'text-gray-300' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <p className={`text-xl font-bold ${color || 'text-white'}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Chart controls */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-1 p-1 bg-gray-900 border border-gray-800 rounded-lg">
              {CHART_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setChartType(t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                    chartType === t ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none"
            >
              {metrics.map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>

            <div className="flex gap-1 p-1 bg-gray-900 border border-gray-800 rounded-lg">
              {RANGES.map(({ label, months }) => (
                <button
                  key={label}
                  onClick={() => setRange(months)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    range === months ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Main chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              {selectedEx && (
                <div className="flex items-center gap-3">
                  <ExerciseImage category={selectedEx.category} size="sm" />
                  <div>
                    <h2 className="text-base font-semibold text-white">{selectedEx.name}</h2>
                    <p className="text-xs text-gray-500">{metricLabel}</p>
                  </div>
                </div>
              )}
            </div>

            {chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-600 text-sm">
                No data in this time range.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                {renderChart()}
              </ResponsiveContainer>
            )}
          </div>

          {/* Personal records table */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award size={16} className="text-yellow-400" />
              <h2 className="text-base font-semibold text-white">All Personal Records</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-xs text-gray-500 uppercase tracking-wide pb-2">Exercise</th>
                    <th className="text-right text-xs text-gray-500 uppercase tracking-wide pb-2">Weight</th>
                    <th className="text-right text-xs text-gray-500 uppercase tracking-wide pb-2">Reps</th>
                    <th className="text-right text-xs text-gray-500 uppercase tracking-wide pb-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {Object.entries(prs)
                    .sort((a, b) => b[1].weight - a[1].weight)
                    .map(([exId, pr]) => {
                      const ex = exercises.find((e) => e.id === exId)
                      return (
                        <tr key={exId} className="hover:bg-gray-800/50 transition-colors">
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              {ex && <ExerciseImage category={ex.category} size="sm" className="w-7 h-7" />}
                              <span className="text-gray-200 font-medium">{pr.exerciseName}</span>
                            </div>
                          </td>
                          <td className="py-2.5 text-right font-bold text-emerald-400">{pr.weight} lbs</td>
                          <td className="py-2.5 text-right text-gray-400">{pr.reps || '—'}</td>
                          <td className="py-2.5 text-right text-gray-500 text-xs">{format(parseISO(pr.date), 'MMM d, yyyy')}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
              {Object.keys(prs).length === 0 && (
                <p className="text-center text-gray-600 text-sm py-6">No records yet.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
