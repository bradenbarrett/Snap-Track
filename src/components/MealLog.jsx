import MealCard from './MealCard'

export default function MealLog({ meals, onDelete }) {
  if (meals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-5xl mb-3">🍽️</span>
        <p className="text-navy-300 font-medium">No meals logged today</p>
        <p className="text-navy-500 text-sm mt-1">Hit "Snap & Track" to add your first meal</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-navy-300 text-xs uppercase tracking-widest font-semibold px-1">
        Today's Meals
      </h2>
      {[...meals].reverse().map(meal => (
        <MealCard key={meal.id} meal={meal} onDelete={onDelete} />
      ))}
    </div>
  )
}
