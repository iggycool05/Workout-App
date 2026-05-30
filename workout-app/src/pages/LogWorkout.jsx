import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'
import { Plus, Trash2, Check, ChevronDown, ChevronUp, X, Save, RotateCcw, Play, Pause, LayoutTemplate, BellRing } from 'lucide-react'
import { exercises } from '../data/exercises'
import { useWorkouts } from '../hooks/useWorkouts'
import { useSettings } from '../hooks/useSettings'
import { useTemplates } from '../hooks/useTemplates'
import { useExerciseNotes } from '../hooks/useExerciseNotes'
import ExerciseImage from '../components/ExerciseImage'
import ExerciseGroupPicker from '../components/ExerciseGroupPicker'

const DRAFT_KEY = 'fittrack-workout-draft'
const WORKOUT_TIMER_KEY = 'fittrack-workout-duration-timer'

const fmtTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

const readWorkoutTimer = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(WORKOUT_TIMER_KEY) || 'null')
    if (!saved) return null

    if (saved.state === 'running' && saved.startedAt) {
      return {
        state: 'running',
        elapsed: Math.max(0, Math.floor((Date.now() - saved.startedAt) / 1000)),
        countdown: 0,
        startedAt: saved.startedAt,
      }
    }

    if (saved.state === 'countdown' && saved.countdownEndsAt) {
      const remaining = Math.ceil((saved.countdownEndsAt - Date.now()) / 1000)
      if (remaining > 0) {
        return { state: 'countdown', elapsed: 0, countdown: remaining, startedAt: null }
      }
      return {
        state: 'running',
        elapsed: Math.max(0, Math.floor((Date.now() - saved.countdownEndsAt) / 1000)),
        countdown: 0,
        startedAt: saved.countdownEndsAt,
      }
    }

    if (saved.state === 'paused') {
      return {
        state: 'paused',
        elapsed: saved.elapsed || 0,
        countdown: 0,
        startedAt: null,
      }
    }
  } catch {
    localStorage.removeItem(WORKOUT_TIMER_KEY)
  }

  return null
}

const playRestDoneTone = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.38)
  } catch {
    // Audio is a convenience; browser autoplay rules may block it.
  }
}

