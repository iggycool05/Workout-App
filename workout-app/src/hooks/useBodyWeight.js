import { useState, useEffect, useCallback, useMemo } from 'react'
import { parseISO, startOfMonth, isAfter } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useBodyWeight() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEntries = useCallback(async () => {
    if (!user) { setEntries([]); setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('body_weights')
        .select('id, date, weight_lbs, notes, created_at')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      if (err) throw err
      setEntries(data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const upsertEntry = useCallback(async (date, weight_lbs, notes) => {
    if (!user) return { error: 'Not signed in' }
    const row = { user_id: user.id, date, weight_lbs: Number(weight_lbs), notes: notes || null }
    const { data, error: err } = await supabase
      .from('body_weights')
      .upsert([row], { onConflict: 'user_id,date' })
      .select('id, date, weight_lbs, notes, created_at')
      .single()
    if (err) return { error: err.message }
    setEntries((prev) => {
      const without = prev.filter((e) => e.date !== date)
      return [data, ...without].sort((a, b) => (a.date < b.date ? 1 : -1))
    })
    return { error: null }
  }, [user])

  const deleteEntry = useCallback(async (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    const { error: err } = await supabase.from('body_weights').delete().eq('id', id)
    if (err) {
      setError(err.message)
      fetchEntries()
    }
  }, [fetchEntries])

  const stats = useMemo(() => {
    if (entries.length === 0) return { currentWeight: null, startWeight: null, changeTotal: null, changeThisMonth: null }
    const current = entries[0]?.weight_lbs ?? null
    const start = entries[entries.length - 1]?.weight_lbs ?? null
    const changeTotal = current !== null && start !== null ? +(current - start).toFixed(1) : null
    const monthStart = startOfMonth(new Date())
    const thisMonthEntries = entries.filter((e) => isAfter(parseISO(e.date), monthStart))
    const changeThisMonth = thisMonthEntries.length > 1
      ? +(thisMonthEntries[0].weight_lbs - thisMonthEntries[thisMonthEntries.length - 1].weight_lbs).toFixed(1)
      : null
    return { currentWeight: current, startWeight: start, changeTotal, changeThisMonth }
  }, [entries])

  return { entries, loading, error, upsertEntry, deleteEntry, stats }
}
