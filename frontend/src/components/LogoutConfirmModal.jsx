import { useState, useEffect } from 'react'
import { LogOut, X, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  const [isLoggedOut, setIsLoggedOut] = useState(false)

  // Tangani klik di mana saja saat status sukses logout
  useEffect(() => {
    if (!isLoggedOut) return

    const handleAnyClick = () => {
      onConfirm()
      setIsLoggedOut(false)
    }

    window.addEventListener('click', handleAnyClick)
    return () => window.removeEventListener('click', handleAnyClick)
  }, [isLoggedOut, onConfirm])

  if (!isOpen) return null

  const handleLogoutAction = () => {
    setIsLoggedOut(true)
    
    setTimeout(() => {
      onConfirm()
      setIsLoggedOut(false)
    }, 1500)
  }

  const handleCloseModal = () => {
    setIsLoggedOut(false)
    onClose()
  }

  return (
    <div 
      onClick={isLoggedOut ? () => { onConfirm(); setIsLoggedOut(false); } : handleCloseModal}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 transition-opacity duration-300"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 animate-fade-scale"
      >
        {isLoggedOut ? (
          /* FEEDBACK LOGOUT SUKSES (Warna Aksen Merah Alfamidi) */
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
            <div className="relative flex items-center justify-center">
              <div 
                className="absolute w-20 h-20 bg-red-400/20 rounded-full animate-ping opacity-75"
                style={{ animationDuration: '2s' }}
              />
              <div className="absolute w-16 h-16 bg-red-500/10 rounded-full animate-pulse" />
              <div className="relative w-14 h-14 bg-red-50 text-[#D11A22] rounded-full flex items-center justify-center border border-red-200 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800">Berhasil Logout</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Sesi admin kamu telah berakhir.
              </p>
            </div>
          </div>
        ) : (
          /* FORM KONFIRMASI LOGOUT */
          <>
            <div className="bg-[#D11A22] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-sm leading-tight">Konfirmasi Logout</h3>
              </div>
              <button 
                onClick={handleCloseModal}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-red-50 text-[#D11A22] rounded-full flex items-center justify-center mx-auto border border-red-100 shadow-xs">
                <LogOut className="w-6 h-6 ml-0.5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">Keluar dari Sesi Admin?</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Kamu harus login kembali untuk mengakses fitur <span className="font-semibold text-slate-700">Import Excel</span>.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLogoutAction}
                className="bg-[#D11A22] hover:bg-red-700 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Ya, Logout</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}