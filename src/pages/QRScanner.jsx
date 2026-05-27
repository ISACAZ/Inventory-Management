import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, Package, MapPin, RefreshCw, Zap } from 'lucide-react'

/* ── Static mock data for scan results ── */
const MOCK_ITEM = {
  id: 'item-001',
  name: 'Whiteboard Marker (Blue)',
  image: '✏️',
  status: 'Available',
  available: 42,
  location: 'Room 101 / Cabinet 1 / Drawer A',
  qrCode: 'QR-ITEM-001',
}

const MOCK_LOCATION = {
  id: 'loc-001',
  path: 'Building A / Floor 1 / Room 101 / Cabinet 1 / Drawer A',
  qrCode: 'QR-LOC-001',
  items: [
    { name: 'Whiteboard Marker (Blue)',  image: '✏️',  qty: 42 },
    { name: 'Whiteboard Eraser',         image: '🟫',  qty: 22 },
    { name: 'Permanent Marker (Black)',  image: '🖊️', qty: 14 },
  ],
}

const RECENT_SCANS = [
  { label: 'Whiteboard Marker (Blue)', type: 'item',     time: '2 mins ago',  qrCode: 'QR-ITEM-001' },
  { label: 'Building A / Room 101',    type: 'location',  time: '15 mins ago', qrCode: 'QR-LOC-001'  },
  { label: 'Arduino Uno R3',           type: 'item',     time: '1 hour ago',  qrCode: 'QR-ITEM-007' },
]

export default function QRScanner() {
  const navigate = useNavigate()
  const [scanResult, setScanResult] = useState(null) // null | 'item' | 'location'

  return (
    <div className="max-w-xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">QR Scanner</h1>
        <p className="text-sm text-gray-500 mt-1">Scan item or location QR codes to take action instantly</p>
      </div>

      {/* Scanner viewfinder */}
      <div className="card text-center space-y-5">
        <div className="relative bg-gray-900 rounded-2xl w-64 h-64 mx-auto flex items-center justify-center overflow-hidden">

          {/* Corner brackets – top-left */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-lab-sage" />
          {/* top-right */}
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-lab-sage" />
          {/* bottom-left */}
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-lab-sage" />
          {/* bottom-right */}
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-lab-sage" />

          {/* Animated scan line */}
          <div
            className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-lab-sage to-transparent opacity-80"
            style={{
              animation: 'scanline 2s ease-in-out infinite',
              top: '50%',
            }}
          />

          {/* Center icon + label */}
          <div className="text-center z-10 pointer-events-none">
            <QrCode size={36} className="mx-auto text-white/30 mb-2" />
            <p className="text-white text-xs opacity-50 px-8 leading-relaxed">
              Align QR code within frame
            </p>
          </div>
        </div>

        {/* Pulsing status dot */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lab-sage opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-lab-sage" />
          </span>
          Camera ready — waiting for QR code
        </div>

        {/* Demo trigger buttons */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setScanResult('item')}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Zap size={14} />
            Simulate Item QR
          </button>
          <button
            onClick={() => setScanResult('location')}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <MapPin size={14} />
            Simulate Location QR
          </button>
        </div>
      </div>

      {/* ── Result: Item ── */}
      {scanResult === 'item' && (
        <div className="card overflow-hidden">
          {/* Green header */}
          <div className="bg-lab-sage/10 border-b border-lab-sage/20 -mx-6 -mt-6 px-6 py-3 mb-5">
            <p className="text-lab-sage font-semibold">✅ Item Found</p>
          </div>

          {/* Item info */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 bg-lab-cream rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">
              {MOCK_ITEM.image}
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-gray-800">{MOCK_ITEM.name}</p>
              <p className="text-xs text-gray-500">ID: <span className="font-mono">{MOCK_ITEM.id}</span></p>
              <p className="text-xs text-gray-500">
                Available: <span className="text-lab-sage font-medium">{MOCK_ITEM.available}</span>
              </p>
              <p className="text-xs text-gray-500">Location: {MOCK_ITEM.location}</p>
            </div>
          </div>

          {/* Action grid */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => navigate('/borrow-return')}
              className="btn-primary text-sm"
            >
              Borrow Item
            </button>
            <button
              onClick={() => navigate('/borrow-return')}
              className="btn-sage text-sm"
            >
              Return Item
            </button>
            <button
              onClick={() => navigate('/inventory/' + MOCK_ITEM.id)}
              className="btn-secondary text-sm"
            >
              View Details →
            </button>
            <button className="btn-amber text-sm">
              Report Problem
            </button>
          </div>

          {/* Scan another */}
          <button
            onClick={() => setScanResult(null)}
            className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw size={13} /> Scan Another
          </button>
        </div>
      )}

      {/* ── Result: Location ── */}
      {scanResult === 'location' && (
        <div className="card overflow-hidden">
          {/* Blue header */}
          <div className="bg-blue-50 border-b border-blue-100 -mx-6 -mt-6 px-6 py-3 mb-5">
            <p className="text-blue-600 font-semibold">📍 Location Found</p>
          </div>

          {/* Path */}
          <div className="flex items-start gap-2 mb-5">
            <MapPin size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium text-gray-700">{MOCK_LOCATION.path}</p>
          </div>

          {/* Items stored here */}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Items stored here
          </p>
          <div className="space-y-2">
            {MOCK_LOCATION.items.map(it => (
              <div
                key={it.name}
                className="flex items-center gap-3 bg-lab-cream/50 rounded-xl px-3 py-2.5"
              >
                <span className="text-xl">{it.image}</span>
                <span className="flex-1 text-sm text-gray-700">{it.name}</span>
                <span className="text-xs font-medium text-lab-sage">
                  {it.qty} avail.
                </span>
              </div>
            ))}
          </div>

          {/* Scan another */}
          <button
            onClick={() => setScanResult(null)}
            className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw size={13} /> Scan Another
          </button>
        </div>
      )}

      {/* ── Recent Scans ── */}
      <div className="card">
        <h2 className="section-title mb-4">Recent Scans</h2>
        <div className="space-y-1.5">
          {RECENT_SCANS.map((scan, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-lab-cream/50 transition-colors cursor-default"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                scan.type === 'item' ? 'bg-lab-mauve/10' : 'bg-blue-50'
              }`}>
                {scan.type === 'item'
                  ? <Package size={14} className="text-lab-mauve" />
                  : <MapPin size={14} className="text-blue-500" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{scan.label}</p>
                <p className="text-xs text-gray-400 font-mono">{scan.qrCode}</p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{scan.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Keyframe for scan line animation */}
      <style>{`
        @keyframes scanline {
          0%   { transform: translateY(-60px); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(60px); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
