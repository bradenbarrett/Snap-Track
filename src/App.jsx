import { useState } from 'react'
import { useMeals }   from './hooks/useMeals'
import Dashboard      from './components/Dashboard'
import MealLog        from './components/MealLog'
import SnapModal      from './components/SnapModal'

export default function App() {
  const { meals, totals, loading, addMeal, removeMeal } = useMeals()
  const [showSnap, setShowSnap] = useState(false)

  async function handleSave(nutrition) {
    await addMeal(nutrition)
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-navy-950/90 backdrop-blur-md border-b border-navy-800">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lemon-400 text-xl">⚡</span>
            <span className="text-white font-bold text-lg tracking-tight">Snap Track</span>
          </div>
          <span className="text-navy-400 text-xs">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 flex flex-col gap-5 pb-28">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-lemon-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          </div>
        ) : (
          <>
            <Dashboard totals={totals} mealCount={meals.length} />
            <MealLog   meals={meals}   onDelete={removeMeal} />
          </>
        )}
      </main>

      {/* ── Floating Snap & Track button ───────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-6 px-4 bg-gradient-to-t from-navy-950 via-navy-950/80 to-transparent pt-8">
        <button
          className="btn-primary px-10 py-4 text-base rounded-2xl shadow-2xl shadow-lemon-400/20 flex items-center gap-2"
          onClick={() => setShowSnap(true)}
        >
          <span className="text-lg">📷</span>
          Snap &amp; Track
        </button>
      </div>

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {showSnap && (
        <SnapModal
          onClose={() => setShowSnap(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
