import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Trash2, Scale, TrendingDown, TrendingUp } from 'lucide-react'
import { format, parseISO, subMonths } from 'date-fns'
import { useBodyWeight } from '../hooks/useBodyWeight'

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
          {p.value} lbs
        </p>
      ))}
    </div>
  )
}

export default function WeightTracker() {
  const { entries, loading, upsertEntry, deleteEntry, stats } = useBodyWeight()

  const today = format(new Date(), 'yyyy-MM-dd')
  const [date, setDate] = useState(today)
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [range, setRange] = useState(3)

  const handleSave = async () => {
    const val = parseFloat(weight)
    if (!val || val <= 0) return
    setSaving(true)
    setSaveError(null)
    const { error } = await upsertEntry(date, val, notes)
    if (error) { setSaveError(error) }
    else { setWeight(''); setNotes('') }
    setSaving(false)
  }

  const chartData = useMemo(() => {
    const cutoff = range ? subMonths(new Date(), range) : null
    return entries
      .filter((e) => !cutoff || parseISO(e.date) >= cutoff)
      .slice()
      .reverse()
      .map((e) => ({ label: format(parseISO(e.date), 'MMM d'), weight_lbs: e.weight_lbs }))
  }, [entries, range])

  const { currentWeight, startWeight, changeTotal, changeThisMonth } = stats

  const fmtChange = (val) => {
    if (val === null) return '—'
    const sign = val > 0 ? '+' : ''
    return `${sign}${val} lbs`
  }

  const changeColor = (val) => {
    if (val === null) return 'text-gray-400'
    return val < 0 ? 'text-emerald-400' : val > 0 ? 'text-red-400' : 'text-gray-400'
  }

  const statCards = [
    { label: 'Current Weight', value: currentWeight ? `${currentWeight} lbs` : '—', color: 'text-white' },
    { label: 'Starting Weight', value: startWeight ? `${startWeight} lbs` : '—', color: 'text-gray-400' },
    { label: 'Total Change', value: fmtChange(changeTotal), color: changeColor(changeTotal) },
    { label: 'This Month', value: fmtChange(changeThisMonth), color: changeColor(changeThisMonth) },
  ]

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Weight Tracker</h1>
        <p className="text-gray-500 text-sm mt-0.5">Log your body weight over time</p>
      </div>

      {/* Log form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-300">Log Weight</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Weight (lbs)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder="e.g. 175.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Notes (optional)</label>
          <input
            type="text"
            placeholder="Morning, fasted, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        {saveError && (
          <p className="text-xs text-red-400">Error: {saveError}</p>
        )}
        <button
          onClick={handleSave}
          disabled={!weight || saving}
          className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
            !weight || saving
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-400 text-white'
          }`}
        >
          {saving ? 'Saving…' : 'Save Weight'}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map(({ label, value, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
            <p className={`text-base font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {entries.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Scale size={14} className="text-emerald-400" />
              Weight Over Time
            </h2>
            <div className="flex gap-1">
              {RANGES.map(({ label, months }) => (
                <button
                  key={label}
                  onClick={() => setRange(months)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    range === months
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {chartData.length < 2 ? (
            <p className="text-center text-gray-600 text-sm py-8">Log at least 2 entries to see a chart</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CUSTOM_TOOLTIP />} />
                <Line
                  dataKey="weight_lbs"
                  name="Weight"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#10b981' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Recent entries */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Recent Entries</h2>
        {entries.length === 0 ? (
          <p className="text-center text-gray-600 text-sm py-6">
            No entries yet. Log your first weight above.
          </p>
        ) : (
          <div className="space-y-1">
            {entries.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800/50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-white tabular-nums">{entry.weight_lbs} lbs</span>
                    <span className="text-xs text-gray-500">{format(parseISO(entry.date), 'MMM d, yyyy')}</span>
                  </div>
                  {entry.notes && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">{entry.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                  title="Delete entry"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
