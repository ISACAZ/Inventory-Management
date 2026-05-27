import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, ChevronRight, ChevronLeft,
  CheckCircle, Camera, AlertCircle,
} from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import { items, transactions } from '../data/mockData'

/* ── Step indicator sub-component ── */
function StepIndicator({ step }) {
  const steps = ['Search Item', 'Fill Details', 'Confirm']
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((label, idx) => {
        const num       = idx + 1
        const isComplete = step > num
        const isCurrent  = step === num
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                isComplete ? 'bg-lab-sage text-white'
                : isCurrent ? 'bg-lab-mauve text-white'
                : 'bg-lab-slate/30 text-gray-400'
              }`}>
                {isComplete ? '✓' : num}
              </div>
              <span className={`text-xs mt-1.5 whitespace-nowrap ${
                isCurrent ? 'text-lab-mauve font-medium' : 'text-gray-400'
              }`}>
                {label}
              </span>
            </div>
            {idx < 2 && (
              <div className={`w-14 h-0.5 mx-2 mb-5 ${
                step > num ? 'bg-lab-sage' : 'bg-lab-slate/30'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function BorrowReturn() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('borrow')

  /* ── Borrow state ── */
  const [step,         setStep]         = useState(1)
  const [searchQuery,  setSearchQuery]  = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [quantity,     setQuantity]     = useState(1)
  const [purpose,      setPurpose]      = useState('')
  const [course,       setCourse]       = useState('')
  const [returnDate,   setReturnDate]   = useState('')
  const [studentId,    setStudentId]    = useState('2024CS0001')
  const [borrowSuccess,setBorrowSuccess]= useState(false)

  /* ── Return state ── */
  const [selectedTx,      setSelectedTx]      = useState(null)
  const [returnCondition, setReturnCondition] = useState('Good')
  const [returnQty,       setReturnQty]       = useState(1)
  const [returnNotes,     setReturnNotes]     = useState('')
  const [returnSuccess,   setReturnSuccess]   = useState(false)

  const filteredItems = items
    .filter(i =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      i.quantity.available > 0
    )
    .slice(0, 5)

  const activeBorrows = transactions.filter(
    t => t.action === 'Borrowed' && !t.actualReturn
  )

  const resetBorrow = () => {
    setStep(1)
    setSelectedItem(null)
    setSearchQuery('')
    setQuantity(1)
    setPurpose('')
    setCourse('')
    setReturnDate('')
    setBorrowSuccess(false)
  }

  const switchTab = (tab) => {
    setActiveTab(tab)
    resetBorrow()
    setReturnSuccess(false)
    setSelectedTx(null)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Page title */}
      <h1 className="text-2xl font-bold text-gray-800">Borrow &amp; Return</h1>

      {/* ── Tabs ── */}
      <div className="flex border-b border-lab-slate/30">
        {[
          { key: 'borrow', label: '⬇ Borrow' },
          { key: 'return', label: '↩ Return' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => switchTab(key)}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === key
                ? 'border-lab-mauve text-lab-mauve'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════
           BORROW TAB
          ═══════════════════════════════════ */}
      {activeTab === 'borrow' && (
        <div className="card">
          <StepIndicator step={step} />

          {/* ── Step 1: Search & Select ── */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="section-title">Search &amp; Select Item</h2>

              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Type to search items..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="input-field pl-9"
                />
              </div>

              <div className="space-y-2">
                {filteredItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      selectedItem?.id === item.id
                        ? 'border-lab-mauve bg-lab-mauve/5'
                        : 'border-lab-slate/20 hover:border-lab-mauve/40 hover:bg-lab-cream/40'
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0">{item.image}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-400">
                        {item.category} · {item.quantity.available} available
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                    {selectedItem?.id === item.id && (
                      <CheckCircle size={18} className="text-lab-mauve flex-shrink-0" />
                    )}
                  </button>
                ))}
                {filteredItems.length === 0 && searchQuery && (
                  <p className="text-sm text-gray-400 text-center py-4">No matching items found</p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedItem}
                  className={`btn-primary flex items-center gap-2 ${
                    !selectedItem ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Borrow Details ── */}
          {step === 2 && selectedItem && (
            <div className="space-y-4">
              <h2 className="section-title">Borrow Details</h2>

              {/* Selected item preview */}
              <div className="flex items-center gap-3 bg-lab-cream/60 rounded-xl p-3">
                <span className="text-3xl">{selectedItem.image}</span>
                <div>
                  <p className="font-semibold text-gray-800">{selectedItem.name}</p>
                  <p className="text-sm text-lab-sage font-medium">
                    {selectedItem.quantity.available} available
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label block mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    max={selectedItem.quantity.available}
                    value={quantity}
                    onChange={e =>
                      setQuantity(Math.min(
                        Math.max(1, Number(e.target.value)),
                        selectedItem.quantity.available
                      ))
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label block mb-1">Student ID</label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={e => setStudentId(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="label block mb-1">Purpose <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Lecture, Lab Session, Project"
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label block mb-1">Course / Lab / Project</label>
                <input
                  type="text"
                  placeholder="e.g. CS301 - Digital Systems"
                  value={course}
                  onChange={e => setCourse(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label block mb-1">
                  Expected Return Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={e => setReturnDate(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!purpose || !returnDate}
                  className={`btn-primary flex items-center gap-2 ${
                    !purpose || !returnDate ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Confirm ── */}
          {step === 3 && selectedItem && !borrowSuccess && (
            <div className="space-y-4">
              <h2 className="section-title">Confirm Borrow</h2>

              <div className="bg-lab-cream/50 rounded-xl overflow-hidden border border-lab-slate/20">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-lab-slate/10">
                    {[
                      { label: 'Item',            value: `${selectedItem.image} ${selectedItem.name}` },
                      { label: 'Item ID',          value: selectedItem.id },
                      { label: 'Quantity',         value: quantity },
                      { label: 'Student ID',       value: studentId },
                      { label: 'Purpose',          value: purpose },
                      { label: 'Course / Project', value: course || '—' },
                      { label: 'Expected Return',  value: returnDate },
                      { label: 'Pick-up Location', value: `${selectedItem.location.building} · ${selectedItem.location.room}` },
                    ].map(({ label, value }) => (
                      <tr key={label}>
                        <td className="px-4 py-2.5 text-gray-500 font-medium text-sm w-40">{label}</td>
                        <td className="px-4 py-2.5 text-gray-800 text-sm">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={() => setBorrowSuccess(true)}
                  className="btn-primary"
                >
                  Confirm Borrow
                </button>
              </div>
            </div>
          )}

          {/* ── Borrow Success ── */}
          {borrowSuccess && selectedItem && (
            <div className="text-center py-6 space-y-5">
              <div className="w-20 h-20 bg-lab-sage/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={42} className="text-lab-sage" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Borrow Request Submitted!</h3>
                <p className="text-lab-sage font-semibold mt-1">+5 pts for using QR scan 🎉</p>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedItem.image}{' '}
                  <strong>{selectedItem.name}</strong> × {quantity}
                  &nbsp;— due <strong>{returnDate}</strong>
                </p>
              </div>
              <div className="bg-lab-sage/10 border border-lab-sage/20 rounded-xl p-4 text-sm text-lab-sage text-left">
                ✅ Your request has been logged. Please collect the item from{' '}
                <strong>{selectedItem.location.building}</strong>,{' '}
                <strong>{selectedItem.location.room}</strong>.
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={resetBorrow} className="btn-secondary">
                  Borrow Another
                </button>
                <button onClick={() => navigate('/inventory')} className="btn-primary">
                  View Inventory
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════
           RETURN TAB
          ═══════════════════════════════════ */}
      {activeTab === 'return' && (
        <div className="space-y-4">

          {/* Active borrows list */}
          <div className="card">
            <h2 className="section-title mb-4">Your Active Borrows</h2>
            {activeBorrows.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No active borrows — nothing to return!
              </p>
            ) : (
              <div className="space-y-2">
                {activeBorrows.map(tx => {
                  const isOverdue = tx.expectedReturn && new Date(tx.expectedReturn) < new Date('2026-05-27')
                  const isSelected = selectedTx?.id === tx.id
                  return (
                    <button
                      key={tx.id}
                      onClick={() => {
                        setSelectedTx(isSelected ? null : tx)
                        setReturnQty(tx.quantity)
                        setReturnSuccess(false)
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-lab-sage bg-lab-sage/5'
                          : 'border-lab-slate/20 hover:border-lab-sage/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="accent-lab-sage flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{tx.itemName}</p>
                        <p className="text-xs text-gray-400">
                          Borrowed: {tx.date} · Due: {tx.expectedReturn}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-400">×{tx.quantity}</span>
                        {isOverdue && (
                          <span className="flex items-center gap-1 text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                            <AlertCircle size={11} /> Overdue
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Return form */}
          {selectedTx && !returnSuccess && (
            <div className="card space-y-4">
              <h2 className="section-title">
                Return: <span className="text-lab-mauve">{selectedTx.itemName}</span>
              </h2>

              {/* Condition picker */}
              <div>
                <label className="label block mb-2">Condition</label>
                <div className="flex flex-wrap gap-2">
                  {['Good', 'Used', 'Damaged', 'Missing Part', 'Needs Inspection'].map(cond => (
                    <button
                      key={cond}
                      onClick={() => setReturnCondition(cond)}
                      className={`px-3 py-1.5 rounded-lg text-sm border-2 transition-all ${
                        returnCondition === cond
                          ? 'border-lab-mauve bg-lab-mauve/10 text-lab-mauve font-medium'
                          : 'border-lab-slate/30 text-gray-600 hover:border-lab-mauve/40'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Returned quantity */}
              <div>
                <label className="label block mb-1">Returned Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={selectedTx.quantity}
                  value={returnQty}
                  onChange={e => setReturnQty(Math.min(Number(e.target.value), selectedTx.quantity))}
                  className="input-field"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="label block mb-1">Notes</label>
                <textarea
                  rows={3}
                  placeholder="Any notes about the condition of the returned item..."
                  value={returnNotes}
                  onChange={e => setReturnNotes(e.target.value)}
                  className="input-field resize-none"
                />
              </div>

              {/* Photo upload (mock) */}
              <div>
                <button className="btn-secondary flex items-center gap-2 text-sm">
                  <Camera size={15} />
                  Upload Photo (optional)
                </button>
                <p className="text-xs text-gray-400 mt-1">
                  Photo evidence helps resolve any condition disputes
                </p>
              </div>

              <button
                onClick={() => setReturnSuccess(true)}
                className="btn-sage w-full"
              >
                Submit Return
              </button>
            </div>
          )}

          {/* Return success */}
          {returnSuccess && selectedTx && (
            <div className="card text-center py-8 space-y-5">
              <div className="text-5xl">🎉</div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Return Submitted!</h3>
                <p className="text-lab-amber font-semibold mt-1 text-lg">+35 pts earned! 🎉</p>
                <p className="text-sm text-gray-500 mt-2">
                  <strong>{selectedTx.itemName}</strong> returned in{' '}
                  <strong>{returnCondition}</strong> condition
                </p>
              </div>
              <div className="bg-lab-sage/10 border border-lab-sage/20 rounded-xl p-4 text-sm text-lab-sage">
                ✅ Thank you for returning on time! Your points have been added to your account.
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => { setSelectedTx(null); setReturnSuccess(false) }}
                  className="btn-secondary"
                >
                  Return Another
                </button>
                <button
                  onClick={() => navigate('/inventory')}
                  className="btn-primary"
                >
                  View Inventory
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
