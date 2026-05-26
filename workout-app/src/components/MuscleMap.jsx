import { useState } from 'react'

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

function resolveIds(muscles = []) {
  const ids = new Set()
  muscles.forEach((m) => MUSCLE_MAP[m]?.forEach((id) => ids.add(id)))
  return ids
}

// ─── Style constants ──────────────────────────────────────────────────────────

const C = '#2c3c6e'
const BASE   = { fill: '#dce3ed', stroke: C, strokeWidth: 0.9, strokeLinejoin: 'round' }
const STRUCT  = { fill: '#b8c5d5', stroke: C, strokeWidth: 0.9 }

function ms(id, primary, secondary) {
  if (primary.has(id))   return { fill: '#dc2626', stroke: '#7f1d1d', strokeWidth: 1.2, strokeLinejoin: 'round', filter: 'url(#glow)' }
  if (secondary.has(id)) return { fill: '#ea580c', stroke: '#7c2d12', strokeWidth: 1.2, strokeLinejoin: 'round', filter: 'url(#glow)' }
  return BASE
}

function Glow() {
  return (
    <defs>
      <filter id="glow" x="-25%" y="-25%" width="150%" height="150%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  )
}

// ─── Front view ───────────────────────────────────────────────────────────────

function FrontBody({ primaryIds, secondaryIds }) {
  const s = (id) => ms(id, primaryIds, secondaryIds)

  return (
    <svg viewBox="0 0 200 460" className="w-full">
      <Glow />

      {/* Head */}
      <ellipse cx="100" cy="26" rx="20" ry="22" {...STRUCT} />
      {/* Neck */}
      <path d="M 92,46 L 90,65 L 110,65 L 108,46 Z" {...STRUCT} />

      {/* Torso base */}
      <path d="M 63,68 L 62,202 C 62,218 72,226 100,228 C 128,226 138,218 138,202 L 137,68 Z" {...BASE} />

      {/* Front deltoids */}
      <path d="M 79,70 C 63,68 42,78 36,95 C 32,107 37,121 51,123 C 62,125 74,115 80,101 Z" {...s('front-delt-l')} />
      <path d="M 121,70 C 137,68 158,78 164,95 C 168,107 163,121 149,123 C 138,125 126,115 120,101 Z" {...s('front-delt-r')} />

      {/* Chest */}
      <path d="M 80,68 C 68,74 62,88 62,105 C 62,121 72,129 100,131 L 100,68 Z" {...s('chest-l')} />
      <path d="M 120,68 C 132,74 138,88 138,105 C 138,121 128,129 100,131 L 100,68 Z" {...s('chest-r')} />
      <line x1="100" y1="68" x2="100" y2="131" stroke={C} strokeWidth="0.8" />

      {/* Obliques */}
      <path d="M 62,105 C 60,136 60,172 62,203 L 84,201 L 80,131 C 73,123 66,115 62,105 Z" {...s('oblique-l')} />
      <path d="M 138,105 C 140,136 140,172 138,203 L 116,201 L 120,131 C 127,123 134,115 138,105 Z" {...s('oblique-r')} />

      {/* Abs with grid */}
      <path d="M 86,131 C 82,137 82,197 86,201 L 114,201 C 118,197 118,137 114,131 Z" {...s('abs')} />
      <line x1="86" y1="149" x2="114" y2="149" stroke={C} strokeWidth="0.7" />
      <line x1="86" y1="167" x2="114" y2="167" stroke={C} strokeWidth="0.7" />
      <line x1="86" y1="185" x2="114" y2="185" stroke={C} strokeWidth="0.7" />
      <line x1="100" y1="131" x2="100" y2="201" stroke={C} strokeWidth="0.7" />

      {/* Hip flexors */}
      <path d="M 62,201 C 60,219 65,231 80,235 L 93,229 L 90,212 L 75,203 Z" {...s('hip-flex-l')} />
      <path d="M 138,201 C 140,219 135,231 120,235 L 107,229 L 110,212 L 125,203 Z" {...s('hip-flex-r')} />

      {/* Biceps */}
      <path d="M 37,95 C 26,107 20,130 24,152 C 27,164 39,170 51,164 C 59,160 63,148 61,133 L 54,101 Z" {...s('bicep-l')} />
      <path d="M 163,95 C 174,107 180,130 176,152 C 173,164 161,170 149,164 C 141,160 137,148 139,133 L 146,101 Z" {...s('bicep-r')} />

      {/* Forearms */}
      <path d="M 22,164 C 14,176 12,200 16,218 C 18,230 30,234 40,230 C 48,226 52,214 50,200 L 46,164 Z" {...s('forearm-l')} />
      <path d="M 178,164 C 186,176 188,200 184,218 C 182,230 170,234 160,230 C 152,226 148,214 150,200 L 154,164 Z" {...s('forearm-r')} />

      {/* Hands */}
      <ellipse cx="26" cy="240" rx="13" ry="9" {...STRUCT} />
      <ellipse cx="174" cy="240" rx="13" ry="9" {...STRUCT} />

      {/* Adductors */}
      <ellipse cx="91" cy="280" rx="9" ry="36" {...s('adductor-l')} />
      <ellipse cx="109" cy="280" rx="9" ry="36" {...s('adductor-r')} />

      {/* Quads */}
      <path d="M 65,234 C 55,248 51,280 55,310 C 57,328 69,340 83,338 C 96,336 100,322 98,302 L 94,234 Z" {...s('quad-l')} />
      <path d="M 135,234 C 145,248 149,280 145,310 C 143,328 131,340 117,338 C 104,336 100,322 102,302 L 106,234 Z" {...s('quad-r')} />

      {/* Knees */}
      <ellipse cx="81" cy="346" rx="16" ry="10" {...STRUCT} />
      <ellipse cx="119" cy="346" rx="16" ry="10" {...STRUCT} />

      {/* Calves / tibialis anterior */}
      <path d="M 67,354 C 57,368 57,402 63,422 C 67,432 79,436 89,430 C 96,426 96,408 94,386 L 85,354 Z" {...s('calf-l')} />
      <path d="M 133,354 C 143,368 143,402 137,422 C 133,432 121,436 111,430 C 104,426 104,408 106,386 L 115,354 Z" {...s('calf-r')} />

      {/* Feet */}
      <ellipse cx="80" cy="442" rx="17" ry="8" {...STRUCT} />
      <ellipse cx="120" cy="442" rx="17" ry="8" {...STRUCT} />
    </svg>
  )
}

// ─── Back view ────────────────────────────────────────────────────────────────

function BackBody({ primaryIds, secondaryIds }) {
  const s = (id) => ms(id, primaryIds, secondaryIds)

  return (
    <svg viewBox="0 0 200 460" className="w-full">
      <Glow />

      {/* Head */}
      <ellipse cx="100" cy="26" rx="20" ry="22" {...STRUCT} />
      {/* Neck */}
      <path d="M 92,46 L 90,65 L 110,65 L 108,46 Z" {...STRUCT} />

      {/* Torso base */}
      <path d="M 63,68 L 62,202 C 62,218 72,226 100,228 C 128,226 138,218 138,202 L 137,68 Z" {...BASE} />

      {/* Rear deltoids */}
      <path d="M 79,70 C 63,68 42,78 36,95 C 32,107 37,121 51,123 C 62,125 74,115 80,101 Z" {...s('rear-delt-l')} />
      <path d="M 121,70 C 137,68 158,78 164,95 C 168,107 163,121 149,123 C 138,125 126,115 120,101 Z" {...s('rear-delt-r')} />

      {/* Traps */}
      <path d="M 80,66 L 100,92 L 120,66 L 140,78 L 100,112 L 60,78 Z" {...s('traps')} />

      {/* Upper back / rhomboids */}
      <path d="M 80,112 L 82,148 Q 91,152 100,154 Q 109,152 118,148 L 120,112 L 100,92 Z" {...s('upper-back')} />

      {/* Lats */}
      <path d="M 62,104 C 50,122 48,158 54,180 C 57,190 67,196 77,190 L 82,148 L 80,108 Z" {...s('lat-l')} />
      <path d="M 138,104 C 150,122 152,158 146,180 C 143,190 133,196 123,190 L 118,148 L 120,108 Z" {...s('lat-r')} />

      {/* Lower back */}
      <ellipse cx="100" cy="182" rx="22" ry="24" {...s('lower-back')} />

      {/* Triceps */}
      <path d="M 37,95 C 26,107 20,132 24,154 C 27,166 39,172 51,166 C 59,162 63,150 61,136 L 54,101 Z" {...s('tricep-l')} />
      <path d="M 163,95 C 174,107 180,132 176,154 C 173,166 161,172 149,166 C 141,162 137,150 139,136 L 146,101 Z" {...s('tricep-r')} />

      {/* Forearms */}
      <path d="M 22,164 C 14,176 12,200 16,218 C 18,230 30,234 40,230 C 48,226 52,214 50,200 L 46,164 Z" {...s('forearm-l')} />
      <path d="M 178,164 C 186,176 188,200 184,218 C 182,230 170,234 160,230 C 152,226 148,214 150,200 L 154,164 Z" {...s('forearm-r')} />

      {/* Hands */}
      <ellipse cx="26" cy="240" rx="13" ry="9" {...STRUCT} />
      <ellipse cx="174" cy="240" rx="13" ry="9" {...STRUCT} />

      {/* Glutes */}
      <ellipse cx="82" cy="220" rx="22" ry="22" {...s('glute-l')} />
      <ellipse cx="118" cy="220" rx="22" ry="22" {...s('glute-r')} />

      {/* Abductors */}
      <ellipse cx="65" cy="274" rx="12" ry="42" {...s('abductor-l')} />
      <ellipse cx="135" cy="274" rx="12" ry="42" {...s('abductor-r')} />

      {/* Hamstrings */}
      <path d="M 65,242 C 55,256 51,288 55,316 C 57,332 69,342 83,340 C 96,338 100,324 98,304 L 94,242 Z" {...s('ham-l')} />
      <path d="M 135,242 C 145,256 149,288 145,316 C 143,332 131,342 117,340 C 104,338 100,324 102,304 L 106,242 Z" {...s('ham-r')} />

      {/* Knees */}
      <ellipse cx="81" cy="348" rx="16" ry="10" {...STRUCT} />
      <ellipse cx="119" cy="348" rx="16" ry="10" {...STRUCT} />

      {/* Calves / gastrocnemius */}
      <path d="M 67,356 C 57,370 57,404 63,424 C 67,434 79,438 89,432 C 96,428 96,410 94,388 L 85,356 Z" {...s('calf-l')} />
      <path d="M 133,356 C 143,370 143,404 137,424 C 133,434 121,438 111,432 C 104,428 104,410 106,388 L 115,356 Z" {...s('calf-r')} />

      {/* Feet */}
      <ellipse cx="80" cy="444" rx="17" ry="8" {...STRUCT} />
      <ellipse cx="120" cy="444" rx="17" ry="8" {...STRUCT} />
    </svg>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────

export default function MuscleMap({ primaryMuscles = [], secondaryMuscles = [] }) {
  const primaryIds   = resolveIds(primaryMuscles)
  const secondaryIds = resolveIds(secondaryMuscles)

  return (
    <div className="select-none">
      {/* Both views side by side */}
      <div className="bg-slate-100 rounded-2xl py-3 px-2">
        <div className="flex gap-1">
          <div className="flex-1">
            <p className="text-center text-[10px] font-medium text-slate-400 mb-1 uppercase tracking-wide">Front</p>
            <FrontBody primaryIds={primaryIds} secondaryIds={secondaryIds} />
          </div>
          <div className="flex-1">
            <p className="text-center text-[10px] font-medium text-slate-400 mb-1 uppercase tracking-wide">Back</p>
            <BackBody primaryIds={primaryIds} secondaryIds={secondaryIds} />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2">
        {primaryIds.size > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
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
