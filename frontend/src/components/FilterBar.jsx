import { Search, RefreshCw, X } from 'lucide-react'

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
  // Cek apakah ada filter yang sedang aktif
  const isFiltered = searchQuery || selectedKuu || selectedActive

  // Fungsi untuk mereset seluruh filter
  const handleReset = () => {
    setSearchQuery('')
    setSelectedKuu('')
    setSelectedActive('')
  }

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
          className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D11A22] focus:bg-white transition-all"
        />
        {/* Tombol Clear Input Search */}
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Container Filter & Refresh */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <select
          value={selectedKuu}
          onChange={(e) => setSelectedKuu(e.target.value)}
          className="flex-1 sm:w-48 px-2 sm:px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D11A22] focus:bg-white transition-all cursor-pointer font-medium truncate"
        >
          <option value="">Semua KUU</option>
          {stats?.per_kuu
            ?.filter((k) => k.name)
            .map((k, idx) => (
              <option key={idx} value={k.name}>
                {k.name}
              </option>
            ))}
        </select>

        <select
          value={selectedActive}
          onChange={(e) => setSelectedActive(e.target.value)}
          className="flex-1 sm:w-36 px-2 sm:px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D11A22] focus:bg-white transition-all cursor-pointer font-medium truncate"
        >
          <option value="">Semua Status</option>
          <option value="true">Aktif</option>
          <option value="false">Inaktif</option>
        </select>

        {/* Tombol Reset Filter */}
        {isFiltered && (
          <button
            onClick={handleReset}
            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer font-medium shrink-0"
            title="Reset Semua Filter"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}

        {/* Tombol Refresh */}
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