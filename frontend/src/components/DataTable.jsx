import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function DataTable({ items, loading, total, page, setPage, limit }) {
  const totalPages = Math.ceil(total / limit) || 1

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-0">
      {/* Scrollable Table Content */}
      <div className="overflow-x-auto overflow-y-auto flex-1 h-full">
        <table className="w-full text-left border-collapse min-w-180 sm:min-w-225">
          <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-1 shadow-xs">
            <tr className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 w-[12%] whitespace-nowrap">PLU</th>
              <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 w-[35%]">Nama Barang</th>
              <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 w-[23%] text-center whitespace-nowrap">Supplier</th>
              <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 w-[12%] text-center whitespace-nowrap">Dept</th>
              <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 w-[10%] text-center whitespace-nowrap">KUU Cabang</th>
              <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 w-[8%] text-center whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8 sm:py-12 text-slate-400 text-xs sm:text-sm">
                  Memuat data...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 sm:py-12 text-slate-400 text-xs sm:text-sm">
                  Tidak ada data ditemukan.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-2.5 sm:py-3 sm:px-4 font-mono font-bold text-indigo-600 whitespace-nowrap text-xs sm:text-sm">
                    {item.plu}
                  </td>
                  <td className="py-2 px-2.5 sm:py-3 sm:px-4 font-semibold text-slate-900 leading-snug text-xs sm:text-sm">
                    {item.name}
                  </td>
                  <td className="py-2 px-2.5 sm:py-3 sm:px-4 text-slate-600 font-medium text-center whitespace-nowrap text-xs sm:text-sm">
                    {item.supplier}
                  </td>
                  <td className="py-2 px-2.5 sm:py-3 sm:px-4 text-slate-500 text-[10px] sm:text-xs font-medium text-center whitespace-nowrap">
                    {item.dept || '-'}
                  </td>
                  <td className="py-2 px-2.5 sm:py-3 sm:px-4 text-slate-600 text-[10px] sm:text-xs font-mono font-bold text-center whitespace-nowrap">
                    <span className="bg-blue-50 text-[#305D9F] px-1.5 py-0.5 sm:px-2 rounded border border-blue-100">
                      {item.kuu || '-'}
                    </span>
                  </td>
                  <td className="py-2 px-2.5 sm:py-3 sm:px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 rounded-full text-[10px] sm:text-xs font-bold ${
                        item.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {item.active ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between shrink-0">
        <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
          Menampilkan <span className="font-bold text-slate-800">{items.length}</span> dari{' '}
          <span className="font-bold text-slate-800">{total}</span> total
        </p>

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