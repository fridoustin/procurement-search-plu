import { useState } from 'react'
import { Upload, LogIn, LogOut } from 'lucide-react'
import alfamidiLogo from '../assets/alfamidilogo-down.svg'
import LogoutConfirmModal from './LogoutConfirmModal'

export default function Header({ isAdminLoggedIn, onOpenLogin, onOpenImport, onLogout }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleConfirmLogout = () => {
    setShowLogoutModal(false)
    onLogout()
  }

  return (
    <>
      <header className="bg-[#D11A22] text-white shrink-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* SISI KIRI: LOGO & JUDUL */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="bg-white p-1 rounded-xl shadow-xs border border-white/20 flex items-center justify-center shrink-0">
              <img 
                src={alfamidiLogo} 
                alt="Alfamidi Logo" 
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </div>
            <div className="truncate">
              <h1 className="font-extrabold text-base sm:text-lg leading-tight tracking-wide text-white truncate">
                Search PLU
              </h1>
              {/* Subteks disembunyikan pada layar HP/Mobile */}
              <p className="hidden sm:block text-xs text-red-100 font-medium truncate">
                Procurement & Master Data System
              </p>
            </div>
          </div>

          {/* SISI KANAN: TOMBOL AKSI */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isAdminLoggedIn ? (
              <>
                <button
                  onClick={onOpenImport}
                  title="Import Excel"
                  className="bg-[#305D9F] hover:bg-[#254b82] active:scale-95 text-white text-xs font-bold p-2.5 sm:px-4 sm:py-2 rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer border border-white/20"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Import Excel</span>
                </button>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  title="Logout"
                  className="bg-black/20 hover:bg-black/30 active:scale-95 text-white text-xs font-bold p-2.5 sm:px-3 sm:py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={onOpenLogin}
                title="Login Admin"
                className="bg-[#305D9F] hover:bg-[#254b82] active:scale-95 text-white text-xs font-bold p-2.5 sm:px-4 sm:py-2 rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer border border-white/20"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login Admin</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MODAL KONFIRMASI LOGOUT */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  )
}