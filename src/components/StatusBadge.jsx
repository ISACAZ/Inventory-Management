const statusStyles = {
  Available:         'bg-lab-sage/15 text-lab-sage',
  'Low Stock':       'bg-lab-amber/15 text-lab-amber',
  'Out of Stock':    'bg-red-100 text-red-600',
  Borrowed:          'bg-blue-100 text-blue-600',
  Returned:          'bg-lab-sage/15 text-lab-sage',
  Good:              'bg-lab-sage/15 text-lab-sage',
  Used:              'bg-yellow-100 text-yellow-700',
  Damaged:           'bg-red-100 text-red-600',
  'Needs Inspection':'bg-orange-100 text-orange-600',
  Pending:           'bg-lab-slate/30 text-gray-600',
  Restocked:         'bg-emerald-100 text-emerald-700',
}

export default function StatusBadge({ status }) {
  const classes = statusStyles[status] ?? 'bg-gray-100 text-gray-600'

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      {status}
    </span>
  )
}
