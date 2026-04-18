// SVG donut chart — no external charting library needed.

const SEGMENTS = [
  { key: 'carbs',   color: '#fde047', label: 'Carbs'   }, // lemon-300
  { key: 'protein', color: '#38bdf8', label: 'Protein' }, // sky-400
  { key: 'fat',     color: '#f472b6', label: 'Fat'     }, // pink-400
]

const R   = 54   // outer radius
const r   = 34   // inner radius (donut hole)
const CX  = 70   // viewBox center x
const CY  = 70   // viewBox center y
const CIRC = 2 * Math.PI * R

function polarToXY(cx, cy, radius, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  }
}

function arcPath(cx, cy, outerR, innerR, startDeg, endDeg) {
  if (endDeg - startDeg >= 360) endDeg = startDeg + 359.99
  const o1 = polarToXY(cx, cy, outerR, startDeg)
  const o2 = polarToXY(cx, cy, outerR, endDeg)
  const i1 = polarToXY(cx, cy, innerR, endDeg)
  const i2 = polarToXY(cx, cy, innerR, startDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0

  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${i2.x} ${i2.y}`,
    'Z',
  ].join(' ')
}

export default function MacroPieChart({ totals }) {
  const { carbs = 0, protein = 0, fat = 0 } = totals
  // Calories per gram: carbs=4, protein=4, fat=9
  const carbCal    = carbs   * 4
  const proteinCal = protein * 4
  const fatCal     = fat     * 9
  const totalCal   = carbCal + proteinCal + fatCal || 1 // avoid /0

  const values = [carbCal, proteinCal, fatCal]
  const pcts   = values.map(v => v / totalCal)

  // Build arc segments
  let cursor = 0
  const arcs = pcts.map((pct, i) => {
    const startDeg = cursor * 360
    cursor += pct
    const endDeg   = cursor * 360
    return { ...SEGMENTS[i], pct, startDeg, endDeg }
  })

  const isEmpty = carbCal + proteinCal + fatCal === 0

  return (
    <div className="flex items-center gap-4">
      {/* Chart */}
      <div className="relative shrink-0">
        <svg width="140" height="140" viewBox="0 0 140 140">
          {isEmpty ? (
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke="#1e3a6e"
              strokeWidth={R - r}
            />
          ) : (
            arcs.map(arc => (
              <path
                key={arc.key}
                d={arcPath(CX, CY, R, r, arc.startDeg, arc.endDeg)}
                fill={arc.color}
                opacity={0.9}
              />
            ))
          )}
          {/* Center hole label */}
          <circle cx={CX} cy={CY} r={r} fill="#0f2044" />
          <text x={CX} y={CY - 4} textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">
            {Math.round(totals.calories ?? 0)}
          </text>
          <text x={CX} y={CY + 12} textAnchor="middle" fill="#94a3b8" fontSize="9">
            kcal
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 min-w-0">
        {SEGMENTS.map((seg, i) => (
          <div key={seg.key} className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
            <span className="text-navy-200 w-14">{seg.label}</span>
            <span className="font-semibold text-white">
              {Math.round(pcts[i] * 100)}%
            </span>
            <span className="text-navy-400 text-xs">
              {Math.round(values[i] / 4 || values[i] / 9)} g
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2 text-sm mt-1 border-t border-navy-700 pt-1">
          <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-emerald-400" />
          <span className="text-navy-200 w-14">Fiber</span>
          <span className="font-semibold text-white">{Math.round(totals.fiber ?? 0)} g</span>
        </div>
      </div>
    </div>
  )
}
