/**
 * ContributionHeatmap
 * GitHub-style 52-week × 7-day activity grid.
 *
 * Props:
 *   data — array of { date: 'YYYY-MM-DD', count: number, activities: string[] }
 */

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function cellColor(count) {
  if (count === 0) return 'bg-gray-100'
  if (count === 1) return 'bg-lab-sage/25'
  if (count <= 3) return 'bg-lab-sage/55'
  return 'bg-lab-sage'
}

/** Build a 52×7 grid from the data array keyed by date string. */
function buildGrid(data) {
  const byDate = {}
  for (const entry of data) {
    byDate[entry.date] = entry
  }

  // Find the Sunday that starts the 52-week window ending today
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun
  const endSunday = new Date(today)
  endSunday.setDate(today.getDate() - dayOfWeek + 6) // last Saturday of current week
  const startSunday = new Date(endSunday)
  startSunday.setDate(endSunday.getDate() - 52 * 7 + 1)

  // Align to the nearest preceding Sunday
  const startDay = new Date(startSunday)
  startDay.setDate(startDay.getDate() - startDay.getDay())

  const weeks = [] // weeks[col][row] = { date, count, activities }
  const monthPositions = [] // { month, col }

  let cursor = new Date(startDay)
  for (let col = 0; col < 52; col++) {
    const week = []
    for (let row = 0; row < 7; row++) {
      const dateStr = cursor.toISOString().split('T')[0]
      // Track month label position (first day of month that appears in this col)
      if (row === 0 && cursor.getDate() <= 7) {
        const month = cursor.getMonth()
        if (monthPositions.length === 0 || monthPositions[monthPositions.length - 1].month !== month) {
          monthPositions.push({ month, col })
        }
      }
      const entry = byDate[dateStr]
      week.push({
        date: dateStr,
        count: entry ? entry.count : 0,
        activities: entry ? entry.activities : [],
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }

  return { weeks, monthPositions }
}

export default function ContributionHeatmap({ data = [] }) {
  const { weeks, monthPositions } = buildGrid(data)

  // Day labels for left column – show Mon(1), Wed(3), Fri(5)
  const showDayLabel = [false, true, false, true, false, true, false]

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-max">
        {/* Month labels row */}
        <div className="flex mb-1 ml-8">
          {weeks.map((_, col) => {
            const mp = monthPositions.find((m) => m.col === col)
            return (
              <div key={col} className="w-3.5 flex-shrink-0 text-[10px] text-gray-400 leading-none">
                {mp ? MONTH_LABELS[mp.month] : ''}
              </div>
            )
          })}
        </div>

        {/* Grid with day labels */}
        <div className="flex gap-1">
          {/* Day labels column */}
          <div className="flex flex-col gap-0.5 mr-1">
            {DAYS.map((day, row) => (
              <div
                key={day}
                className="w-6 h-3 flex items-center text-[10px] text-gray-400 leading-none"
              >
                {showDayLabel[row] ? day.slice(0, 3) : ''}
              </div>
            ))}
          </div>

          {/* Heatmap columns */}
          {weeks.map((week, col) => (
            <div key={col} className="flex flex-col gap-0.5">
              {week.map((cell, row) => (
                <div
                  key={row}
                  className={`w-3 h-3 rounded-sm ${cellColor(cell.count)} cursor-default`}
                  title={`${cell.date}: ${cell.count} ${cell.count === 1 ? 'activity' : 'activities'}${
                    cell.activities.length > 0 ? '\n' + cell.activities.join(', ') : ''
                  }`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1.5 mt-2">
          <span className="text-[10px] text-gray-400">Less</span>
          {['bg-gray-100', 'bg-lab-sage/25', 'bg-lab-sage/55', 'bg-lab-sage'].map((cls) => (
            <div key={cls} className={`w-3 h-3 rounded-sm ${cls}`} />
          ))}
          <span className="text-[10px] text-gray-400">More</span>
        </div>
      </div>
    </div>
  )
}
