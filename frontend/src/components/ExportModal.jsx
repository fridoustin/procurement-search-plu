import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { id } from 'react-day-picker/locale'
import 'react-day-picker/style.css'
import { Download, X, Loader2, CalendarRange } from 'lucide-react'

const iso = (d) => d.toLocaleDateString('sv-SE') // YYYY-MM-DD, waktu lokal
const fmt = (d) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

const presets = () => {
  const t = startOfDay(new Date())
  const y = t.getFullYear()
  const m = t.getMonth()
  return [
    { label: 'Hari ini', range: { from: t, to: t } },
    { label: '7 hari terakhir', range: { from: new Date(y, m, t.getDate() - 6), to: t } },
    { label: 'Bulan ini', range: { from: new Date(y, m, 1), to: t } },
    { label: 'Bulan lalu', range: { from: new Date(y, m - 1, 1), to: new Date(y, m, 0) } },
  ]
}

// Warna kalender mengikuti warna aplikasi (biru #305D9F)
const CAL_STYLE = {
  '--rdp-accent-color': '#305D9F',
  '--rdp-accent-background-color': '#E8EEF7',
  '--rdp-range_middle-background-color': '#E8EEF7',
  '--rdp-range_middle-color': '#1E3A66',
  '--rdp-day-height': '38px',
  '--rdp-day-width': '38px',
  '--rdp-day_button-height': '36px',
  '--rdp-day_button-width': '36px',
  '--rdp-selected-border': '2px solid #305D9F',  
}

export default function ExportModal({ isOpen, onClose, onExport, exporting, total }) {
  const [range, setRange] = useState(undefined) // { from, to } | undefined
  const [month, setMonth] = useState(new Date())

  if (!isOpen) return null

  const today = startOfDay(new Date())
  const from = range?.from
  const to = range?.to ?? range?.from // klik satu tanggal saja = satu hari
  const days = from ? Math.round((to - from) / 86400000) + 1 : 0

  const pick = (r) => {
    setRange(r)
    if (r?.from) setMonth(r.from)
  }

  const submit = async () => {
    await onExport(from ? iso(from) : '', from ? iso(to) : '')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[95vh] overflow-y-auto border border-slate-100 animate-in fade-in zoom-in duration-200">
        {/* HEADER */}
        <div className="bg-[#D11A22] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Export Excel</h3>
              <p className="text-xs text-red-100">Mengikuti pencarian dan filter yang sedang aktif</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Terakhir diubah pada</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => pick(undefined)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition cursor-pointer ${
                  !from ? 'bg-[#305D9F] text-white border-[#305D9F]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Semua tanggal
              </button>
              {presets().map((p) => (
                <button
                  key={p.label}
                  onClick={() => pick(p.range)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-[#305D9F] transition cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center rounded-xl border border-slate-200 bg-slate-50/60 py-2">
            <DayPicker
              mode="range"
              locale={id}
              weekStartsOn={1}
              selected={range}
              onSelect={pick}
              month={month}
              onMonthChange={setMonth}
              disabled={{ after: today }}
              showOutsideDays
              style={CAL_STYLE}
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-[#1e3a66]">
            <CalendarRange className="w-4 h-4 shrink-0" />
            {from ? (
              <span>
                <strong>{fmt(from)}</strong>
                {days > 1 && <> sampai <strong>{fmt(to)}</strong></>}
                <span className="text-slate-500"> ({days} hari)</span>
              </span>
            ) : (
              <span>Semua data, tanpa batas tanggal. Pilih tanggal di kalender untuk mempersempit.</span>
            )}
          </div>

          <div className="pt-1 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={submit}
              disabled={exporting || total === 0}
              className="bg-[#305D9F] hover:bg-[#254b82] active:scale-95 text-white text-xs font-bold px-5 py-2 rounded-lg transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{exporting ? 'Mengunduh...' : 'Unduh Excel'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}