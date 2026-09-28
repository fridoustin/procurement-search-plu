import { Search, RefreshCw } from 'lucide-react'

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  selectedKuu,
  setSelectedKuu,
  selectedActive,
  setSelectedActive,
  stats,
  loading,
  onRefresh,
}) {
  return (
    <div className="bg-white p-2.5 sm:p-3 rounded-xl shadow-xs border border-slate-200 mb-3 sm:mb-4 flex flex-col sm:flex-row gap-2 sm:gap-3 shrink-0">
      {/* Input Pencarian */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari PLU / Nama..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D11A22] focus:bg-white transition-all"
        />
      </div>

      {/* Container Filter & Refresh (Sejajar Horisontal di HP) */}
      <div className="grid grid-cols-[1fr_1fr_auto] sm:flex gap-2 w-full sm:w-auto">
        <select
          value={selectedKuu}
          onChange={(e) => setSelectedKuu(e.target.value)}
          className="w-full sm:w-48 px-2 sm:px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D11A22] focus:bg-white transition-all cursor-pointer font-medium truncate"
        >
          <option value="">Semua KUU</option>
          {stats?.per_kuu
            ?.filter((k) => k.name)
            .map((k, idx) => (
              <option key={idx} value={k.name}>
                {k.name} ({k.n})
              </option>
            ))}
        </select>

        <select
          value={selectedActive}
          onChange={(e) => setSelectedActive(e.target.value)}
          className="w-full sm:w-36 px-2 sm:px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D11A22] focus:bg-white transition-all cursor-pointer font-medium truncate"
        >
          <option value="">Status</option>
          <option value="true">Aktif</option>
          <option value="false">Inaktif</option>
        </select>

        <button
          onClick={onRefresh}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer font-semibold shrink-0"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  )
}