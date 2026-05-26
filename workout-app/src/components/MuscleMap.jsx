import { useState } from 'react'

// Maps exercise muscle name strings → SVG muscle IDs
const MUSCLE_MAP = {
  'Chest':                ['chest-l', 'chest-r'],
  'Upper Chest':          ['chest-l', 'chest-r'],
  'Triceps':              ['tricep-l', 'tricep-r'],
  'Shoulders':            ['front-delt-l', 'front-delt-r', 'rear-delt-l', 'rear-delt-r'],
  'Front Delts':          ['front-delt-l', 'front-delt-r'],
  'Side Delts':           ['front-delt-l', 'front-delt-r'],
  'Rear Delts':           ['rear-delt-l', 'rear-delt-r'],
  'Rotator Cuff':         ['rear-delt-l', 'rear-delt-r'],
  'Biceps':               ['bicep-l', 'bicep-r'],
  'Brachialis':           ['bicep-l', 'bicep-r'],
  'Forearms':             ['forearm-l', 'forearm-r'],
  'Grip':                 ['forearm-l', 'forearm-r'],
  'Arms':                 ['bicep-l', 'bicep-r', 'tricep-l', 'tricep-r'],
  'Abs':                  ['abs'],
  'Core':                 ['abs', 'oblique-l', 'oblique-r'],
  'Obliques':             ['oblique-l', 'oblique-r'],
  'Transverse Abdominis': ['abs'],
  'Back':                 ['upper-back', 'lat-l', 'lat-r'],
  'Upper Back':           ['upper-back'],
  'Mid Back':             ['upper-back'],
  'Rhomboids':            ['upper-back'],
  'Lats':                 ['lat-l', 'lat-r'],
  'Traps':                ['traps'],
  'Lower Back':           ['lower-back'],
  'Quadratus Lumborum':   ['lower-back'],
  'Glutes':               ['glute-l', 'glute-r'],
  'Outer Glutes':         ['abductor-l', 'abductor-r'],
  'Hamstrings':           ['ham-l', 'ham-r'],
  'Quads':                ['quad-l', 'quad-r'],
  'Calves':               ['calf-l', 'calf-r'],
  'Hip Flexors':          ['hip-flex-l', 'hip-flex-r'],
  'Adductors':            ['adductor-l', 'adductor-r'],
  'Inner Thighs':         ['adductor-l', 'adductor-r'],
  'Abductors':            ['abductor-l', 'abductor-r'],
  'Legs':                 ['quad-l', 'quad-r', 'ham-l', 'ham-r'],
  'Full Body':            ['chest-l', 'chest-r', 'abs', 'quad-l', 'quad-r', 'ham-l', 'ham-r'],
  'Cardiovascular':       ['chest-l', 'chest-r', 'quad-l', 'quad-r', 'ham-l', 'ham-r', 'calf-l', 'calf-r'],
}

const FRONT_IDS = new Set([
  'chest-l', 'chest-r',
  'front-delt-l', 'front-delt-r',
  'bicep-l', 'bicep-r',
  'forearm-l', 'forearm-r',
  'abs', 'oblique-l', 'oblique-r',
  'hip-flex-l', 'hip-flex-r',
  'quad-l', 'quad-r',
  'adductor-l', 'adductor-r',
  'calf-l', 'calf-r',
])

const BACK_IDS = new Set([
  'traps',
  'rear-delt-l', 'rear-delt-r',
  'upper-back', 'lat-l', 'lat-r',
  'tricep-l', 'tricep-r',
  'forearm-l', 'forearm-r',
  'lower-back',
  'glute-l', 'glute-r',
  'ham-l', 'ham-r',
  'abductor-l', 'abductor-r',
  'calf-l', 'calf-r',
])

function resolveIds(muscles = []) {
  const ids = new Set()
  muscles.forEach((m) => MUSCLE_MAP[m]?.forEach((id) => ids.add(id)))
  return ids
}

function pickDefaultView(primaryIds) {
  const frontScore = [...primaryIds].filter((id) => FRONT_IDS.has(id) && !BACK_IDS.has(id)).length
  const backScore = [...primaryIds].filter((id) => BACK_IDS.has(id) && !FRONT_IDS.has(id)).length
  return backScore > frontScore ? 'back' : 'front'
}

// ─── shared style helpers ─────────────────────────────────────────────────────

const BASE   = { fill: '#1e293b', stroke: '#334155', strokeWidth: 1.2 }
const STRUCT  = { fill: '#111827', stroke: '#1e293b', strokeWidth: 1 }  // non-muscle (head, knees, feet)

