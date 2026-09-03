export const normalizeSeconds = (seconds) => Math.max(0, Math.floor(Number(seconds) || 0))

export const splitSeconds = (seconds) => {
  const total = normalizeSeconds(seconds)
  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

export const formatTimerTime = (seconds) => {
  const { hours, minutes, seconds: secs } = splitSeconds(seconds)
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export const formatDuration = (seconds) => {
  const parts = splitSeconds(seconds)
  if (parts.hours > 0) return `${parts.hours}h ${parts.minutes}m ${parts.seconds}s`
  if (parts.minutes > 0) return `${parts.minutes}m ${parts.seconds}s`
  return `${parts.seconds}s`
}
