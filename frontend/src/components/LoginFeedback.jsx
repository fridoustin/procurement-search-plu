import { useEffect } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function LoginFeedback({ status, username, errorMessage, onRetry, onClose }) {
  // Tutup modal jika user mengeklik di luar modal atau menekan tombol apa saja
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (onClose) onClose()
    }
    window.addEventListener('click', handleOutsideClick)
    return () => window.removeEventListener('click', handleOutsideClick)
  }, [onClose])

  if (status === 'success') {
    return (
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="p-8 text-center flex flex-col items-center justify-center space-y-4 animate-fade-scale"
      >
        <div className="relative flex items-center justify-center">
          <div
            className="absolute w-20 h-20 bg-emerald-400/30 rounded-full animate-ping opacity-75"
            style={{ animationDuration: '2s' }}
          />
          <div className="absolute w-16 h-16 bg-emerald-500/20 rounded-full animate-pulse" />
          <div className="relative w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-300 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-800">Login Berhasil!</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Selamat datang kembali, <span className="font-bold text-slate-700">{username}</span>.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="p-8 text-center flex flex-col items-center justify-center space-y-4 animate-fade-scale"
      >
        <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 bg-red-500/20 rounded-full animate-pulse" />
          <div className="relative w-14 h-14 bg-red-100 text-[#D11A22] rounded-full flex items-center justify-center border border-red-200 shadow-sm">
            <XCircle className="w-8 h-8" />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">Gagal Masuk</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            {errorMessage}
          </p>
        </div>

        <button
          onClick={onRetry}
          className="bg-[#D11A22] hover:bg-red-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  return null
}