function SetRow({ set, onChange, onDelete, trackTime, countdownSeconds }) {
  // 'idle' | 'countdown' | 'running' | 'paused'
  const [timerState, setTimerState] = useState('idle')
  const [timerElapsed, setTimerElapsed] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const startTimeRef = useRef(null)

  // Countdown tick
  useEffect(() => {
    if (timerState !== 'countdown') return
    if (countdown <= 0) { setTimerState('running'); return }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [timerState, countdown])

  // Timer tick
  useEffect(() => {
    if (timerState !== 'running') return
    startTimeRef.current = Date.now() - timerElapsed * 1000
    const interval = setInterval(() => {
      setTimerElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 200)
    return () => clearInterval(interval)
  }, [timerState]) // eslint-disable-line react-hooks/exhaustive-deps

  const startTimer = () => {
    if (countdownSeconds > 0) { setCountdown(countdownSeconds); setTimerState('countdown') }
    else setTimerState('running')
  }
  const pauseTimer = () => setTimerState('paused')
  const resetTimer = () => { setTimerState('idle'); setTimerElapsed(0); setCountdown(0) }
  const saveTimer = () => { onChange({ ...set, time: timerElapsed }); resetTimer() }

  return (
    <div className="flex items-center gap-1.5 py-1">
      <span className="w-5 text-center text-xs text-gray-600 font-mono shrink-0">{set.index}</span>

      {trackTime ? (
        <div className="flex-1 flex items-center gap-1.5 min-w-0">
          {timerState === 'countdown' ? (
            // Countdown: big pulsing number
            <>
              <div className="flex-1 bg-gray-800 border border-emerald-500/40 rounded-lg py-1.5 font-mono text-lg font-bold text-emerald-400 text-center animate-pulse tabular-nums">
                {countdown}
              </div>
              <button
                onClick={resetTimer}
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-gray-500 hover:text-gray-300 transition-colors"
              >
                <X size={12} />
              </button>
            </>
          ) : timerState === 'running' ? (
            // Running: show live timer + pause + save
            <>
              <div className="flex-1 bg-gray-800 border border-emerald-500/40 rounded-lg px-3 py-1.5 font-mono text-sm text-emerald-400 text-center tabular-nums">
                {fmtTime(timerElapsed)}
              </div>
              <button
                onClick={pauseTimer}
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 transition-colors"
              >
                <Pause size={11} />
              </button>
              <button
                onClick={saveTimer}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
              >
                Save
              </button>
            </>
          ) : timerState === 'paused' ? (
            // Paused: show frozen time + resume + save + reset
            <>
              <div className="flex-1 bg-gray-800 border border-amber-500/30 rounded-lg px-3 py-1.5 font-mono text-sm text-amber-400 text-center tabular-nums">
                {fmtTime(timerElapsed)}
              </div>
              <button
                onClick={startTimer}
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                <Play size={11} />
              </button>
              <button
                onClick={saveTimer}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
              >
                Save
              </button>
              <button
                onClick={resetTimer}
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-gray-600 hover:text-gray-400 transition-colors"
              >
                <RotateCcw size={11} />
              </button>
            </>
          ) : (
            // Idle: manual input + start button
            <>
              <input
                type="number"
                inputMode="decimal"
                placeholder="secs"
                min={0}
                value={set.time || ''}
                onChange={(e) => onChange({ ...set, time: Number(e.target.value) })}
                className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50"
              />
              <button
                onClick={startTimer}
                title="Start timer"
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                <Play size={11} />
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <input
            type="number"
            inputMode="decimal"
            placeholder="lbs"
            min={0}
            step={2.5}
            value={set.weight || ''}
            onChange={(e) => onChange({ ...set, weight: Number(e.target.value) })}
            className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50"
          />
          <span className="text-xs text-gray-600 shrink-0">×</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="reps"
            min={0}
            value={set.reps || ''}
            onChange={(e) => onChange({ ...set, reps: Number(e.target.value) })}
            className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50"
          />
        </>
      )}

      <button
        onClick={() => onChange({ ...set, completed: !set.completed })}
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors border ${
          set.completed
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-gray-700 text-gray-600 hover:border-emerald-500/50'
        }`}
      >
        <Check size={12} />
      </button>
      <button
        onClick={onDelete}
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <Trash2 size={12} />
      </button>
    </div>
  )
}

function ExerciseBlock({
  entry,
  onUpdateEntry,
  onUpdateSets,
  onRemove,
  lastSets,
  countdownSeconds,
  restTimerEnabled,
  onSetCompleted,
  exerciseNote,
  onExerciseNoteChange,
}) {
  const ex = exercises.find((e) => e.id === entry.exerciseId)
  const [collapsed, setCollapsed] = useState(false)

  const addSet = () => {
    const last = entry.sets[entry.sets.length - 1]
    onUpdateSets([...entry.sets, {
      id: uuidv4(),
      index: entry.sets.length + 1,
      weight: last?.weight || 0,
      reps: last?.reps || 0,
      time: last?.time || 0,
      completed: false,
    }])
  }

  const updateSet = (idx, updated) => {
    const previous = entry.sets[idx]
    onUpdateSets(entry.sets.map((s, i) => (i === idx ? updated : s)))
    if (!previous?.completed && updated.completed) onSetCompleted(entry)
  }

  const deleteSet = (idx) => {
    onUpdateSets(entry.sets.filter((_, i) => i !== idx).map((s, i) => ({ ...s, index: i + 1 })))
  }

  if (!ex) return null

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <ExerciseImage category={ex.category} size="sm" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate">{ex.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {ex.primaryMuscles.join(', ')} · {ex.equipment}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-gray-500 hidden sm:block">{entry.sets.length} sets</span>
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
        <div className="px-3 sm:px-4 pb-4">
          {restTimerEnabled && (
            <label className="mb-3 flex items-center gap-2 rounded-lg bg-gray-800/50 border border-gray-800 px-2.5 py-2">
              <BellRing size={13} className="text-blue-400 shrink-0" />
              <span className="text-xs text-gray-500 shrink-0">Rest</span>
              <input
                type="number"
                min={0}
                step={15}
                value={entry.restSeconds ?? 0}
                onChange={(e) => onUpdateEntry({ restSeconds: Math.max(0, Number(e.target.value)) })}
                className="min-w-0 flex-1 bg-transparent text-right text-xs font-semibold text-gray-200 focus:outline-none"
              />
              <span className="text-xs text-gray-500">sec</span>
            </label>
          )}

          {lastSets && lastSets.length > 0 && (
            <div className="mb-3 px-2 py-1.5 bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Previous session</p>
              <p className="text-xs text-gray-400">
                {lastSets.map((s) => ex.trackTime ? `${s.time}s` : `${s.weight}×${s.reps}`).join(', ')}
              </p>
            </div>
          )}

          <label className="mb-3 block rounded-lg bg-gray-800/50 border border-gray-800 px-2.5 py-2">
            <span className="mb-1 block text-xs text-gray-500">Exercise notes</span>
            <textarea
              value={exerciseNote}
              onChange={(e) => onExerciseNoteChange(e.target.value)}
              placeholder="Cues, setup, tempo, seat height..."
              rows={2}
              className="w-full resize-none bg-transparent text-xs leading-relaxed text-gray-300 placeholder-gray-600 focus:outline-none"
            />
          </label>

          <div className="flex items-center gap-1.5 mb-1 pl-5 text-xs text-gray-600 uppercase tracking-wide">
            {ex.trackTime ? (
              <span className="flex-1">Time (sec)</span>
            ) : (
              <>
                <span className="flex-1">Weight</span>
                <span className="w-3" />
                <span className="flex-1">Reps</span>
              </>
            )}
            <span className="w-7 text-center">✓</span>
            <span className="w-7" />
          </div>

          <div className="space-y-0.5">
            {entry.sets.map((set, idx) => (
              <SetRow
                key={set.id}
                set={set}
                trackTime={ex.trackTime}
                onChange={(updated) => updateSet(idx, updated)}
                onDelete={() => deleteSet(idx)}
                countdownSeconds={countdownSeconds}
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

export default function LogWorkout() {
  const navigate = useNavigate()
  const { id: editId } = useParams()
  const isEditing = !!editId
  const savedDurTimer = useMemo(() => readWorkoutTimer(), [])

  const { workouts, loading, addWorkout, updateWorkout, getWorkoutsByExercise } = useWorkouts()
  const { settings } = useSettings()
  const { templates } = useTemplates()
  const { getExerciseNote, updateExerciseNote } = useExerciseNotes()

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [notes, setNotes] = useState('')
  const [duration, setDuration] = useState('')
  const [activeRest, setActiveRest] = useState(null)
  const [restMinimized, setRestMinimized] = useState(false)

  // Workout duration timer
  const [durState, setDurState] = useState(savedDurTimer?.state || 'idle') // idle|countdown|running|paused
  const [durElapsed, setDurElapsed] = useState(savedDurTimer?.elapsed || 0)
  const [durCountdown, setDurCountdown] = useState(savedDurTimer?.countdown || 0)
  const durStartRef = useRef(savedDurTimer?.startedAt || null)

  useEffect(() => {
    if (durState !== 'countdown') return
    if (durCountdown <= 0) { setDurState('running'); return }
    const t = setTimeout(() => setDurCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [durState, durCountdown])

  useEffect(() => {
    if (durState !== 'running') return
    durStartRef.current = Date.now() - durElapsed * 1000
    const interval = setInterval(() => {
      setDurElapsed(Math.floor((Date.now() - durStartRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [durState]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (durState === 'idle') {
      localStorage.removeItem(WORKOUT_TIMER_KEY)
      return
    }

    if (durState === 'running') {
      const startedAt = durStartRef.current || Date.now() - durElapsed * 1000
      localStorage.setItem(WORKOUT_TIMER_KEY, JSON.stringify({ state: 'running', startedAt }))
      return
    }

    if (durState === 'countdown') {
      localStorage.setItem(WORKOUT_TIMER_KEY, JSON.stringify({
        state: 'countdown',
        countdownEndsAt: Date.now() + durCountdown * 1000,
      }))
      return
    }

    if (durState === 'paused') {
      localStorage.setItem(WORKOUT_TIMER_KEY, JSON.stringify({ state: 'paused', elapsed: durElapsed }))
    }
  }, [durState, durElapsed, durCountdown])

  useEffect(() => {
    if (!activeRest) return

    const timer = setTimeout(() => {
      setActiveRest((current) => {
        if (!current) return null
        if (current.remaining <= 1) {
          playRestDoneTone()
          return null
        }
        return { ...current, remaining: current.remaining - 1 }
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [activeRest])

  const startDurTimer = () => {
    if (settings.countdownSeconds > 0) { setDurCountdown(settings.countdownSeconds); setDurState('countdown') }
    else setDurState('running')
  }
  const pauseDurTimer = () => setDurState('paused')
  const resetDurTimer = () => {
    setDurState('idle')
    setDurElapsed(0)
    setDurCountdown(0)
    durStartRef.current = null
    localStorage.removeItem(WORKOUT_TIMER_KEY)
  }
  const saveDurTimer = () => {
    setDuration(String(Math.max(1, Math.round(durElapsed / 60))))
    resetDurTimer()
  }
  const fmtDur = (s) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
      : `${m}:${sec.toString().padStart(2, '0')}`
  }
  const [entries, setEntries] = useState([])
  const [showPicker, setShowPicker] = useState(false)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [draftRestored, setDraftRestored] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const editWorkout = useMemo(
    () => (isEditing ? workouts.find((w) => w.id === editId) : null),
    [workouts, editId, isEditing]
  )

  // Pre-fill form when editing an existing workout
  useEffect(() => {
    if (!isEditing || !editWorkout) return
    setDate(editWorkout.date)
    setDuration(editWorkout.duration?.toString() || '')
    setNotes(editWorkout.notes || '')
    setEntries(
      editWorkout.exercises.map((ex) => ({
        id: uuidv4(),
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        category: ex.category,
        restSeconds: ex.restSeconds ?? settings.restSeconds,
        sets: ex.sets.map((s) => ({ id: s.id || uuidv4(), index: s.index, weight: s.weight, reps: s.reps, time: s.time, completed: s.completed })),
      }))
    )
  }, [editWorkout, isEditing, settings.restSeconds])

  // Load draft from localStorage on mount (new workouts only)
  useEffect(() => {
    if (!isEditing) {
      try {
        const saved = localStorage.getItem(DRAFT_KEY)
        if (saved) {
          const draft = JSON.parse(saved)
          if (draft.entries?.length > 0) {
            setDate(draft.date || format(new Date(), 'yyyy-MM-dd'))
            setDuration(draft.duration || '')
            setNotes(draft.notes || '')
            setEntries(draft.entries.map((entry) => ({
              ...entry,
              restSeconds: settings.restSeconds,
            })))
            setDraftRestored(true)
          }
        }
      } catch {
        localStorage.removeItem(DRAFT_KEY)
      }
    }
    setInitialized(true)
  }, [settings.restSeconds]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save draft to localStorage on every change (new workouts only)
  useEffect(() => {
    if (!initialized || isEditing) return
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ date, duration, notes, entries }))
  }, [initialized, isEditing, date, duration, notes, entries])

  useEffect(() => {
    if (!initialized) return
    // Keep current exercise rest defaults aligned with the Settings value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries((prev) => prev.map((entry) => ({ ...entry, restSeconds: settings.restSeconds })))
  }, [initialized, settings.restSeconds])

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
    localStorage.removeItem(WORKOUT_TIMER_KEY)
    setDraftRestored(false)
    setDate(format(new Date(), 'yyyy-MM-dd'))
    setDuration('')
    setNotes('')
    setEntries([])
    resetDurTimer()
  }

  const loadTemplate = (template) => {
    setEntries(template.exercises.map((ex) => ({
      id: uuidv4(),
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      category: ex.category,
      restSeconds: ex.restSeconds ?? settings.restSeconds,
      sets: Array.from({ length: ex.setCount || 3 }, (_, i) => ({
        id: uuidv4(),
        index: i + 1,
        weight: 0,
        reps: 0,
        time: 0,
        completed: false,
      })),
    })))
    setShowTemplatePicker(false)
    setShowPicker(false)
  }

  const addExercise = (ex) => {
    setEntries((prev) => [...prev, {
      id: uuidv4(),
      exerciseId: ex.id,
      exerciseName: ex.name,
      category: ex.category,
      restSeconds: settings.restSeconds,
      sets: [{ id: uuidv4(), index: 1, weight: 0, reps: 0, time: 0, completed: false }],
    }])
    setShowPicker(false)
  }

  const removeExercise = (entryId) => setEntries((prev) => prev.filter((e) => e.id !== entryId))
  const updateEntry = (entryId, updates) => setEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, ...updates } : e)))
  const updateSets = (entryId, sets) => setEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, sets } : e)))

  const startRestForEntry = (entry) => {
    if (!settings.restTimerEnabled) return
    const seconds = entry.restSeconds ?? settings.restSeconds
    if (!seconds || seconds <= 0) return
    setRestMinimized(false)
    setActiveRest({
      entryId: entry.id,
      exerciseName: entry.exerciseName,
      total: seconds,
      remaining: seconds,
    })
  }

  const adjustActiveRest = (delta) => {
    setActiveRest((current) => {
      if (!current) return null
      const nextRemaining = Math.max(0, current.remaining + delta)
      return { ...current, remaining: nextRemaining, total: Math.max(current.total, nextRemaining) }
    })
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
        restSeconds: e.restSeconds,
        sets: e.sets,
      })),
    }

    const { error } = isEditing
      ? await updateWorkout(editId, workout)
      : await addWorkout(workout)

    if (error) {
      setSaveError(error)
      setSaving(false)
    } else {
      if (!isEditing) localStorage.removeItem(DRAFT_KEY)
      localStorage.removeItem(WORKOUT_TIMER_KEY)
      navigate('/history')
    }
  }

  const totalSets = entries.reduce((s, e) => s + e.sets.filter((st) => st.completed).length, 0)
  const totalVol = entries.reduce((s, e) =>
    s + e.sets.filter((st) => st.completed).reduce((s2, st) => s2 + (st.reps || 0) * (st.weight || 0), 0), 0)

  if (isEditing && loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit Workout' : 'Log Workout'}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isEditing ? 'Update your saved workout' : 'Track your sets, reps, and weight'}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={entries.length === 0 || saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shrink-0 ${
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
            <><Save size={15} />{isEditing ? 'Update' : 'Save'}</>
          )}
        </button>
      </div>

      {/* Draft restored banner */}
      {draftRestored && (
        <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/25 rounded-xl px-4 py-2.5">
          <p className="text-sm text-blue-400">Draft restored from your last session</p>
          <button
            onClick={clearDraft}
            className="flex items-center gap-1.5 text-xs text-blue-400/70 hover:text-blue-300 transition-colors"
          >
            <RotateCcw size={12} /> Clear
          </button>
        </div>
      )}

      {/* Auto-save indicator */}
      {!isEditing && entries.length > 0 && !draftRestored && (
        <p className="text-xs text-gray-600 text-right">Draft auto-saved</p>
      )}

      {saveError && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-sm text-red-400">
          Failed to save: {saveError}
        </div>
      )}

      {activeRest && (
        restMinimized ? (
          <button
            onClick={() => setRestMinimized(false)}
            className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-blue-500/30 bg-gray-950/95 px-3 py-2 shadow-2xl backdrop-blur"
          >
            <BellRing size={15} className="text-blue-300" />
            <span className="font-mono text-sm font-bold tabular-nums text-white">{fmtTime(activeRest.remaining)}</span>
            <ChevronUp size={14} className="text-gray-500" />
          </button>
        ) : (
          <div className="fixed left-4 right-4 bottom-4 z-50 mx-auto max-w-md rounded-2xl border border-blue-500/30 bg-gray-950/95 p-4 shadow-2xl backdrop-blur">
            <button
              onClick={() => setRestMinimized(true)}
              title="Minimize rest timer"
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-800 hover:text-gray-200"
            >
              <ChevronDown size={15} />
            </button>

            <div className="flex items-center gap-3 pr-8">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                <BellRing size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-blue-300">
                  Rest timer
                </p>
                <p className="truncate text-sm text-gray-300">{activeRest.exerciseName}</p>
              </div>
              <div className="text-2xl font-bold tabular-nums text-white">{fmtTime(activeRest.remaining)}</div>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-800">
              <div
                className="h-full rounded-full bg-blue-400 transition-all"
                style={{ width: `${Math.max(0, Math.min(100, (activeRest.remaining / activeRest.total) * 100))}%` }}
              />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                onClick={() => adjustActiveRest(-15)}
                className="rounded-lg border border-gray-800 py-2 text-xs font-medium text-gray-400 hover:border-gray-700 hover:text-gray-200"
              >
                -15s
              </button>
              <button
                onClick={() => setActiveRest(null)}
                className="rounded-lg border border-blue-500/30 bg-blue-500/10 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-500/20"
              >
                Skip
              </button>
              <button
                onClick={() => adjustActiveRest(15)}
                className="rounded-lg border border-gray-800 py-2 text-xs font-medium text-gray-400 hover:border-gray-700 hover:text-gray-200"
              >
                +15s
              </button>
            </div>
          </div>
        )
      )}

      {/* Workout meta */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
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
            <label className="text-xs text-gray-500 mb-1 block">Duration (min)</label>
            {durState === 'countdown' ? (
              <div className="flex items-center gap-1.5">
                <div className="flex-1 bg-gray-800 border border-emerald-500/40 rounded-lg py-2 font-mono text-lg font-bold text-emerald-400 text-center animate-pulse tabular-nums">
                  {durCountdown}
                </div>
                <button
                  onClick={resetDurTimer}
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-gray-500 hover:text-gray-300 transition-colors border border-gray-700"
                >
                  <X size={13} />
                </button>
              </div>
            ) : durState === 'running' ? (
              <div className="flex items-center gap-1.5">
                <div className="flex-1 bg-gray-800 border border-emerald-500/40 rounded-lg px-3 py-2 font-mono text-sm text-emerald-400 text-center tabular-nums">
                  {fmtDur(durElapsed)}
                </div>
                <button
                  onClick={pauseDurTimer}
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 transition-colors"
                >
                  <Pause size={13} />
                </button>
                <button
                  onClick={saveDurTimer}
                  className="px-2.5 py-2 rounded-lg text-xs font-semibold shrink-0 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                >
                  Save
                </button>
              </div>
            ) : durState === 'paused' ? (
              <div className="flex items-center gap-1.5">
                <div className="flex-1 bg-gray-800 border border-amber-500/30 rounded-lg px-3 py-2 font-mono text-sm text-amber-400 text-center tabular-nums">
                  {fmtDur(durElapsed)}
                </div>
                <button
                  onClick={startDurTimer}
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                >
                  <Play size={13} />
                </button>
                <button
                  onClick={saveDurTimer}
                  className="px-2.5 py-2 rounded-lg text-xs font-semibold shrink-0 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={resetDurTimer}
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-gray-600 hover:text-gray-400 transition-colors border border-gray-700"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="e.g. 60"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50"
                />
                <button
                  onClick={startDurTimer}
                  title="Start workout timer"
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                >
                  <Play size={13} />
                </button>
              </div>
            )}
          </div>
          <div className="col-span-2">
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
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: 'Exercises', value: entries.length },
            { label: 'Sets Done', value: totalSets },
            { label: 'Volume', value: totalVol > 0 ? `${totalVol.toLocaleString()}` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-lg p-2.5 sm:p-3 text-center">
              <p className="text-base sm:text-lg font-bold text-emerald-400">{value}</p>
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
            onUpdateEntry={(updates) => updateEntry(entry.id, updates)}
            onUpdateSets={(sets) => updateSets(entry.id, sets)}
            onRemove={() => removeExercise(entry.id)}
            lastSets={getLastSets(entry.exerciseId)}
            countdownSeconds={settings.countdownSeconds}
            restTimerEnabled={settings.restTimerEnabled}
            onSetCompleted={startRestForEntry}
            exerciseNote={getExerciseNote(entry.exerciseId)}
            onExerciseNoteChange={(note) => updateExerciseNote(entry.exerciseId, note)}
          />
        ))}
      </div>

      {/* Add exercise */}
      {showPicker ? (
        <ExerciseGroupPicker
          onAdd={addExercise}
          existingIds={entries.map((e) => e.exerciseId)}
          onClose={() => setShowPicker(false)}
        />
      ) : showTemplatePicker ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Load Template</p>
            <button onClick={() => setShowTemplatePicker(false)} className="text-gray-500 hover:text-white transition-colors">
              <X size={15} />
            </button>
          </div>
          {templates.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No templates yet — create one on the Templates page.
            </p>
          ) : (
            <div className="space-y-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => loadTemplate(t)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-800 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-left transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-200">{t.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.exercises.length} exercise{t.exercises.length !== 1 ? 's' : ''}</p>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">Load →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setShowPicker(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed border-gray-800 text-gray-500 hover:border-emerald-500/30 hover:text-emerald-400 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Add Exercise
          </button>
          {!isEditing && templates.length > 0 && (
            <button
              onClick={() => setShowTemplatePicker(true)}
              title="Load template"
              className="flex items-center gap-2 px-4 py-3.5 rounded-xl border-2 border-dashed border-gray-800 text-gray-500 hover:border-emerald-500/30 hover:text-emerald-400 transition-colors text-sm font-medium"
            >
              <LayoutTemplate size={16} />
              Template
            </button>
          )}
        </div>
      )}

      {entries.length === 0 && !showPicker && !showTemplatePicker && (
        <div className="text-center py-8 text-gray-600 text-sm">
          Add exercises above to start logging your workout.
        </div>
      )}
    </div>
  )
}
