import { useState } from 'react'
import { Pencil, Save, Shield, Download, RefreshCw } from 'lucide-react'
import { currentUser } from '../data/mockData'

// ── Toggle Switch Component ──────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none
        ${checked ? 'bg-lab-mauve' : 'bg-gray-200'}`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 mt-0.5
          ${checked ? 'translate-x-4' : 'translate-x-0.5'}`}
      />
    </button>
  )
}

// ── Toggle Row ───────────────────────────────────────────────
function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

// ── Section Card ─────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="card space-y-1">
      <h2 className="section-title mb-4">{title}</h2>
      {children}
    </div>
  )
}

const PALETTE = [
  { name: 'Cream',  hex: '#F0EFEB' },
  { name: 'Mauve',  hex: '#B294A0' },
  { name: 'Slate',  hex: '#C2CCD6' },
  { name: 'Sage',   hex: '#7C8D7D' },
  { name: 'Amber',  hex: '#D9966E' },
]

export default function Settings() {
  // ── Profile state ────────────────────────────────────────
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileName, setProfileName] = useState(currentUser.name)
  const [profileEmail, setProfileEmail] = useState(currentUser.email)

  // ── Notifications state ─────────────────────────────────
  const [notifs, setNotifs] = useState({
    newBorrows:         true,
    lowStock:           true,
    overdueReminders:   true,
    approvalUpdates:    false,
    weeklySummary:      true,
  })

  const setNotif = (key) => (val) => setNotifs(prev => ({ ...prev, [key]: val }))

  // ── Appearance state ─────────────────────────────────────
  const [compactMode, setCompactMode] = useState(false)

  // ── Gamification state ───────────────────────────────────
  const [onLeaderboard, setOnLeaderboard] = useState(true)

  return (
    <div className="max-w-2xl space-y-6">

      {/* ══ Section 1: Profile ══ */}
      <Section title="👤 Profile">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-lab-mauve flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {currentUser.avatar}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3">
            {editingProfile ? (
              <>
                <div>
                  <label className="label block mb-1">Full Name</label>
                  <input
                    className="input-field"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label block mb-1">Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={profileEmail}
                    onChange={e => setProfileEmail(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setEditingProfile(false)}
                  className="btn-sage flex items-center gap-2 text-sm"
                >
                  <Save size={14} /> Save Changes
                </button>
              </>
            ) : (
              <>
                <div>
                  <p className="text-lg font-semibold text-gray-800">{profileName}</p>
                  <p className="text-sm text-gray-500">{profileEmail}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500">{currentUser.department}</span>
                  <span className="text-gray-300">·</span>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={() => setEditingProfile(true)}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <Pencil size={14} /> Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
      </Section>

      {/* ══ Section 2: Notifications ══ */}
      <Section title="🔔 Notifications">
        <ToggleRow
          label="Email notifications for new borrows"
          description="Receive an email whenever a new borrow request is submitted"
          checked={notifs.newBorrows}
          onChange={setNotif('newBorrows')}
        />
        <ToggleRow
          label="Low stock alerts"
          description="Get notified when any item drops below its reorder level"
          checked={notifs.lowStock}
          onChange={setNotif('lowStock')}
        />
        <ToggleRow
          label="Overdue item reminders"
          description="Daily reminder emails for items past their expected return date"
          checked={notifs.overdueReminders}
          onChange={setNotif('overdueReminders')}
        />
        <ToggleRow
          label="New borrow request approvals"
          description="Be notified when your borrow request is approved or rejected"
          checked={notifs.approvalUpdates}
          onChange={setNotif('approvalUpdates')}
        />
        <ToggleRow
          label="Weekly activity summary"
          description="A summary of your lab activity sent every Monday morning"
          checked={notifs.weeklySummary}
          onChange={setNotif('weeklySummary')}
        />
      </Section>

      {/* ══ Section 3: Appearance ══ */}
      <Section title="🎨 Appearance">
        {/* Font */}
        <div className="flex items-center justify-between py-3 border-b border-gray-50">
          <div>
            <p className="text-sm font-medium text-gray-800">Font</p>
            <p className="text-xs text-gray-400">Used throughout the interface</p>
          </div>
          <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">Roboto</span>
        </div>

        {/* Compact Mode */}
        <ToggleRow
          label="Compact mode"
          description="Reduce spacing and padding for denser information display"
          checked={compactMode}
          onChange={setCompactMode}
        />

        {/* Color Palette */}
        <div className="py-3">
          <p className="text-sm font-medium text-gray-800 mb-2">Color Palette</p>
          <div className="flex items-center gap-3 flex-wrap">
            {PALETTE.map(c => (
              <div key={c.name} className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-lg border border-gray-200 shadow-sm"
                  style={{ backgroundColor: c.hex }}
                  title={c.hex}
                />
                <span className="text-[10px] text-gray-400">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══ Section 4: Gamification ══ */}
      <Section title="🏆 Gamification">
        {/* Current stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-lab-amber/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-lab-amber">{currentUser.points.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">🏆 Points</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-yellow-700">#{currentUser.rank}</p>
            <p className="text-xs text-gray-500 mt-0.5">🎖️ Rank</p>
          </div>
          <div className="bg-lab-mauve/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-lab-mauve">{currentUser.badges?.length ?? 0}/8</p>
            <p className="text-xs text-gray-500 mt-0.5">🎀 Badges</p>
          </div>
        </div>

        {/* Leaderboard opt-in */}
        <ToggleRow
          label="Appear on leaderboard"
          description="Allow your name and stats to be visible to other users on the leaderboard"
          checked={onLeaderboard}
          onChange={setOnLeaderboard}
        />

        {/* Progress to next badge */}
        <div className="pt-3 space-y-3">
          <p className="text-sm font-medium text-gray-800">Progress to Next Badges</p>

          {/* QR Master */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600 flex items-center gap-1">📲 QR Master</span>
              <span className="text-xs font-medium text-lab-mauve">87 / 100 scans</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-lab-mauve" style={{ width: '87%' }} />
            </div>
          </div>

          {/* Fast Returner */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600 flex items-center gap-1">⚡ Fast Returner</span>
              <span className="text-xs font-medium text-lab-sage">20 / 20 ✅</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-lab-sage" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </Section>

      {/* ══ Section 5: System (Admin) ══ */}
      <Section title="">
        <div className="flex items-center gap-3 mb-4 -mt-1">
          <div className="w-8 h-8 rounded-lg bg-lab-mauve/10 flex items-center justify-center flex-shrink-0">
            <Shield size={16} className="text-lab-mauve" />
          </div>
          <div>
            <h2 className="section-title leading-tight">System Settings</h2>
            <p className="text-xs text-gray-400">Admin Only</p>
          </div>
        </div>

        {/* API Base URL */}
        <div className="mb-4">
          <label className="label block mb-1">API Base URL</label>
          <input
            className="input-field font-mono text-xs text-gray-500 bg-gray-50"
            readOnly
            value="https://api.smartlab.uni.edu/v1"
            placeholder="https://api.smartlab.uni.edu/v1"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => alert('Exporting all data as CSV…')}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Download size={14} /> Export All Data (CSV)
          </button>
          <button
            onClick={() => alert('Cache cleared!')}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <RefreshCw size={14} /> Clear Cache
          </button>
        </div>

        {/* Version */}
        <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
          v0.1.0 — Smart Lab Inventory
        </p>
      </Section>
    </div>
  )
}
