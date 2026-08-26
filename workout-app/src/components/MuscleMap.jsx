import bodyImage from '../assets/body.png'

const MUSCLE_MAP = {
  'Chest': ['chest-l', 'chest-r'],
  'Upper Chest': ['chest-l', 'chest-r'],
  'Triceps': ['tricep-l', 'tricep-r'],
  'Shoulders': ['front-delt-l', 'front-delt-r', 'rear-delt-l', 'rear-delt-r'],
  'Front Delts': ['front-delt-l', 'front-delt-r'],
  'Side Delts': ['front-delt-l', 'front-delt-r'],
  'Rear Delts': ['rear-delt-l', 'rear-delt-r'],
  'Rotator Cuff': ['rear-delt-l', 'rear-delt-r'],
  'Biceps': ['bicep-l', 'bicep-r'],
  'Brachialis': ['bicep-l', 'bicep-r'],
  'Forearms': ['forearm-l', 'forearm-r'],
  'Grip': ['forearm-l', 'forearm-r'],
  'Arms': ['bicep-l', 'bicep-r', 'tricep-l', 'tricep-r'],
  'Abs': ['abs'],
  'Core': ['abs', 'oblique-l', 'oblique-r'],
  'Obliques': ['oblique-l', 'oblique-r'],
  'Transverse Abdominis': ['abs'],
  'Back': ['upper-back', 'lat-l', 'lat-r'],
  'Upper Back': ['upper-back'],
  'Mid Back': ['upper-back'],
  'Rhomboids': ['upper-back'],
  'Lats': ['lat-l', 'lat-r'],
  'Traps': ['traps'],
  'Lower Back': ['lower-back'],
  'Quadratus Lumborum': ['lower-back'],
  'Glutes': ['glute-l', 'glute-r'],
  'Outer Glutes': ['abductor-l', 'abductor-r'],
  'Hamstrings': ['ham-l', 'ham-r'],
  'Quads': ['quad-l', 'quad-r'],
  'Calves': ['calf-l', 'calf-r'],
  'Hip Flexors': ['hip-flex-l', 'hip-flex-r'],
  'Adductors': ['adductor-l', 'adductor-r'],
  'Inner Thighs': ['adductor-l', 'adductor-r'],
  'Abductors': ['abductor-l', 'abductor-r'],
  'Legs': ['quad-l', 'quad-r', 'ham-l', 'ham-r'],
  'Full Body': ['chest-l', 'chest-r', 'abs', 'quad-l', 'quad-r', 'ham-l', 'ham-r'],
  'Cardiovascular': ['chest-l', 'chest-r', 'quad-l', 'quad-r', 'ham-l', 'ham-r', 'calf-l', 'calf-r'],
}

