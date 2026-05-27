import { useState } from 'react'
import { Trophy, Lock } from 'lucide-react'
import { leaderboard, currentUser, heatmapData, badgeDefinitions } from '../data/mockData'
import LeaderboardTable from '../components/LeaderboardTable'
import ContributionHeatmap from '../components/ContributionHeatmap'

const PERIODS = [
  { key: 'weekly',   label: 'This Week' },
  { key: 'monthly',  label: 'This Month' },
  { key: 'semester', label: 'This Semester' },
]

const podiumColors = {
  1: { bg: 'bg-yellow-50',  border: 'border-yellow-200', text: 'text-yellow-700', medal: '🥇' },
  2: { bg: 'bg-gray-100',   border: 'border-gray-200',   text: 'text-gray-600',   medal: '🥈' },
  3: { bg: 'bg-orange-50',  border: 'border-orange-200', text: 'text-orange-600', medal: '🥉' },
}

const rarityBg = {
  Common: 'bg-gray-100',
  Rare:   'bg-lab-mauve/15',
  Epic:   'bg-purple-100',
}
const rarityText = {
  Common: 'text-gray-600',
  Rare:   'text-lab-mauve',
  Epic:   'text-purple-700',
}

function PodiumCard({ entry, rank }) {
  const colors = podiumColors[rank]
  const isCenter = rank === 1
  return (
    <div
      className={`flex flex-col items-center gap-2 px-4 pb-4 ${isCenter ? 'pt-2' : 'pt-4'} rounded-xl border ${colors.bg} ${colors.border}
        ${isCenter ? 'shadow-md scale-105 z-10' : ''}
      `}
    >
      <span className="text-2xl">{colors.medal}</span>
      <div
        className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
        style={{
          backgroundColor: entry.avatarColor ?? '#B294A0',
          width: isCenter ? 56 : 44,
          height: isCenter ? 56 : 44,
          fontSize: isCenter ? 20 : 16,
        }}
      >
        {entry.avatar}
      </div>
      <div className="text-center">
        <p className={`font-semibold leading-tight ${isCenter ? 'text-base' : 'text-sm'} text-gray-800`}>
          {entry.userName}
        </p>
        <p className="text-xs text-gray-500">{entry.department}</p>
        <div className={`flex items-center justify-center gap-1 mt-1 font-bold ${colors.text}`}>
          <Trophy size={isCenter ? 15 : 13} />
          <span className={isCenter ? 'text-base' : 'text-sm'}>{entry.points.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

export default function Leaderboard() {
  const [activePeriod, setActivePeriod] = useState('weekly')
  const data = leaderboard[activePeriod] ?? []

  const top3 = [data[1], data[0], data[2]].filter(Boolean) // order: 2nd, 1st, 3rd for podium
  const ranks = [2, 1, 3]

  // Check if current user has a badge
  const ownedBadgeIds = new Set((currentUser.badges ?? []).map(b => b.id))
  const ownedBadgeMap = {}
  ;(currentUser.badges ?? []).forEach(b => { ownedBadgeMap[b.id] = b })

  return (
    <div className="space-y-6">
      {/* ── Period Tabs ── */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => setActivePeriod(p.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activePeriod === p.key
                ? 'bg-white text-lab-mauve shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Top 3 Podium ── */}
      {top3.length >= 2 && (
        <div className="card">
          <h3 className="section-title mb-5">🏆 Top Performers</h3>
          <div className="flex items-end justify-center gap-4">
            {top3.map((entry, i) => (
              entry ? <PodiumCard key={entry.userId} entry={entry} rank={ranks[i]} /> : null
            ))}
          </div>
        </div>
      )}

      {/* ── Your Stats ── */}
      <div className="card">
        <h3 className="section-title mb-4">📊 Your Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Points',      value: currentUser.points.toLocaleString(), icon: '🏆', color: 'bg-lab-amber/10 text-lab-amber' },
            { label: 'Rank',        value: `#${currentUser.rank}`,              icon: '🎖️', color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Badges',      value: currentUser.badges?.length ?? 0,     icon: '🎀', color: 'bg-lab-mauve/10 text-lab-mauve' },
            { label: 'Return Rate', value: '94%',                               icon: '⚡', color: 'bg-lab-sage/10 text-lab-sage' },
          ].map(stat => (
            <div key={stat.label} className={`rounded-xl p-4 ${stat.color} flex items-center gap-3`}>
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-xl font-bold leading-tight">{stat.value}</p>
                <p className="text-xs font-medium opacity-80">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Full Leaderboard ── */}
      <div className="card">
        <h3 className="section-title mb-4">Full Rankings</h3>
        <LeaderboardTable data={data} />
      </div>

      {/* ── Activity Heatmap ── */}
      <div className="card">
        <h3 className="section-title mb-4">📅 Your Activity – Last 12 Months</h3>
        <ContributionHeatmap data={heatmapData} />
      </div>

      {/* ── Badge Gallery ── */}
      <div className="card">
        <h3 className="section-title mb-1">🏆 Achievement Badges</h3>
        <p className="label mb-5">
          {ownedBadgeIds.size} / {badgeDefinitions.length} badges earned
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {badgeDefinitions.map(def => {
            const owned = ownedBadgeIds.has(def.id)
            const ownedBadge = ownedBadgeMap[def.id]
            const bg = rarityBg[def.rarity] ?? 'bg-gray-100'
            const textCls = rarityText[def.rarity] ?? 'text-gray-600'

            return (
              <div
                key={def.id}
                className={`relative rounded-xl border p-4 flex flex-col items-center gap-2 text-center transition-all
                  ${owned
                    ? `${bg} border-transparent shadow-sm`
                    : 'bg-gray-50 border-gray-100 opacity-50 grayscale'
                  }`}
              >
                {/* Lock overlay for locked badges */}
                {!owned && (
                  <div className="absolute top-2 right-2">
                    <Lock size={12} className="text-gray-400" />
                  </div>
                )}
                <span className={`text-3xl ${owned ? '' : 'grayscale'}`}>{def.icon}</span>
                <p className={`text-sm font-semibold leading-tight ${owned ? textCls : 'text-gray-500'}`}>
                  {def.name}
                </p>
                <p className="text-xs text-gray-500 leading-snug">{def.description}</p>
                {owned && ownedBadge?.earnedDate ? (
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${bg} ${textCls} border border-current/20`}>
                    Earned {ownedBadge.earnedDate}
                  </span>
                ) : !owned ? (
                  <span className="text-[10px] text-gray-400 italic">{def.condition}</span>
                ) : null}
                {/* Rarity label */}
                <span className={`text-[10px] font-semibold uppercase tracking-wide ${textCls} opacity-70`}>
                  {def.rarity}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