function muscleStyle(id, primaryIds, secondaryIds) {
  if (primaryIds.has(id))   return { fill: '#ef4444', stroke: '#7f1d1d', strokeWidth: 1.5, filter: 'url(#glow)' }
  if (secondaryIds.has(id)) return { fill: '#f97316', stroke: '#7c2d12', strokeWidth: 1.5, filter: 'url(#glow)' }
  return BASE
}

// ─── SVG filter (rendered once, referenced by both views) ─────────────────────

function GlowFilter() {
  return (
    <defs>
      <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  )
}

// ─── Front view ───────────────────────────────────────────────────────────────

function FrontBody({ primaryIds, secondaryIds }) {
  const s = (id) => muscleStyle(id, primaryIds, secondaryIds)
  return (
    <svg viewBox="0 0 200 420" className="w-full max-w-[160px] mx-auto">
      <GlowFilter />

      {/* ── Structural (non-muscle) ── */}
      <circle cx="100" cy="26" r="21" {...STRUCT} />
      <rect x="91" y="46" width="18" height="20" rx="4" {...STRUCT} />

      {/* ── Front deltoids ── */}
      <ellipse cx="51"  cy="76" rx="17" ry="18" {...s('front-delt-l')} />
      <ellipse cx="149" cy="76" rx="17" ry="18" {...s('front-delt-r')} />

      {/* ── Torso base (behind chest / abs) ── */}
      <rect x="62" y="64" width="76" height="134" rx="12" {...BASE} />

      {/* ── Chest (pectorals) ── */}
      <path d="M 68,66 C 62,92 66,124 100,127 L 100,66 Z"  {...s('chest-l')} />
      <path d="M 132,66 C 138,92 134,124 100,127 L 100,66 Z" {...s('chest-r')} />

      {/* ── Abs ── */}
      <rect x="84" y="127" width="32" height="65" rx="10" {...s('abs')} />

      {/* ── Obliques ── */}
      <ellipse cx="69"  cy="152" rx="15" ry="33" {...s('oblique-l')} />
      <ellipse cx="131" cy="152" rx="15" ry="33" {...s('oblique-r')} />

      {/* ── Biceps ── */}
      <ellipse cx="34"  cy="124" rx="13" ry="27" {...s('bicep-l')} />
      <ellipse cx="166" cy="124" rx="13" ry="27" {...s('bicep-r')} />

      {/* ── Forearms ── */}
      <ellipse cx="23"  cy="183" rx="10" ry="28" {...s('forearm-l')} />
      <ellipse cx="177" cy="183" rx="10" ry="28" {...s('forearm-r')} />

      {/* ── Hands ── */}
      <ellipse cx="23"  cy="217" rx="11" ry="8" {...STRUCT} />
      <ellipse cx="177" cy="217" rx="11" ry="8" {...STRUCT} />

      {/* ── Hip base ── */}
      <ellipse cx="100" cy="200" rx="42" ry="18" {...BASE} />

      {/* ── Hip flexors ── */}
      <ellipse cx="82"  cy="210" rx="18" ry="14" {...s('hip-flex-l')} />
      <ellipse cx="118" cy="210" rx="18" ry="14" {...s('hip-flex-r')} />

      {/* ── Adductors (inner thigh) ── */}
      <ellipse cx="93"  cy="262" rx="10" ry="38" {...s('adductor-l')} />
      <ellipse cx="107" cy="262" rx="10" ry="38" {...s('adductor-r')} />

      {/* ── Quads ── */}
      <ellipse cx="81"  cy="270" rx="20" ry="48" {...s('quad-l')} />
      <ellipse cx="119" cy="270" rx="20" ry="48" {...s('quad-r')} />

      {/* ── Knees ── */}
      <ellipse cx="80"  cy="325" rx="17" ry="10" {...STRUCT} />
      <ellipse cx="120" cy="325" rx="17" ry="10" {...STRUCT} />

      {/* ── Calves (tibialis front) ── */}
      <ellipse cx="79"  cy="368" rx="10" ry="31" {...s('calf-l')} />
      <ellipse cx="121" cy="368" rx="10" ry="31" {...s('calf-r')} />

      {/* ── Feet ── */}
      <ellipse cx="79"  cy="406" rx="14" ry="7" {...STRUCT} />
      <ellipse cx="121" cy="406" rx="14" ry="7" {...STRUCT} />
    </svg>
  )
}

// ─── Back view ────────────────────────────────────────────────────────────────

