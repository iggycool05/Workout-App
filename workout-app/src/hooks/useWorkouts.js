import { useState, useEffect, useCallback } from 'react'
import { subDays, parseISO, isAfter, format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const OFFLINE_QUEUE_KEY = 'fittrack-offline-queue'

const readQueue = () => {
  try { return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]') }
  catch { return [] }
}

const writeQueue = (queue) => {
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
  window.dispatchEvent(new CustomEvent('fittrack-queue-change', { detail: queue.length }))
}

// Transform Supabase nested row → the shape the UI expects
const toWorkout = (row) => ({
  id: row.id,
  date: row.date,
  duration: row.duration,
  notes: row.notes,
  exercises: (row.workout_exercises ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((we) => ({
      exerciseId: we.exercise_id,
      exerciseName: we.exercise_name,
      category: we.category,
      sets: (we.exercise_sets ?? [])
        .slice()
        .sort((a, b) => a.set_index - b.set_index)
        .map((s) => ({
          id: s.id,
          index: s.set_index,
          weight: s.weight,
          reps: s.reps,
          time: s.time_seconds,
          distance: s.distance,
          completed: s.completed,
        })),
    })),
})

export function useWorkouts() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pendingCount, setPendingCount] = useState(() => readQueue().length)

  const fetchWorkouts = useCallback(async () => {
    if (!user) {
      setWorkouts([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('workouts')
        .select(`
          id, date, duration, notes,
          workout_exercises (
            id, exercise_id, exercise_name, category, sort_order,
            exercise_sets (
              id, set_index, weight, reps, time_seconds, distance, completed
            )
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (err) throw err

      const realWorkouts = (data ?? []).map(toWorkout)

      // Merge offline-queued workouts into the list so they show in History
      const queue = readQueue()
      const pendingWorkouts = queue.map((w, i) => ({
        id: `pending-${i}`,
        date: w.date,
        duration: w.duration,
        notes: w.notes,
        exercises: w.exercises,
        pending: true,
      }))

      setPendingCount(queue.length)
      setWorkouts([...pendingWorkouts, ...realWorkouts])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchWorkouts() }, [fetchWorkouts])

  // ----- Internal: write a single workout to Supabase -----

  const _insertToSupabase = async (workout) => {
    const { data: wRow, error: wErr } = await supabase
      .from('workouts')
      .insert({ user_id: user.id, date: workout.date, duration: workout.duration || null, notes: workout.notes || null })
      .select('id')
      .single()
    if (wErr) throw wErr

    for (let i = 0; i < workout.exercises.length; i++) {
      const ex = workout.exercises[i]
      const { data: weRow, error: weErr } = await supabase
        .from('workout_exercises')
        .insert({ workout_id: wRow.id, exercise_id: ex.exerciseId, exercise_name: ex.exerciseName, category: ex.category, sort_order: i })
        .select('id')
        .single()
      if (weErr) throw weErr

      const setsToInsert = ex.sets.map((s, j) => ({
        workout_exercise_id: weRow.id,
        set_index: j + 1,
        weight: s.weight || null,
        reps: s.reps || null,
        time_seconds: s.time || null,
        distance: s.distance || null,
        completed: s.completed,
      }))
      if (setsToInsert.length > 0) {
        const { error: sErr } = await supabase.from('exercise_sets').insert(setsToInsert)
        if (sErr) throw sErr
      }
    }
  }

  // ----- Flush offline queue to Supabase -----

  const flushOfflineQueue = useCallback(async () => {
    if (!user || !navigator.onLine) return
    const queue = readQueue()
    if (queue.length === 0) return

    const remaining = []
    for (const workout of queue) {
      try {
        await _insertToSupabase(workout)
      } catch {
        remaining.push(workout)
      }
    }

    writeQueue(remaining)
    setPendingCount(remaining.length)
    await fetchWorkouts()
  }, [user, fetchWorkouts]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Auto-flush on mount if back online with pending items
    if (navigator.onLine && readQueue().length > 0 && user) {
      flushOfflineQueue()
    }

    window.addEventListener('online', flushOfflineQueue)
    return () => window.removeEventListener('online', flushOfflineQueue)
  }, [flushOfflineQueue])

  // ----- Mutations -----

  const addWorkout = async (workout) => {
    if (!user) return { error: 'Not authenticated' }

    if (!navigator.onLine) {
      try {
        const queue = readQueue()
        queue.push(workout)
        writeQueue(queue)
        setPendingCount(queue.length)
        // Show it immediately in the list as pending
        setWorkouts((prev) => [{
          id: `pending-${Date.now()}`,
          date: workout.date,
          duration: workout.duration,
          notes: workout.notes,
          exercises: workout.exercises,
          pending: true,
        }, ...prev])
        return { error: null }
      } catch (err) {
        return { error: 'Failed to save offline: ' + err.message }
      }
    }

    try {
      await _insertToSupabase(workout)
      await fetchWorkouts()
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  const updateWorkout = async (id, workout) => {
    if (!user) return { error: 'Not authenticated' }
    try {
      const { error: wErr } = await supabase
        .from('workouts')
        .update({ date: workout.date, duration: workout.duration || null, notes: workout.notes || null })
        .eq('id', id)
      if (wErr) throw wErr

      const { error: delErr } = await supabase.from('workout_exercises').delete().eq('workout_id', id)
      if (delErr) throw delErr

      for (let i = 0; i < workout.exercises.length; i++) {
        const ex = workout.exercises[i]
        const { data: weRow, error: weErr } = await supabase
          .from('workout_exercises')
          .insert({ workout_id: id, exercise_id: ex.exerciseId, exercise_name: ex.exerciseName, category: ex.category, sort_order: i })
          .select('id').single()
        if (weErr) throw weErr

        const setsToInsert = ex.sets.map((s, j) => ({
          workout_exercise_id: weRow.id,
          set_index: j + 1,
          weight: s.weight || null,
          reps: s.reps || null,
          time_seconds: s.time || null,
          completed: s.completed,
        }))
        if (setsToInsert.length > 0) {
          const { error: sErr } = await supabase.from('exercise_sets').insert(setsToInsert)
          if (sErr) throw sErr
        }
      }

      await fetchWorkouts()
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  const deleteWorkout = async (id) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id))
    const { error: err } = await supabase.from('workouts').delete().eq('id', id)
    if (err) {
      console.error('Delete failed:', err.message)
      await fetchWorkouts()
    }
  }

  // ----- Derived data -----

  const getWorkoutsByExercise = (exerciseId) =>
    workouts
      .filter((w) => !w.pending && w.exercises.some((e) => e.exerciseId === exerciseId))
      .map((w) => {
        const log = w.exercises.find((e) => e.exerciseId === exerciseId)
        const done = log.sets.filter((s) => s.completed)
        const maxWeight = done.reduce((m, s) => Math.max(m, s.weight || 0), 0)
        const totalVolume = done.reduce((sum, s) => sum + (s.reps || 0) * (s.weight || 0), 0)
        const totalReps = done.reduce((sum, s) => sum + (s.reps || 0), 0)
        const totalTime = done.reduce((sum, s) => sum + (s.time || 0), 0)
        const maxTime = done.reduce((m, s) => Math.max(m, s.time || 0), 0)
        const totalDistance = done.reduce((sum, s) => sum + (s.distance || 0), 0)
        const maxDistance = done.reduce((m, s) => Math.max(m, s.distance || 0), 0)
        const orm = maxWeight > 0 && done.length > 0
          ? Math.round(maxWeight * (1 + totalReps / (done.length * 30)))
          : 0
        return { date: w.date, workoutId: w.id, maxWeight, totalVolume, totalReps, totalTime, maxTime, totalDistance, maxDistance, oneRepMax: orm, setsCount: done.length, sets: done }
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))

  const getPersonalRecords = () => {
    const records = {}
    workouts.filter((w) => !w.pending).forEach((w) => {
      w.exercises.forEach((e) => {
        e.sets.forEach((s) => {
          if (s.completed && s.weight) {
            if (!records[e.exerciseId] || s.weight > records[e.exerciseId].weight) {
              records[e.exerciseId] = { weight: s.weight, reps: s.reps, date: w.date, exerciseName: e.exerciseName }
            }
          }
        })
      })
    })
    return records
  }

  const getWeeklyStats = (days = 7) => {
    const cutoff = subDays(new Date(), days)
    const recent = workouts.filter((w) => !w.pending && isAfter(parseISO(w.date), cutoff))
    const totalVolume = recent.reduce((sum, w) =>
      sum + w.exercises.reduce((s2, e) =>
        s2 + e.sets.filter((s) => s.completed).reduce((s3, s) => s3 + (s.reps || 0) * (s.weight || 0), 0), 0), 0)
    const totalDuration = recent.reduce((sum, w) => sum + (w.duration || 0), 0)
    return { workoutsCount: recent.length, totalVolume, totalDuration }
  }

  const getDailyVolume = (days = 14) => {
    const result = []
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
      const vol = workouts
        .filter((w) => !w.pending && w.date === date)
        .reduce((sum, w) =>
          sum + w.exercises.reduce((s2, e) =>
            s2 + e.sets.filter((s) => s.completed).reduce((s3, s) => s3 + (s.reps || 0) * (s.weight || 0), 0), 0), 0)
      result.push({ date, volume: vol, label: format(subDays(new Date(), i), 'MMM d') })
    }
    return result
  }

  const getMuscleRadar = (days = 30) => {
    const cutoff = subDays(new Date(), days)
    const map = { chest: 0, back: 0, legs: 0, shoulders: 0, arms: 0, core: 0, cardio: 0 }
    workouts
      .filter((w) => !w.pending && isAfter(parseISO(w.date), cutoff))
      .forEach((w) => w.exercises.forEach((e) => {
        if (map[e.category] !== undefined) map[e.category] += e.sets.filter((s) => s.completed).length
      }))
    return Object.entries(map).map(([key, value]) => ({
      category: key.charAt(0).toUpperCase() + key.slice(1),
      value,
      fullMark: 20,
    }))
  }

  return {
    workouts,
    loading,
    error,
    pendingCount,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkoutsByExercise,
    getPersonalRecords,
    getWeeklyStats,
    getDailyVolume,
    getMuscleRadar,
    refresh: fetchWorkouts,
  }
}
