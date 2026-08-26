import { useState } from 'react'

const EXERCISE_NOTES_KEY = 'fittrack-exercise-notes'

const readNotes = () => {
  try {
    return JSON.parse(localStorage.getItem(EXERCISE_NOTES_KEY) || '{}')
  } catch {
    localStorage.removeItem(EXERCISE_NOTES_KEY)
    return {}
  }
}

export function useExerciseNotes() {
  const [notes, setNotes] = useState(readNotes)

  const updateExerciseNote = (exerciseId, note) => {
    setNotes((prev) => {
      const next = { ...prev }
      const cleanNote = note.trimStart()

      if (cleanNote.trim()) next[exerciseId] = cleanNote
      else delete next[exerciseId]

      localStorage.setItem(EXERCISE_NOTES_KEY, JSON.stringify(next))
      return next
    })
  }

  const getExerciseNote = (exerciseId) => notes[exerciseId] || ''

  return { notes, getExerciseNote, updateExerciseNote }
}
