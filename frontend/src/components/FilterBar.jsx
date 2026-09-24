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
    <div className="bg-white p-3 rounded-xl shadow-xs border border-slate-200 mb-4 flex flex-col md:flex-row gap-3 shrink-0">
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari PLU atau Nama Barang..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D11A22] focus:bg-white transition-all"
        />
      </div>

      <div className="w-full md:w-52">
        <select
          value={selectedKuu}
          onChange={(e) => setSelectedKuu(e.target.value)}
          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D11A22] focus:bg-white transition-all cursor-pointer font-medium"
        >
          <option value="">Semua KUU Cabang</option>
          {stats?.per_kuu
            ?.filter((k) => k.name)
            .map((k, idx) => (
              <option key={idx} value={k.name}>
                {k.name} ({k.n} item)
              </option>
            ))}
        </select>
      </div>

      <div className="w-full md:w-44">
        <select
          value={selectedActive}
          onChange={(e) => setSelectedActive(e.target.value)}
          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D11A22] focus:bg-white transition-all cursor-pointer font-medium"
        >
          <option value="">Semua Status</option>
          <option value="true">Aktif</option>
          <option value="false">Tidak Aktif</option>
        </select>
      </div>

      <button
        onClick={onRefresh}
        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer font-semibold"
        title="Refresh Data"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  )
}