import { useState, useEffect, useCallback } from 'react'

const LS_KEY = 'snap_track_meals'

function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    const all = JSON.parse(raw)
    const today = new Date().toDateString()
    return all.filter(m => new Date(m.created_at).toDateString() === today)
  } catch {
    return []
  }
}

function saveLocal(meals) {
  try {
    const cutoff = Date.now() - 7 * 86400_000
    const raw = localStorage.getItem(LS_KEY)
    const all = raw ? JSON.parse(raw) : []
    const pruned = all.filter(m => new Date(m.created_at).getTime() > cutoff)
    const today = new Date().toDateString()
    const other = pruned.filter(m => new Date(m.created_at).toDateString() !== today)
    localStorage.setItem(LS_KEY, JSON.stringify([...other, ...meals]))
  } catch { /* ignore quota errors */ }
}

export function useMeals() {
  const [meals,   setMeals]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMeals(loadLocal())
    setLoading(false)
  }, [])

  const addMeal = useCallback((nutrition) => {
    const meal = {
      ...nutrition,
      id:         crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }
    setMeals(prev => {
      const next = [...prev, meal]
      saveLocal(next)
      return next
    })
    return meal
  }, [])

  const removeMeal = useCallback((id) => {
    setMeals(prev => {
      const next = prev.filter(m => m.id !== id)
      saveLocal(next)
      return next
    })
  }, [])

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein:  acc.protein  + (m.protein  || 0),
      carbs:    acc.carbs    + (m.carbs    || 0),
      fat:      acc.fat      + (m.fat      || 0),
      fiber:    acc.fiber    + (m.fiber    || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  )

  return { meals, totals, loading, addMeal, removeMeal }
}
