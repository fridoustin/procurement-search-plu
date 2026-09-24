import { Clock } from 'lucide-react'

export default function RealtimeBanner({ lastUpdated, currentTime }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 mb-3 shadow-xs flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="font-bold text-slate-800">Sistem Active</span>
        <span className="text-slate-300">•</span>
        <span className="text-slate-500 text-[11px]">
          Sync Terakhir: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#305D9F] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
        <Clock className="w-3.5 h-3.5 text-[#305D9F]" />
        <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      </div>
    </div>
  )
}