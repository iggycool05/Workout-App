import { useState, useEffect, useCallback } from 'react'
import { subDays, parseISO, isAfter, format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

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
          completed: s.completed,
        })),
    })),
})

export function useWorkouts() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
              id, set_index, weight, reps, time_seconds, completed
            )
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (err) throw err
      setWorkouts((data ?? []).map(toWorkout))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchWorkouts() }, [fetchWorkouts])

  // ----- Mutations -----

  const addWorkout = async (workout) => {
    if (!user) return { error: 'Not authenticated' }
    try {
      // 1. Insert workout row
      const { data: wRow, error: wErr } = await supabase
        .from('workouts')
        .insert({ user_id: user.id, date: workout.date, duration: workout.duration || null, notes: workout.notes || null })
        .select('id')
        .single()
      if (wErr) throw wErr

      // 2. Insert each exercise + its sets
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

  const updateWorkout = async (id, workout) => {
    if (!user) return { error: 'Not authenticated' }
    try {
      const { error: wErr } = await supabase
        .from('workouts')
        .update({ date: workout.date, duration: workout.duration || null, notes: workout.notes || null })
        .eq('id', id)
      if (wErr) throw wErr

      // Delete existing exercises (cascade removes sets)
      const { error: delErr } = await supabase.from('workout_exercises').delete().eq('workout_id', id)
      if (delErr) throw delErr

      // Re-insert exercises + sets
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
    // Optimistically remove from local state, then delete from DB (cascade handles children)
    setWorkouts((prev) => prev.filter((w) => w.id !== id))
    const { error: err } = await supabase.from('workouts').delete().eq('id', id)
    if (err) {
      console.error('Delete failed:', err.message)
      await fetchWorkouts() // restore if delete failed
    }
  }

  // ----- Derived data (computed from in-memory workouts array) -----

  const getWorkoutsByExercise = (exerciseId) =>
    workouts
      .filter((w) => w.exercises.some((e) => e.exerciseId === exerciseId))
      .map((w) => {
        const log = w.exercises.find((e) => e.exerciseId === exerciseId)
        const done = log.sets.filter((s) => s.completed)
        const maxWeight = done.reduce((m, s) => Math.max(m, s.weight || 0), 0)
        const totalVolume = done.reduce((sum, s) => sum + (s.reps || 0) * (s.weight || 0), 0)
        const totalReps = done.reduce((sum, s) => sum + (s.reps || 0), 0)
        const totalTime = done.reduce((sum, s) => sum + (s.time || 0), 0)
        const orm = maxWeight > 0 && done.length > 0
          ? Math.round(maxWeight * (1 + totalReps / (done.length * 30)))
          : 0
        return { date: w.date, workoutId: w.id, maxWeight, totalVolume, totalReps, totalTime, oneRepMax: orm, setsCount: done.length, sets: done }
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))

  const getPersonalRecords = () => {
    const records = {}
    workouts.forEach((w) => {
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
    const recent = workouts.filter((w) => isAfter(parseISO(w.date), cutoff))
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
        .filter((w) => w.date === date)
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
      .filter((w) => isAfter(parseISO(w.date), cutoff))
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
