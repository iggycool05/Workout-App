import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'
import { Plus, Trash2, Check, Search, ChevronDown, ChevronUp, X, Clock, Save } from 'lucide-react'
import { exercises, CATEGORIES } from '../data/exercises'
import { useWorkouts } from '../hooks/useWorkouts'
import ExerciseImage from '../components/ExerciseImage'

function SetRow({ set, onChange, onDelete, trackTime }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="w-6 text-center text-xs text-gray-600 font-mono">{set.index}</span>
      {trackTime ? (
        <div className="flex items-center gap-1 flex-1">
          <div className="relative flex-1">
            <Clock size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="number"
              placeholder="seconds"
              min={0}
              value={set.time || ''}
              onChange={(e) => onChange({ ...set, time: Number(e.target.value) })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <span className="text-xs text-gray-500 w-6">sec</span>
        </div>
      ) : (
        <>
          <input
            type="number"
            placeholder="lbs"
            min={0}
            step={2.5}
            value={set.weight || ''}
            onChange={(e) => onChange({ ...set, weight: Number(e.target.value) })}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50"
          />
          <span className="text-xs text-gray-500">×</span>
          <input
            type="number"
            placeholder="reps"
            min={0}
            value={set.reps || ''}
            onChange={(e) => onChange({ ...set, reps: Number(e.target.value) })}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50"
          />
        </>
      )}
      <button
        onClick={() => onChange({ ...set, completed: !set.completed })}
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors border ${
          set.completed
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-gray-700 text-gray-600 hover:border-emerald-500/50'
        }`}
      >
        <Check size={13} />
      </button>
      <button
        onClick={onDelete}
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

function ExerciseBlock({ entry, onUpdateSets, onRemove, lastSets }) {
  const ex = exercises.find((e) => e.id === entry.exerciseId)
  const [collapsed, setCollapsed] = useState(false)

  const addSet = () => {
    const last = entry.sets[entry.sets.length - 1]
    const newSet = {
      id: uuidv4(),
      index: entry.sets.length + 1,
      weight: last?.weight || 0,
      reps: last?.reps || 0,
      time: last?.time || 0,
      completed: false,
    }
    onUpdateSets([...entry.sets, newSet])
  }

  const updateSet = (idx, updated) => {
    onUpdateSets(entry.sets.map((s, i) => (i === idx ? updated : s)))
  }

  const deleteSet = (idx) => {
    const updated = entry.sets
      .filter((_, i) => i !== idx)
      .map((s, i) => ({ ...s, index: i + 1 }))
    onUpdateSets(updated)
  }

  if (!ex) return null

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <ExerciseImage category={ex.category} size="sm" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm">{ex.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {ex.primaryMuscles.join(', ')} · {ex.equipment}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{entry.sets.length} sets</span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white"
          >
            {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>
          <button
            onClick={onRemove}
            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-red-400 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="px-4 pb-4">
          {lastSets && lastSets.length > 0 && (
            <div className="mb-3 px-2 py-1.5 bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Previous session</p>
              <p className="text-xs text-gray-400">
                {lastSets.map((s, i) => (
                  ex.trackTime
                    ? `${s.time}s`
                    : `${s.weight}×${s.reps}`
                )).join(', ')}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 mb-1.5 px-6 text-xs text-gray-600 uppercase tracking-wide">
            {ex.trackTime ? (
              <span className="flex-1">Time</span>
            ) : (
              <>
                <span className="flex-1">Weight</span>
                <span className="text-gray-700 w-3" />
                <span className="flex-1">Reps</span>
              </>
            )}
            <span className="w-8 text-center">✓</span>
            <span className="w-8" />
          </div>

          <div className="space-y-0.5">
            {entry.sets.map((set, idx) => (
              <SetRow
                key={set.id}
                set={set}
                trackTime={ex.trackTime}
                onChange={(updated) => updateSet(idx, updated)}
                onDelete={() => deleteSet(idx)}
              />
            ))}
          </div>

          <button
            onClick={addSet}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-emerald-400 py-2 border border-dashed border-gray-800 hover:border-emerald-500/30 rounded-lg transition-colors"
          >
            <Plus size={13} />
            Add Set
          </button>
        </div>
      )}
    </div>
  )
}

function ExercisePicker({ onAdd, existingIds }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const filtered = useMemo(() => {
    return exercises.filter((e) => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.primaryMuscles.some((m) => m.toLowerCase().includes(search.toLowerCase()))
      const matchCat = category === 'all' || e.category === category
      return matchSearch && matchCat
    })
  }, [search, category])

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search exercises…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-4 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
          autoFocus
        />
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {['all', ...Object.keys(CATEGORIES)].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
              category === cat
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                : 'text-gray-500 border-gray-800 hover:text-gray-300'
            }`}
          >
            {cat === 'all' ? 'All' : CATEGORIES[cat].label}
          </button>
        ))}
      </div>
      <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
        {filtered.map((ex) => {
          const already = existingIds.includes(ex.id)
          return (
            <button
              key={ex.id}
              onClick={() => !already && onAdd(ex)}
              disabled={already}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                already
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-gray-800 cursor-pointer'
              }`}
            >
              <ExerciseImage category={ex.category} size="sm" className="w-10 h-10 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{ex.name}</p>
                <p className="text-xs text-gray-500">{ex.primaryMuscles.join(', ')}</p>
              </div>
              {already && <span className="text-xs text-gray-600">Added</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function LogWorkout() {
  const navigate = useNavigate()
  const { addWorkout, getWorkoutsByExercise } = useWorkouts()

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [notes, setNotes] = useState('')
  const [duration, setDuration] = useState('')
  const [entries, setEntries] = useState([])
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const addExercise = (ex) => {
    setEntries((prev) => [
      ...prev,
      {
        id: uuidv4(),
        exerciseId: ex.id,
        exerciseName: ex.name,
        category: ex.category,
        sets: [{ id: uuidv4(), index: 1, weight: 0, reps: 0, time: 0, completed: false }],
      },
    ])
    setShowPicker(false)
  }

  const removeExercise = (entryId) => {
    setEntries((prev) => prev.filter((e) => e.id !== entryId))
  }

  const updateSets = (entryId, sets) => {
    setEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, sets } : e)))
  }

  const getLastSets = useCallback((exerciseId) => {
    const history = getWorkoutsByExercise(exerciseId)
    return history.length > 0 ? history[history.length - 1].sets : null
  }, [getWorkoutsByExercise])

  const handleSave = async () => {
    if (entries.length === 0) return
    setSaving(true)
    setSaveError(null)
    const workout = {
      date,
      duration: duration ? Number(duration) : null,
      notes,
      exercises: entries.map((e) => ({
        exerciseId: e.exerciseId,
        exerciseName: e.exerciseName,
        category: e.category,
        sets: e.sets,
      })),
    }
    const { error } = await addWorkout(workout)
    if (error) {
      setSaveError(error)
      setSaving(false)
    } else {
      navigate('/history')
    }
  }

  const totalSets = entries.reduce((s, e) => s + e.sets.filter((st) => st.completed).length, 0)
  const totalVol = entries.reduce((s, e) =>
    s + e.sets.filter((st) => st.completed).reduce((s2, st) => s2 + (st.reps || 0) * (st.weight || 0), 0), 0)

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Log Workout</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track your sets, reps, and weight</p>
        </div>
        <button
          onClick={handleSave}
          disabled={entries.length === 0 || saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            entries.length === 0 || saving
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-400 text-white'
          }`}
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Saving…
            </>
          ) : (
            <><Save size={15} />Save Workout</>
          )}
        </button>
      </div>

      {saveError && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-sm text-red-400">
          Failed to save: {saveError}
        </div>
      )}

      {/* Workout meta */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
            <label className="text-xs text-gray-500 mb-1 block">Duration (min)</label>
            <input
              type="number"
              placeholder="e.g. 60"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div className="sm:col-span-1 col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">Notes</label>
            <input
              type="text"
              placeholder="How did it go?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>
      </div>

      {/* Live stats */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Exercises', value: entries.length },
            { label: 'Sets Done', value: totalSets },
            { label: 'Volume', value: totalVol > 0 ? `${totalVol.toLocaleString()} lbs` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-emerald-400">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Exercise blocks */}
      <div className="space-y-3">
        {entries.map((entry) => (
          <ExerciseBlock
            key={entry.id}
            entry={entry}
            onUpdateSets={(sets) => updateSets(entry.id, sets)}
            onRemove={() => removeExercise(entry.id)}
            lastSets={getLastSets(entry.exerciseId)}
          />
        ))}
      </div>

      {/* Add exercise */}
      {showPicker ? (
        <ExercisePicker
          onAdd={addExercise}
          existingIds={entries.map((e) => e.exerciseId)}
        />
      ) : (
        <button
          onClick={() => setShowPicker(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed border-gray-800 text-gray-500 hover:border-emerald-500/30 hover:text-emerald-400 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Add Exercise
        </button>
      )}

      {entries.length === 0 && !showPicker && (
        <div className="text-center py-8 text-gray-600 text-sm">
          Add exercises above to start logging your workout.
        </div>
      )}
    </div>
  )
}
