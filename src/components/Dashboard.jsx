import MacroPieChart from './MacroPieChart'

const GOALS = { calories: 2000, fiber: 30 }

function StatPill({ label, value, unit, max, color }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span className="text-navy-300 text-xs uppercase tracking-wide">{label}</span>
        <span className="text-white font-bold text-sm">
          {Math.round(value)}<span className="text-navy-400 text-xs font-normal"> / {max} {unit}</span>
        </span>
      </div>
      <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}

export default function Dashboard({ totals, mealCount }) {
  return (
    <div className="card flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg leading-tight">Today's Summary</h2>
          <p className="text-navy-400 text-xs mt-0.5">
            {mealCount} meal{mealCount !== 1 ? 's' : ''} logged
          </p>
        </div>
        <span className="text-lemon-400 text-xs font-semibold bg-lemon-400/10 px-2.5 py-1 rounded-full">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Donut + legend */}
      <MacroPieChart totals={totals} />

      {/* Progress bars */}
      <div className="flex flex-col gap-3">
        <StatPill
          label="Calories"
          value={totals.calories}
          unit="kcal"
          max={GOALS.calories}
          color="#fde047"
        />
        <StatPill
          label="Fiber"
          value={totals.fiber}
          unit="g"
          max={GOALS.fiber}
          color="#34d399"
        />
      </div>
    </div>
  )
}
