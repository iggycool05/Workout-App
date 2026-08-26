import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { CATEGORIES, exercises, getExerciseFamily, groupExercises } from '../data/exercises'
import ExerciseImage from './ExerciseImage'

export default function ExerciseGroupPicker({
  onAdd,
  existingIds = [],
  onClose,
  compact = false,
  className = 'bg-gray-900 border border-gray-800',
}) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [openGroup, setOpenGroup] = useState(null)

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = exercises.filter((exercise) => {
      const family = getExerciseFamily(exercise).toLowerCase()
      const matchSearch = !q ||
        exercise.name.toLowerCase().includes(q) ||
        family.includes(q) ||
        exercise.equipment.toLowerCase().includes(q) ||
        exercise.primaryMuscles.some((m) => m.toLowerCase().includes(q))
      const matchCat = category === 'all' || exercise.category === category
      return matchSearch && matchCat
    })

    return groupExercises(filtered)
  }, [search, category])

  const toggleGroup = (key) => {
    setOpenGroup((current) => (current === key ? null : key))
  }

  return (
    <div className={`${className} rounded-xl p-4 space-y-3`}>
      {onClose && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Add Exercise</p>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={15} />
          </button>
        </div>
      )}

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search exercises..."
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

      <div className={`${compact ? 'max-h-48' : 'max-h-56'} overflow-y-auto space-y-1 pr-1`}>
        {groups.map((group) => {
          const isOpen = openGroup === group.key || group.exercises.length === 1
          const allAdded = group.exercises.every((exercise) => existingIds.includes(exercise.id))
          const firstExercise = group.exercises[0]

          return (
            <div key={group.key} className="rounded-lg overflow-hidden">
              <button
                onClick={() => toggleGroup(group.key)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors hover:bg-gray-800"
              >
                <ExerciseImage category={group.category} size="sm" className="w-10 h-10 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">{group.family}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {group.primaryMuscles.join(', ')} - {group.exercises.length} variant{group.exercises.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {group.exercises.length === 1 ? (
                  <span className="text-xs text-gray-600 shrink-0">{allAdded ? 'Added' : firstExercise.equipment}</span>
                ) : (
                  <span className="text-xs text-emerald-400 shrink-0">Choose</span>
                )}
              </button>

              {isOpen && (
                <div className="ml-12 mt-1 mb-1 space-y-1">
                  {group.exercises.map((exercise) => {
                    const already = existingIds.includes(exercise.id)
                    return (
                      <button
                        key={exercise.id}
                        onClick={() => !already && onAdd(exercise)}
                        disabled={already}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-left transition-colors border ${
                          already
                            ? 'opacity-40 cursor-not-allowed border-gray-800 text-gray-600'
                            : 'border-gray-800 text-gray-300 hover:border-emerald-500/30 hover:bg-emerald-500/5'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{exercise.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{exercise.equipment}</p>
                        </div>
                        {already && <span className="text-xs shrink-0">Added</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {groups.length === 0 && (
          <p className="text-center py-6 text-sm text-gray-500">No exercises match your filters.</p>
        )}
      </div>
    </div>
  )
}
