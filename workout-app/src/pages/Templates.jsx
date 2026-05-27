import { useState } from 'react'
import { Plus, Trash2, X, LayoutTemplate, ChevronDown, ChevronUp } from 'lucide-react'
import { exercises } from '../data/exercises'
import { useTemplates } from '../hooks/useTemplates'
import ExerciseImage from '../components/ExerciseImage'
import ExerciseGroupPicker from '../components/ExerciseGroupPicker'

function TemplateCard({ template, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <LayoutTemplate size={18} className="text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{template.name}</p>
          <p className="text-xs text-gray-500">{template.exercises.length} exercise{template.exercises.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          <button
            onClick={() => onDelete(template.id)}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-gray-800 px-4 py-3 space-y-2">
          {template.exercises.map((ex, i) => {
            const staticEx = exercises.find((e) => e.id === ex.exerciseId)
            return (
              <div key={i} className="flex items-center gap-3">
                <ExerciseImage category={ex.category} size="sm" className="w-8 h-8 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">{ex.exerciseName}</p>
                  <p className="text-xs text-gray-500">{staticEx?.primaryMuscles.join(', ')}</p>
                </div>
                <span className="text-xs text-gray-500 shrink-0">{ex.setCount} sets</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CreateTemplateForm({ onSave, onCancel }) {
  const [name, setName] = useState('')
  const [templateExercises, setTemplateExercises] = useState([])
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const addExercise = (ex) => {
    setTemplateExercises((prev) => [...prev, {
      exerciseId: ex.id,
      exerciseName: ex.name,
      category: ex.category,
      setCount: 3,
    }])
    setShowPicker(false)
  }

  const removeExercise = (idx) => setTemplateExercises((prev) => prev.filter((_, i) => i !== idx))
  const updateSetCount = (idx, count) => {
    setTemplateExercises((prev) => prev.map((ex, i) => i === idx ? { ...ex, setCount: Math.max(1, count) } : ex))
  }

  const handleSave = async () => {
    if (!name.trim() || templateExercises.length === 0) return
    setSaving(true)
    setError(null)
    const { error: err } = await onSave(name.trim(), templateExercises)
    if (err) { setError(err); setSaving(false) }
    else onCancel()
  }

  return (
    <div className="bg-gray-900 border border-emerald-500/25 rounded-xl p-5 space-y-4">
      <h2 className="text-base font-semibold text-white">New Template</h2>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Template Name</label>
        <input
          type="text"
          placeholder="e.g. Push Day, Pull Day, Leg Day…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50"
          autoFocus
        />
      </div>

      {templateExercises.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Exercises</p>
          {templateExercises.map((ex, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg p-3">
              <ExerciseImage category={ex.category} size="sm" className="w-8 h-8 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{ex.exerciseName}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => updateSetCount(idx, ex.setCount - 1)}
                  className="w-6 h-6 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 flex items-center justify-center text-sm font-bold"
                >−</button>
                <span className="text-sm text-gray-200 w-6 text-center font-medium">{ex.setCount}</span>
                <button
                  onClick={() => updateSetCount(idx, ex.setCount + 1)}
                  className="w-6 h-6 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 flex items-center justify-center text-sm font-bold"
                >+</button>
                <span className="text-xs text-gray-500">sets</span>
              </div>
              <button
                onClick={() => removeExercise(idx)}
                className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-red-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showPicker ? (
        <ExerciseGroupPicker
          onAdd={addExercise}
          existingIds={templateExercises.map((e) => e.exerciseId)}
          onClose={() => setShowPicker(false)}
          compact
          className="bg-gray-800 border border-gray-700"
        />
      ) : (
        <button
          onClick={() => setShowPicker(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-700 text-gray-500 hover:border-emerald-500/30 hover:text-emerald-400 transition-colors text-sm"
        >
          <Plus size={15} />
          Add Exercise
        </button>
      )}

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          onClick={handleSave}
          disabled={!name.trim() || templateExercises.length === 0 || saving}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            !name.trim() || templateExercises.length === 0 || saving
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-400 text-white'
          }`}
        >
          {saving ? 'Saving…' : 'Save Template'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function Templates() {
  const { templates, loading, addTemplate, deleteTemplate } = useTemplates()
  const [creating, setCreating] = useState(false)

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Templates</h1>
          <p className="text-gray-500 text-sm mt-0.5">Save and reuse your favorite workout structures</p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-white transition-colors shrink-0"
          >
            <Plus size={15} />
            New Template
          </button>
        )}
      </div>

      {creating && (
        <CreateTemplateForm
          onSave={addTemplate}
          onCancel={() => setCreating(false)}
        />
      )}

      {templates.length === 0 && !creating ? (
        <div className="text-center py-16 text-gray-500">
          <LayoutTemplate size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium text-gray-400">No templates yet</p>
          <p className="text-sm mt-1">Create a template to quickly start a workout.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} onDelete={deleteTemplate} />
          ))}
        </div>
      )}

      {!creating && templates.length > 0 && (
        <p className="text-xs text-gray-600 text-center">
          Load templates from the Log Workout page using the "Load Template" button.
        </p>
      )}
    </div>
  )
}
