import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useTemplates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from('workout_templates')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setTemplates(data)
    setLoading(false)
  }

  useEffect(() => { fetchTemplates() }, [])

  const addTemplate = async (name, exercises) => {
    const { data, error } = await supabase
      .from('workout_templates')
      .insert({ name, exercises })
      .select()
      .single()
    if (!error && data) setTemplates((prev) => [data, ...prev])
    return { error: error?.message }
  }

  const deleteTemplate = async (id) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id))
    await supabase.from('workout_templates').delete().eq('id', id)
  }

  return { templates, loading, addTemplate, deleteTemplate }
}
