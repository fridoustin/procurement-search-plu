export default function DataTable({ items, loading }) {
  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-0">
      <div className="overflow-y-auto flex-1 h-full">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-1 shadow-xs">
            <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">PLU</th>
              <th className="py-3 px-4">Nama Barang</th>
              <th className="py-3 px-4">Supplier</th>
              <th className="py-3 px-4">Dept</th>
              <th className="py-3 px-4">KUU Cabang</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-12 text-slate-400">
                  Memuat data...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-12 text-slate-400">
                  Tidak ada data ditemukan.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-bold text-indigo-600">{item.plu}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">{item.name}</td>
                  <td className="py-2.5 px-4 text-slate-600 font-medium">{item.supplier}</td>
                  <td className="py-2.5 px-4 text-slate-500 text-xs font-medium">{item.dept || '-'}</td>
                  <td className="py-2.5 px-4 text-slate-600 text-xs font-mono font-bold">
                    <span className="bg-blue-50 text-[#305D9F] px-2 py-0.5 rounded border border-blue-100">
                      {item.kuu || '-'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
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
    </div>
  )
}