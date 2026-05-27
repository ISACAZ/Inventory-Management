import { useState } from 'react'
import { X, Sparkles, AlertTriangle } from 'lucide-react'
import { recommendations } from '../data/mockData'
import RecommendationCard from '../components/RecommendationCard'

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="label mt-0.5">{subtitle}</p>}
    </div>
  )
}

export default function Recommendations() {
  const [bannerDismissed, setBannerDismissed] = useState(false)

  return (
    <div className="space-y-8">
      {/* ── Smart Info Banner ── */}
      {!bannerDismissed && (
        <div className="flex items-start gap-4 bg-lab-mauve/10 border border-lab-mauve/25 rounded-xl px-5 py-4">
          <div className="w-9 h-9 rounded-lg bg-lab-mauve/20 flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-lab-mauve" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-lab-mauve">How recommendations work</p>
            <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
              The Smart Lab Inventory engine analyses your borrow history, your department's usage patterns,
              item co-borrowing trends, and seasonal demand to surface the most relevant items for you.
              Recommendations refresh daily and adapt as usage patterns change.
            </p>
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss banner"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── For You ── */}
      <section>
        <SectionHeader
          title="🎯 Recommended for You"
          subtitle="Based on your recent activity in Computer Science"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.forYou.map(r => (
            <RecommendationCard key={r.itemId} recommendation={r} type="forYou" />
          ))}
        </div>
      </section>

      {/* ── Trending ── */}
      <section>
        <SectionHeader
          title="🔥 Trending This Week"
          subtitle="Most borrowed items across all departments this week"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.trending.map(r => (
            <RecommendationCard key={r.itemId} recommendation={r} type="trending" />
          ))}
        </div>
      </section>

      {/* ── Seasonal ── */}
      <section>
        <SectionHeader
          title="📅 Exam Season Essentials"
          subtitle="Items historically high in demand during this period"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.seasonal.map(r => (
            <RecommendationCard key={r.itemId} recommendation={r} type="seasonal" />
          ))}
        </div>
      </section>

      {/* ── Low Stock Warnings (Admin) ── */}
      <section>
        <div className="border border-lab-amber/30 bg-lab-amber/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={17} className="text-lab-amber" />
            <h2 className="section-title text-lab-amber">⚠️ Low Stock Warnings</h2>
            <span className="ml-2 text-xs font-medium bg-lab-amber/20 text-lab-amber px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>
          <p className="label mb-4">Items below reorder level — consider restocking</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.lowStock.map(r => (
              <RecommendationCard key={r.itemId} recommendation={r} type="lowStock" />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
