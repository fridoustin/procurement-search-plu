import { Package, Users, CheckSquare, Clock } from 'lucide-react'

export default function StatsWidget({ stats }) {
  if (!stats) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 shrink-0">
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between border-l-4 border-l-[#D11A22]">
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Items</p>
          <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.total}</h3>
          <p className="text-[10px] font-bold text-[#D11A22] mt-0.5">{stats.plu} PLU Unik</p>
        </div>
        <div className="p-2.5 bg-red-50 text-[#D11A22] rounded-xl">
          <Package className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between border-l-4 border-l-[#305D9F]">
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Supplier</p>
          <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.suppliers}</h3>
          <p className="text-[10px] font-bold text-[#305D9F] mt-0.5">Mitra Terdaftar</p>
        </div>
        <div className="p-2.5 bg-blue-50 text-[#305D9F] rounded-xl">
          <Users className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between border-l-4 border-l-emerald-500">
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status Active</p>
          <h3 className="text-xl font-black text-emerald-600 mt-0.5">{stats.active}</h3>
          <p className="text-[10px] font-bold text-rose-500 mt-0.5">{stats.inactive} Inaktif</p>
        </div>
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
          <CheckSquare className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between border-l-4 border-l-amber-500">
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Update Hari Ini</p>
          <h3 className="text-xl font-black text-slate-900 mt-0.5">
            {stats.new_today + stats.changed_today}
          </h3>
          <p className="text-[10px] font-bold text-amber-600 mt-0.5">
            +{stats.new_today} Baru / {stats.changed_today} Diubah
          </p>
        </div>
        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
          <Clock className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}