import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Trash2, ChevronDown, ChevronUp, Dumbbell, Clock, Layers } from 'lucide-react'
import { useWorkouts } from '../hooks/useWorkouts'
import { CATEGORIES } from '../data/exercises'
import ExerciseImage from '../components/ExerciseImage'

function WorkoutCard({ workout, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  const totalSets = workout.exercises.reduce((s, e) => s + e.sets.filter((st) => st.completed).length, 0)
  const totalVolume = workout.exercises.reduce((s, e) =>
    s + e.sets.filter((st) => st.completed).reduce((s2, st) => s2 + (st.reps || 0) * (st.weight || 0), 0), 0)
  const cats = [...new Set(workout.exercises.map((e) => e.category))]

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-start gap-4 p-4">
        <div className="text-center shrink-0 min-w-[52px]">
          <p className="text-2xl font-bold text-white">{format(parseISO(workout.date), 'd')}</p>
          <p className="text-xs text-gray-500 uppercase">{format(parseISO(workout.date), 'MMM')}</p>
          <p className="text-xs text-gray-600">{format(parseISO(workout.date), 'yyyy')}</p>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {cats.map((c) => (
              <span
                key={c}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: CATEGORIES[c]?.color + '20', color: CATEGORIES[c]?.color }}
              >
                {CATEGORIES[c]?.label}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Dumbbell size={13} />
              {workout.exercises.length} exercises
            </span>
            <span className="flex items-center gap-1.5">
              <Layers size={13} />
              {totalSets} sets
            </span>
            {workout.duration && (
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                {workout.duration}m
              </span>
            )}
          </div>

          {totalVolume > 0 && (
            <p className="text-xs text-emerald-400 font-semibold mt-1">
              {totalVolume.toLocaleString()} lbs total volume
            </p>
          )}

          {workout.notes && (
            <p className="text-xs text-gray-500 mt-1 italic">"{workout.notes}"</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          <button
            onClick={() => onDelete(workout.id)}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-800 p-4 space-y-4">
          {workout.exercises.map((e, ei) => {
            const completedSets = e.sets.filter((s) => s.completed)
            return (
              <div key={ei} className="flex items-start gap-3">
                <ExerciseImage category={e.category} size="sm" className="w-10 h-10 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-200">{e.exerciseName}</p>
                  <div className="mt-2 space-y-1">
                    {completedSets.map((s, si) => (
                      <div key={si} className="flex items-center gap-2 text-xs">
                        <span className="w-5 text-gray-600 font-mono">{si + 1}</span>
                        {s.time ? (
                          <span className="text-gray-300">{s.time}s</span>
                        ) : (
                          <span className="text-gray-300">{s.weight} lbs × {s.reps} reps</span>
                        )}
                        {si === 0 && completedSets.length > 0 && (
                          <span className="text-gray-600">
                            {/* Volume for this set */}
                          </span>
                        )}
                      </div>
                    ))}
                    {completedSets.length === 0 && (
                      <p className="text-xs text-gray-600">No completed sets</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function History() {
  const { workouts, loading, deleteWorkout } = useWorkouts()
  const [filter, setFilter] = useState('all')

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const filtered = workouts.filter((w) => {
    if (filter === 'all') return true
    return w.exercises.some((e) => e.category === filter)
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Workout History</h1>
        <p className="text-gray-500 text-sm mt-0.5">{workouts.length} workout{workouts.length !== 1 ? 's' : ''} logged</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
            filter === 'all'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
              : 'text-gray-400 border-gray-800 hover:border-gray-700 hover:text-gray-200'
          }`}
        >
          All
        </button>
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border text-gray-400 border-gray-800 hover:border-gray-700 hover:text-gray-200"
            style={filter === key ? { color: cat.color, backgroundColor: cat.color + '18', borderColor: cat.color + '40' } : {}}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Dumbbell size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium text-gray-400">No workouts yet</p>
          <p className="text-sm mt-1">Start logging to see your history here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((w) => (
            <WorkoutCard key={w.id} workout={w} onDelete={deleteWorkout} />
          ))}
        </div>
      )}
    </div>
  )
}
