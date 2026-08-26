import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { exercises, CATEGORIES, EQUIPMENT, groupExercises } from '../data/exercises'
import ExerciseImage from '../components/ExerciseImage'
import MuscleMap from '../components/MuscleMap'
import { useExerciseNotes } from '../hooks/useExerciseNotes'

export default function ExerciseLibrary() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeEquipment, setActiveEquipment] = useState('all')
  const [selected, setSelected] = useState(null)
  const [openGroup, setOpenGroup] = useState(null)
  const { getExerciseNote, updateExerciseNote } = useExerciseNotes()

  const filtered = useMemo(() => {
    return exercises.filter((e) => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.primaryMuscles.some((m) => m.toLowerCase().includes(search.toLowerCase()))
      const matchCat = activeCategory === 'all' || e.category === activeCategory
      const matchEq = activeEquipment === 'all' || e.equipment === activeEquipment
      return matchSearch && matchCat && matchEq
    })
  }, [search, activeCategory, activeEquipment])

  const grouped = useMemo(() => groupExercises(filtered), [filtered])

  const handleGroupClick = (group) => {
    if (group.exercises.length === 1) {
      setSelected(selected?.id === group.exercises[0].id ? null : group.exercises[0])
      setOpenGroup(null)
      return
    }

    setOpenGroup(openGroup === group.key ? null : group.key)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Exercise Library</h1>
        <p className="text-gray-500 text-sm mt-0.5">{exercises.length} exercises</p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search exercises or muscles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <select
          value={activeEquipment}
          onChange={(e) => setActiveEquipment(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-emerald-500/50"
        >
          <option value="all">All Equipment</option>
          {EQUIPMENT.map((eq) => (
            <option key={eq} value={eq}>{eq.charAt(0).toUpperCase() + eq.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
            activeCategory === 'all'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
              : 'text-gray-400 border-gray-800 hover:border-gray-700 hover:text-gray-200'
          }`}
        >
          All ({exercises.length})
        </button>
        {Object.entries(CATEGORIES).map(([key, cat]) => {
          const count = exercises.filter((e) => e.category === key).length
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                activeCategory === key
                  ? 'border-current'
                  : 'text-gray-400 border-gray-800 hover:border-gray-700 hover:text-gray-200'
              }`}
              style={activeCategory === key ? { color: cat.color, backgroundColor: cat.color + '18', borderColor: cat.color + '40' } : {}}
            >
              {cat.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {grouped.map((group) => {
          const firstExercise = group.exercises[0]
          const selectedInGroup = group.exercises.some((ex) => ex.id === selected?.id)
          const isOpen = openGroup === group.key

          return (
            <div
              key={group.key}
              className={`bg-gray-900 border rounded-xl p-4 text-left transition-all ${
                selectedInGroup || isOpen ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <button onClick={() => handleGroupClick(group)} className="w-full text-left">
                <ExerciseImage category={group.category} size="md" className="mb-3 w-full h-28" />
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-gray-100 leading-tight">{group.family}</h3>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded font-medium shrink-0"
                      style={{ backgroundColor: CATEGORIES[group.category]?.color + '20', color: CATEGORIES[group.category]?.color }}
                    >
                      {CATEGORIES[group.category]?.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{group.primaryMuscles.join(', ')}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{group.exercises.length} variant{group.exercises.length !== 1 ? 's' : ''}</span>
                    <span className="text-xs text-emerald-400 font-medium">
                      {group.exercises.length === 1 ? firstExercise.equipment : 'Choose'}
                    </span>
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="mt-3 space-y-1">
                  {group.exercises.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => setSelected(selected?.id === ex.id ? null : ex)}
                      className={`w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                        selected?.id === ex.id
                          ? 'border-emerald-500/40 bg-emerald-500/10'
                          : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{ex.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{ex.equipment}</p>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded capitalize font-medium shrink-0 ${
                        ex.difficulty === 'beginner' ? 'text-emerald-400 bg-emerald-500/10' :
                        ex.difficulty === 'intermediate' ? 'text-yellow-400 bg-yellow-500/10' :
                        'text-red-400 bg-red-500/10'
                      }`}>{ex.difficulty}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {grouped.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Search size={32} className="mx-auto mb-3 opacity-40" />
          <p>No exercises match your filters.</p>
        </div>
      )}

      {/* Exercise detail panel */}
      {selected && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-auto lg:bottom-6 lg:right-6 lg:w-[420px] bg-gray-900 border border-gray-700 rounded-t-2xl lg:rounded-2xl shadow-2xl z-40 max-h-[85vh] overflow-y-auto">
          <div className="p-5">
            <div className="flex items-start gap-4">
              <ExerciseImage category={selected.category} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-white text-base leading-tight">{selected.name}</h3>
                  <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-lg leading-none shrink-0">×</button>
                </div>
                <p className="text-xs mt-1 font-medium" style={{ color: CATEGORIES[selected.category]?.color }}>
                  {CATEGORIES[selected.category]?.label}
                </p>
                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                  <span className="capitalize">{selected.equipment}</span>
                  <span className={`capitalize font-medium ${
                    selected.difficulty === 'beginner' ? 'text-emerald-400' :
                    selected.difficulty === 'intermediate' ? 'text-yellow-400' : 'text-red-400'
                  }`}>{selected.difficulty}</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <MuscleMap
                primaryMuscles={selected.primaryMuscles}
                secondaryMuscles={selected.secondaryMuscles}
              />
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Primary Muscles</p>
                <p className="text-gray-300">{selected.primaryMuscles.join(', ')}</p>
              </div>
              {selected.secondaryMuscles.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Secondary</p>
                  <p className="text-gray-400">{selected.secondaryMuscles.join(', ')}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Instructions</p>
                <p className="text-gray-400 text-xs leading-relaxed">{selected.description}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Personal Notes</p>
                <textarea
                  value={getExerciseNote(selected.id)}
                  onChange={(e) => updateExerciseNote(selected.id, e.target.value)}
                  placeholder="Add cues, setup notes, seat height, grip, tempo..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-xs leading-relaxed text-gray-300 placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
