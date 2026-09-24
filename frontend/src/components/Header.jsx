import { Upload, LogIn, LogOut } from 'lucide-react'
import alfamidiLogo from '../assets/alfamidilogo-down.svg'

export default function Header({ isAdminLoggedIn, onOpenLogin, onOpenImport, onLogout }) {
  return (
    <header className="bg-[#D11A22] text-white shrink-0 z-10 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-1 rounded-xl shadow-xs border border-white/20 flex items-center justify-center">
            <img 
              src={alfamidiLogo} 
              alt="Alfamidi Logo" 
              className="h-9 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight tracking-wide text-white">
              Search PLU
            </h1>
            <p className="text-xs text-red-100 font-medium">Procurement & Master Data System</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdminLoggedIn ? (
            <>
              <button
                onClick={onOpenImport}
                className="bg-[#305D9F] hover:bg-[#254b82] active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-md cursor-pointer border border-white/20"
              >
                <Upload className="w-4 h-4" />
                <span>Import Excel</span>
              </button>
              <button
                onClick={onLogout}
                className="bg-black/20 hover:bg-black/30 active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={onOpenLogin}
              className="bg-[#305D9F] hover:bg-[#254b82] active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-md cursor-pointer border border-white/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Login Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}