const REGIONS = [
  { id: 'front-delt-l', label: 'Left front deltoid', points: '116,216 125,189 145,179 160,179 163,181 139,205' },
  { id: 'front-delt-r', label: 'Right front deltoid', points: '228,179 243,179 263,189 273,216 251,207 224,180' },
  { id: 'chest-l', label: 'Left chest', points: '159,186 176,180 180,180 192,186 192,216 184,226 168,232 149,227 133,213' },
  { id: 'chest-r', label: 'Right chest', points: '196,186 208,180 211,180 229,186 255,213 236,229 225,232 207,228 196,215' },
  { id: 'bicep-l', label: 'Left biceps', points: '124,216 131,216 137,221 137,234 109,266 98,262 100,241 108,225' },
  { id: 'bicep-r', label: 'Right biceps', points: '264,216 276,221 287,238 290,261 285,266 273,263 251,235 250,224 256,216' },
  { id: 'forearm-l', label: 'Left forearm', points: '95,252 96,264 110,269 93,297 69,320 64,320 61,313 74,281' },
  { id: 'forearm-r', label: 'Right forearm', points: '294,252 313,279 327,313 324,320 318,320 294,296 278,270 292,264' },
  { id: 'oblique-l', label: 'Left obliques', points: '140,221 169,250 165,273 167,295 163,305 155,311 150,310 154,277 141,246' },
  { id: 'oblique-r', label: 'Right obliques', points: '248,221 248,242 234,276 237,311 233,311 225,305 221,295 223,273 219,250' },
  { id: 'abs', label: 'Abdominals', points: '173,230 194,222 216,231 223,291 211,330 194,351 177,329 166,291' },
  { id: 'hip-flex-l', label: 'Left hip flexor', points: '145,309 166,329 181,366 160,356 142,338' },
  { id: 'hip-flex-r', label: 'Right hip flexor', points: '244,309 222,329 207,366 229,356 247,338' },
  { id: 'adductor-l', label: 'Left adductors', points: '170,356 193,382 190,458 177,447 163,398' },
  { id: 'adductor-r', label: 'Right adductors', points: '219,356 197,382 200,458 213,447 227,398' },
  { id: 'quad-l', label: 'Left quadriceps', points: '150,316 158,332 168,396 179,415 176,444 165,461 159,460 154,449 144,447 139,427 140,364' },
  { id: 'quad-r', label: 'Right quadriceps', points: '238,316 248,365 249,427 244,447 234,449 225,462 214,450 209,415 220,396 229,336' },
  { id: 'rear-delt-l', label: 'Left rear deltoid', points: '466,209 472,192 496,178 503,178 513,184 505,192 484,206' },
  { id: 'rear-delt-r', label: 'Right rear deltoid', points: '577,184 587,178 595,178 616,190 625,209 603,205 585,192' },
  { id: 'traps', label: 'Trapezius', points: '520,191 534,187 555,187 570,190 546,244' },
  { id: 'upper-back', label: 'Upper back', points: '514,188 577,188 592,225 548,316 500,225' },
  { id: 'lat-l', label: 'Left lat', points: '486,209 514,187 536,232 536,249 521,282 520,304 500,318 502,269 488,234' },
  { id: 'lat-r', label: 'Right lat', points: '555,229 575,187 576,187 604,208 602,235 587,275 591,318 570,304 569,282 553,242' },
  { id: 'lower-back', label: 'Lower back', points: '520,304 545,318 569,304 581,359 547,382 511,360' },
  { id: 'tricep-l', label: 'Left triceps', points: '483,209 485,232 466,258 457,264 454,254 443,253 445,243 454,224 464,213' },
  { id: 'tricep-r', label: 'Right triceps', points: '609,209 626,213 636,224 645,243 647,253 636,254 634,264 622,256 604,230 607,209' },
  { id: 'forearm-l', label: 'Left rear forearm', points: '440,254 451,255 452,264 460,266 418,323 410,325 407,318 418,286' },
  { id: 'forearm-r', label: 'Right rear forearm', points: '650,254 668,277 683,318 680,325 672,323 630,266 638,264 639,255' },
  { id: 'glute-l', label: 'Left glute', points: '532,308 543,320 543,358 534,366 514,364 502,350 509,318 522,308' },
  { id: 'glute-r', label: 'Right glute', points: '569,308 576,311 582,320 588,349 581,361 568,366 552,365 547,358 547,320 559,308' },
  { id: 'ham-l', label: 'Left hamstring', points: '507,315 499,342 500,353 510,365 531,370 537,394 525,452 516,463 512,457 498,456 494,451 487,415 490,361 497,326' },
  { id: 'ham-r', label: 'Right hamstring', points: '582,314 592,324 596,341 603,382 603,415 595,453 572,462 565,451 553,394 559,370 580,365 590,354 590,337' },
  { id: 'abductor-l', label: 'Left hip abductor', points: '487,332 499,349 493,452 481,433 474,385' },
  { id: 'abductor-r', label: 'Right hip abductor', points: '604,332 591,349 598,452 610,433 617,385' },
  { id: 'calf-l', label: 'Left calf', points: '489,481 495,487 510,488 515,493 517,521 510,533 486,531 483,526 481,498' },
  { id: 'calf-r', label: 'Right calf', points: '603,481 609,501 607,526 604,531 584,533 578,532 573,522 575,492 580,488 595,487' },
]

function resolveIds(muscles = []) {
  const ids = new Set()
  muscles.forEach((m) => MUSCLE_MAP[m]?.forEach((id) => ids.add(id)))
  return ids
}

function regionClass(regionId, primaryIds, secondaryIds) {
  if (primaryIds.has(regionId)) return 'muscle-region muscle-region-primary'
  if (secondaryIds.has(regionId)) return 'muscle-region muscle-region-secondary'
  return 'muscle-region'
}

export default function MuscleMap({ primaryMuscles = [], secondaryMuscles = [] }) {
  const primaryIds = resolveIds(primaryMuscles)
  const secondaryIds = resolveIds(secondaryMuscles)

  return (
    <div className="select-none">
      <div className="bg-white rounded-2xl py-3 px-2 border border-gray-100">
        <div className="relative mx-auto w-full max-w-[370px] overflow-hidden rounded-lg bg-white">
          <img
            src={bodyImage}
            alt="Front and back muscle anatomy"
            className="block w-full h-auto"
            draggable="false"
          />
          <svg
            viewBox="0 0 740 656"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <defs>
              <filter id="primary-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.4 0 0 0 0 0.02 0 0 0 0 0.02 0 0 0 0.5 0" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="secondary-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feColorMatrix in="blur" type="matrix" values="1 0.32 0 0 0.45 0 0.14 0 0 0.08 0 0 0 0 0.02 0 0 0 0.45 0" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {REGIONS.map((region) => (
              <polygon
                key={`${region.id}-${region.label}`}
                points={region.points}
                className={regionClass(region.id, primaryIds, secondaryIds)}
              >
                <title>{region.label}</title>
              </polygon>
            ))}
          </svg>
        </div>
      </div>

      {(primaryIds.size > 0 || secondaryIds.size > 0) && (
        <div className="flex items-center justify-center gap-5 mt-2">
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
      )}

      <style>{`
        .muscle-region {
          fill: transparent;
          stroke: transparent;
          stroke-linejoin: round;
          stroke-width: 2;
          vector-effect: non-scaling-stroke;
          pointer-events: none;
          transition: fill 180ms ease, stroke 180ms ease, opacity 180ms ease;
        }

        .muscle-region-primary {
          fill: rgba(220, 38, 38, 0.62);
          stroke: rgba(127, 29, 29, 0.85);
          filter: url(#primary-glow);
        }

        .muscle-region-secondary {
          fill: rgba(249, 115, 22, 0.55);
          stroke: rgba(154, 52, 18, 0.82);
          filter: url(#secondary-glow);
        }
      `}</style>
    </div>
  )
}