function BackBody({ primaryIds, secondaryIds }) {
  const s = (id) => muscleStyle(id, primaryIds, secondaryIds)
  return (
    <svg viewBox="0 0 200 420" className="w-full max-w-[160px] mx-auto">
      <GlowFilter />

      {/* ── Structural ── */}
      <circle cx="100" cy="26" r="21" {...STRUCT} />
      <rect x="91" y="46" width="18" height="20" rx="4" {...STRUCT} />

      {/* ── Rear deltoids ── */}
      <ellipse cx="51"  cy="76" rx="17" ry="18" {...s('rear-delt-l')} />
      <ellipse cx="149" cy="76" rx="17" ry="18" {...s('rear-delt-r')} />

      {/* ── Torso base ── */}
      <rect x="62" y="64" width="76" height="134" rx="12" {...BASE} />

      {/* ── Traps ── */}
      <path d="M 80,64 L 100,90 L 120,64 L 142,78 L 100,106 L 58,78 Z" {...s('traps')} />

      {/* ── Upper back (rhomboids / mid traps) ── */}
      <rect x="78" y="106" width="44" height="34" rx="8" {...s('upper-back')} />

      {/* ── Lats ── */}
      <path d="M 62,100 C 50,124 50,162 68,170 L 78,168 L 78,100 Z"   {...s('lat-l')} />
      <path d="M 138,100 C 150,124 150,162 132,170 L 122,168 L 122,100 Z" {...s('lat-r')} />

      {/* ── Lower back ── */}
      <ellipse cx="100" cy="172" rx="24" ry="22" {...s('lower-back')} />

      {/* ── Triceps ── */}
      <ellipse cx="34"  cy="122" rx="13" ry="28" {...s('tricep-l')} />
      <ellipse cx="166" cy="122" rx="13" ry="28" {...s('tricep-r')} />

      {/* ── Forearms ── */}
      <ellipse cx="23"  cy="183" rx="10" ry="28" {...s('forearm-l')} />
      <ellipse cx="177" cy="183" rx="10" ry="28" {...s('forearm-r')} />

      {/* ── Hands ── */}
      <ellipse cx="23"  cy="217" rx="11" ry="8" {...STRUCT} />
      <ellipse cx="177" cy="217" rx="11" ry="8" {...STRUCT} />

      {/* ── Glutes ── */}
      <ellipse cx="82"  cy="208" rx="21" ry="20" {...s('glute-l')} />
      <ellipse cx="118" cy="208" rx="21" ry="20" {...s('glute-r')} />

      {/* ── Abductors (outer thigh) ── */}
      <ellipse cx="69"  cy="260" rx="11" ry="42" {...s('abductor-l')} />
      <ellipse cx="131" cy="260" rx="11" ry="42" {...s('abductor-r')} />

      {/* ── Hamstrings ── */}
      <ellipse cx="81"  cy="270" rx="20" ry="48" {...s('ham-l')} />
      <ellipse cx="119" cy="270" rx="20" ry="48" {...s('ham-r')} />

      {/* ── Knees ── */}
      <ellipse cx="80"  cy="325" rx="17" ry="10" {...STRUCT} />
      <ellipse cx="120" cy="325" rx="17" ry="10" {...STRUCT} />

      {/* ── Calves (gastrocnemius) ── */}
      <ellipse cx="79"  cy="366" rx="11" ry="33" {...s('calf-l')} />
      <ellipse cx="121" cy="366" rx="11" ry="33" {...s('calf-r')} />

      {/* ── Feet ── */}
      <ellipse cx="79"  cy="406" rx="14" ry="7" {...STRUCT} />
      <ellipse cx="121" cy="406" rx="14" ry="7" {...STRUCT} />
    </svg>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────

export default function MuscleMap({ primaryMuscles = [], secondaryMuscles = [] }) {
  const primaryIds   = resolveIds(primaryMuscles)
  const secondaryIds = resolveIds(secondaryMuscles)

  const [view, setView] = useState(() => pickDefaultView(primaryIds))

  return (
    <div className="select-none">
      {/* Front / Back toggle */}
      <div className="flex justify-center gap-2 mb-3">
        {['front', 'back'].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-1 rounded-lg text-xs font-medium capitalize transition-colors border ${
              view === v
                ? 'bg-gray-700 text-white border-gray-600'
                : 'text-gray-500 border-gray-800 hover:text-gray-300'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {view === 'front'
        ? <FrontBody primaryIds={primaryIds} secondaryIds={secondaryIds} />
        : <BackBody  primaryIds={primaryIds} secondaryIds={secondaryIds} />
      }

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3">
        {primaryIds.size > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-xs text-gray-400">Primary</span>
          </div>
        )}
        {secondaryIds.size > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-xs text-gray-400">Secondary</span>
          </div>
        )}
      </div>
    </div>
  )
}
