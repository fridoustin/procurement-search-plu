import { Clock } from 'lucide-react'

export default function RealtimeBanner({ lastImportedAt, currentTime }) {
  // Format Tanggal & Jam Import: "Senin, 28 September 2026, 14:30"
  const formatDate = (dateValue) => {
    if (!dateValue) return 'Belum ada data'
    
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return 'Belum ada data'

    const formattedDate = date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    const formattedTime = date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })

    return `${formattedDate}, ${formattedTime}`
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 sm:px-4 py-2 mb-3 shadow-xs flex items-center justify-between shrink-0 gap-2">
      {/* Sisi Kiri: Status & Last Imported */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium text-slate-600 min-w-0">
        <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500"></span>
        </span>
        
        <span className="font-bold text-slate-800 text-[11px] sm:text-xs whitespace-nowrap">
          Active
        </span>
        
        <span className="text-slate-300">•</span>
        
        {/* Tanpa Ikon Database - Menampilkan Hari, Tanggal Bulan Tahun, Jam */}
        <div className="flex items-center gap-1 text-slate-500 text-[10px] sm:text-[11px] truncate">
          <span className="hidden sm:inline">Last Imported : </span>
          <span className="sm:hidden">Import : </span>
          <span className="font-semibold text-slate-700 truncate">
            {formatDate(lastImportedAt)}
          </span>
        </div>
      </div>

      {/* Sisi Kanan: Jam Digital Realtime */}
      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono font-bold text-[#305D9F] bg-blue-50 px-2 sm:px-2.5 py-1 rounded-lg border border-blue-100 shrink-0 whitespace-nowrap">
        <Clock className="w-3.5 h-3.5 text-[#305D9F] shrink-0" />
        <span>
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>
    </div>
  )
}