import { Database, Upload } from 'lucide-react'

export default function Header({ onOpenModal }) {
  return (
    <header className="bg-[#D11A22] text-white shrink-0 z-10 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-xl text-white backdrop-blur-xs">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg leading-tight tracking-wide text-white">
                Search PLU
              </h1>
              <span className="text-[10px] font-extrabold bg-white text-[#D11A22] px-2 py-0.5 rounded-md shadow-xs">
                ALFAMIDI
              </span>
            </div>
            <p className="text-xs text-red-100 font-medium">Procurement & Master Data System</p>
          </div>
        </div>

        <button
          onClick={onOpenModal}
          className="bg-[#305D9F] hover:bg-[#254b82] active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-md cursor-pointer border border-white/20"
        >
          <Upload className="w-4 h-4" />
          <span>Import Excel</span>
        </button>
      </div>
    </header>
  )
}