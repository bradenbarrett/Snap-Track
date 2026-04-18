function MacroChip({ label, value, color }) {
  return (
    <span className="flex flex-col items-center min-w-[44px]">
      <span className="text-white font-semibold text-sm leading-none">{Math.round(value)}g</span>
      <span className="text-[10px] mt-0.5" style={{ color }}>{label}</span>
    </span>
  )
}

function ConfidenceDot({ level }) {
  const map = {
    high:   { color: 'bg-emerald-400', title: 'High accuracy' },
    medium: { color: 'bg-lemon-400',   title: 'Medium accuracy' },
    low:    { color: 'bg-red-400',     title: 'Low accuracy' },
  }
  const { color, title } = map[level] ?? map.medium
  return <span className={`w-2 h-2 rounded-full ${color}`} title={title} />
}

export default function MealCard({ meal, onDelete }) {
  const time = new Date(meal.created_at).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="card flex flex-col gap-3 relative group">
      {/* Delete button */}
      <button
        onClick={() => onDelete(meal.id)}
        className="absolute top-3 right-3 text-navy-500 hover:text-red-400 transition-colors text-lg leading-none opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Delete meal"
        title="Delete meal"
      >
        ×
      </button>

      {/* Top row */}
      <div className="flex items-start gap-2 pr-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-white font-semibold text-sm leading-tight truncate">
              {meal.description || 'Meal'}
            </h3>
            {meal.labels_detected && (
              <span
                className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-medium shrink-0"
                title="Nutrition label was detected — high accuracy data"
              >
                ✓ label
              </span>
            )}
            <ConfidenceDot level={meal.confidence} />
          </div>

          {meal.identified_foods?.length > 0 && (
            <p className="text-navy-400 text-xs mt-0.5 truncate">
              {meal.identified_foods.join(', ')}
            </p>
          )}
        </div>

        <div className="text-right shrink-0">
          <span className="text-lemon-400 font-bold text-base leading-tight">
            {Math.round(meal.calories)}
          </span>
          <span className="text-navy-400 text-xs"> kcal</span>
          <p className="text-navy-500 text-[10px] mt-0.5">{time}</p>
        </div>
      </div>

      {/* Macros row */}
      <div className="flex items-center justify-between border-t border-navy-700 pt-2">
        <MacroChip label="Carbs"   value={meal.carbs}   color="#fde047" />
        <MacroChip label="Protein" value={meal.protein} color="#38bdf8" />
        <MacroChip label="Fat"     value={meal.fat}     color="#f472b6" />
        <MacroChip label="Fiber"   value={meal.fiber}   color="#34d399" />
      </div>

      {/* Notes (if any) */}
      {meal.notes && (
        <p className="text-navy-500 text-[10px] italic border-t border-navy-700 pt-2 leading-snug">
          {meal.notes}
        </p>
      )}
    </div>
  )
}
