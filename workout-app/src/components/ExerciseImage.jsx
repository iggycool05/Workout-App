import { CATEGORIES } from '../data/exercises'

const CATEGORY_SVGS = {
  chest: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="20" r="10" fill="currentColor" opacity="0.3" />
      <path d="M25 30 Q40 60 55 30" stroke="currentColor" strokeWidth="3" fill="currentColor" fillOpacity="0.4" />
      <rect x="30" y="32" width="20" height="14" rx="4" fill="currentColor" opacity="0.7" />
      <line x1="15" y1="35" x2="30" y2="38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="65" y1="35" x2="50" y2="38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="15" y1="35" x2="10" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="65" y1="35" x2="70" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 46 L32 65 L35 72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M48 46 L48 65 L45 72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  back: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="20" r="10" fill="currentColor" opacity="0.3" />
      <path d="M28 32 L52 32 L55 50 L40 55 L25 50 Z" fill="currentColor" opacity="0.6" />
      <path d="M34 55 L32 70" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M46 55 L48 70" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="28" y1="35" x2="16" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="52" y1="35" x2="64" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M40 32 L40 55" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
    </svg>
  ),
  legs: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="14" r="8" fill="currentColor" opacity="0.3" />
      <rect x="30" y="24" width="20" height="18" rx="3" fill="currentColor" opacity="0.5" />
      <path d="M30 40 Q28 52 30 64 L34 72" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M50 40 Q52 52 50 64 L46 72" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M30 40 Q28 52 30 64" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="currentColor" fillOpacity="0.4" />
      <path d="M50 40 Q52 52 50 64" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="currentColor" fillOpacity="0.4" />
    </svg>
  ),
  shoulders: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="20" r="10" fill="currentColor" opacity="0.3" />
      <circle cx="20" cy="35" r="8" fill="currentColor" opacity="0.7" />
      <circle cx="60" cy="35" r="8" fill="currentColor" opacity="0.7" />
      <path d="M28 35 L52 35 L50 50 L30 50 Z" fill="currentColor" opacity="0.4" />
      <line x1="12" y1="38" x2="28" y2="38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="68" y1="38" x2="52" y2="38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 50 L30 70" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M48 50 L50 70" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  arms: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="16" r="9" fill="currentColor" opacity="0.3" />
      <path d="M32 26 L28 45 Q24 55 20 62" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M48 26 L52 45 Q56 55 60 62" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M25 42 Q22 48 26 52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M55 42 Q58 48 54 52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
      <rect x="33" y="26" width="14" height="20" rx="3" fill="currentColor" opacity="0.4" />
      <path d="M33 46 L31 68" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M47 46 L49 68" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  core: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="16" r="9" fill="currentColor" opacity="0.3" />
      <rect x="31" y="27" width="18" height="30" rx="4" fill="currentColor" opacity="0.6" />
      <line x1="40" y1="30" x2="40" y2="54" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="31" y1="37" x2="49" y2="37" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="31" y1="44" x2="49" y2="44" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <path d="M33 57 L31 72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M47 57 L49 72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="20" y1="30" x2="31" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="30" x2="49" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  cardio: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="16" r="9" fill="currentColor" opacity="0.3" />
      <path d="M32 27 L28 40 L36 40 L30 60" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8" />
      <path d="M48 27 L54 38 L46 42 L52 62" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6" />
      <path d="M15 48 L20 44 L25 50 L30 42 L35 52 L40 44 L45 52 L50 44 L55 48 L65 44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
}

export default function ExerciseImage({ category, size = 'md', className = '' }) {
  const cat = CATEGORIES[category] || CATEGORIES.chest
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    full: 'w-full h-full',
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-xl flex items-center justify-center bg-gradient-to-br ${cat.gradient} ${className}`}
      style={{ color: cat.color }}
    >
      <div className={size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-20 h-20' : 'w-14 h-14'}>
        {CATEGORY_SVGS[category] || CATEGORY_SVGS.chest}
      </div>
    </div>
  )
}
