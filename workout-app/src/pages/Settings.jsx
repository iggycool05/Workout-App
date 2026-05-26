import { useSettings } from '../hooks/useSettings'
import { Timer, RotateCcw, BellRing } from 'lucide-react'

export default function Settings() {
  const { settings, updateSettings } = useSettings()
  const cd = settings.countdownSeconds
  const rest = settings.restSeconds

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Customize your workout experience</p>
      </div>

      {/* Countdown settings */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Timer size={15} className="text-emerald-400" />
          </div>
          <h2 className="text-sm font-semibold text-gray-200">Timer Countdown</h2>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-200">Countdown before timer starts</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {cd === 0 ? 'Timer starts immediately' : `A ${cd}-second countdown will play before timing begins`}
              </p>
            </div>
            <span className="text-2xl font-bold text-emerald-400 w-12 text-right">
              {cd === 0 ? 'Off' : `${cd}s`}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={cd}
            onChange={(e) => updateSettings({ countdownSeconds: Number(e.target.value) })}
            className="w-full h-2 rounded-full appearance-none accent-emerald-500 bg-gray-700 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1.5">
            <span>Off</span>
            {[1,2,3,4,5,6,7,8,9].map((n) => (
              <span key={n}>{n}</span>
            ))}
            <span>10s</span>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-2">Preview</p>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span>You press</span>
            <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 rounded text-xs font-medium">▶ Start</span>
            <span>→</span>
            {cd === 0 ? (
              <span className="text-emerald-400 font-medium">Timer starts immediately</span>
            ) : (
              <span>
                countdown <span className="text-emerald-400 font-semibold">{cd}, {cd > 1 ? `${cd - 1},` : ''} {cd > 1 ? '… ' : ''}1</span> → timer starts
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Rest timer settings */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <BellRing size={15} className="text-blue-400" />
          </div>
          <h2 className="text-sm font-semibold text-gray-200">Rest Timer</h2>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-200">Rest between sets</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {rest === 0
                  ? 'Rest timer is disabled'
                  : rest < 60
                  ? `${rest}s rest after each completed set`
                  : `${Math.floor(rest / 60)}m ${rest % 60 > 0 ? `${rest % 60}s` : ''} rest after each completed set`}
              </p>
            </div>
            <span className="text-2xl font-bold text-blue-400 w-16 text-right">
              {rest === 0 ? 'Off' : rest < 60 ? `${rest}s` : `${Math.floor(rest / 60)}m${rest % 60 > 0 ? `${rest % 60}` : ''}`}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={300}
            step={15}
            value={rest}
            onChange={(e) => updateSettings({ restSeconds: Number(e.target.value) })}
            className="w-full h-2 rounded-full appearance-none accent-blue-500 bg-gray-700 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1.5">
            <span>Off</span>
            <span>30s</span>
            <span>1m</span>
            <span>1:30</span>
            <span>2m</span>
            <span>2:30</span>
            <span>3m</span>
            <span>3:30</span>
            <span>4m</span>
            <span>4:30</span>
            <span>5m</span>
          </div>
        </div>

        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-xs text-gray-400">
          A countdown timer will appear at the bottom of the screen after you complete a set. A beep sounds when rest is over.
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={() => updateSettings({ countdownSeconds: 3, restSeconds: 90 })}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        <RotateCcw size={13} />
        Reset to defaults
      </button>
    </div>
  )
}
