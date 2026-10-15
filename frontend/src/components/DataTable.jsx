import { ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react'

const rupiah = (v) =>
  v == null ? '-' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)

const TH = 'py-2.5 px-2.5 sm:py-3.5 sm:px-4 whitespace-nowrap'
const TD = 'py-2 px-2.5 sm:py-3 sm:px-4 whitespace-nowrap text-xs sm:text-sm'

// Tambah kolom baru = tambah 1 baris di sini (header + cara render).
const COLUMNS = [
  { label: 'PLU', th: 'text-left', td: 'font-mono font-bold text-indigo-600', render: (i) => i.plu },
  { label: 'Nama Barang', th: 'text-left', td: 'font-semibold text-slate-900', render: (i) => i.name },
  {
    label: 'Status',
    th: 'text-center',
    td: 'text-center',
    render: (i) => (
      <span
        className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 rounded-full text-[10px] sm:text-xs font-bold ${
          i.active
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}
      >
        {i.active ? 'Aktif' : 'Tidak Aktif'}
      </span>
    ),
  },
  { label: 'Supplier', th: 'text-center', td: 'text-slate-600 font-medium text-center', render: (i) => i.supplier },
  { label: 'Dept', th: 'text-center', td: 'text-slate-500 text-center font-medium', render: (i) => i.dept || '-' },
  {
    label: 'KUU Cabang',
    th: 'text-center',
    td: 'text-center font-mono font-bold',
    render: (i) => (
      <span className="bg-blue-50 text-[#305D9F] px-1.5 py-0.5 sm:px-2 rounded border border-blue-100 text-[10px] sm:text-xs">
        {i.kuu || '-'}
      </span>
    ),
  },
  { label: 'Harga Sebelum', th: 'text-center', td: 'text-center text-slate-500 tabular-nums', render: (i) => rupiah(i.harga_sebelum) },
  { label: 'Harga Update', th: 'text-center', td: 'text-center font-bold text-slate-900 tabular-nums', render: (i) => rupiah(i.harga_update) },
]

export default function DataTable({ items, loading, total, page, setPage, limit, onExport, exporting }) {
  const totalPages = Math.ceil(total / limit) || 1
  const empty = (msg) => (
    <tr>
      <td colSpan={COLUMNS.length} className="text-center py-8 sm:py-12 text-slate-400 text-xs sm:text-sm">
        {msg}
      </td>
    </tr>
  )

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-0">
      <div className="overflow-x-auto overflow-y-auto flex-1 h-full">
        {/* w-max: lebar mengikuti isi; min-w-full: tetap penuh kalau kolom sedikit */}
        <table className="w-max min-w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-1 shadow-xs">
            <tr className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              {COLUMNS.map((c) => (
                <th key={c.label} className={`${TH} ${c.th}`}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading
              ? empty('Memuat data...')
              : items.length === 0
                ? empty('Tidak ada data ditemukan.')
                : items.map((item) => (
                    <tr key={`${item.plu}|${item.supplier}`} className="hover:bg-slate-50 transition-colors">
                      {COLUMNS.map((c) => (
                        <td key={c.label} className={`${TD} ${c.td}`}>{c.render(item)}</td>
                      ))}
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-50 border-t border-slate-200 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
            Menampilkan <span className="font-bold text-slate-800">{items.length}</span> dari{' '}
            <span className="font-bold text-slate-800">{total}</span> total
          </p>
          <button
            onClick={onExport}
            disabled={exporting || loading || total === 0}
            title="Unduh semua data sesuai filter saat ini"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] sm:text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>{exporting ? 'Mengunduh...' : 'Export Excel'}</span>
          </button>
        </div>
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1 || loading}
            className="p-1 sm:p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 px-1 sm:px-2 whitespace-nowrap">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page >= totalPages || loading}
            className="p-1 sm:p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}