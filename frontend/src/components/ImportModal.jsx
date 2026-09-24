import { Upload, X, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export default function ImportModal({
  isOpen,
  onClose,
  setSelectedFile,
  handleUpload,
  uploading,
  uploadError,
  uploadResult,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* HEADER MODAL */}
        <div className="bg-[#D11A22] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Import Data Master PLU</h3>
              <p className="text-xs text-red-100">Upload file Excel (.xlsx / .xls)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleUpload} className="p-6 space-y-4">
          {/* PESAN ERROR */}
          {uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* PESAN SUKSES HASIL IMPORT */}
          {uploadResult && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Proses Import Selesai!</span>
              </div>
              <p>Total Baris Diproses: <strong>{uploadResult.total_rows || 0}</strong></p>
              <p>Berhasil Disimpan: <strong className="text-emerald-600">{uploadResult.inserted || 0}</strong></p>
              <p>Gagal / Diabaikan: <strong className="text-amber-600">{uploadResult.skipped || 0}</strong></p>
            </div>
          )}

          {/* DRAG & DROP / FILE INPUT */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilih File Excel
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-[#305D9F] rounded-xl p-6 text-center cursor-pointer transition bg-slate-50 hover:bg-slate-50/50 relative">
              <input
                type="file"
                accept=".xlsx, .xls"
                required
                onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileSpreadsheet className="w-10 h-10 text-[#305D9F] mx-auto mb-2 opacity-80" />
              <p className="text-xs font-medium text-slate-700">
                Klik atau seret file Excel ke area ini
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Format yang didukung: .xlsx, .xls
              </p>
            </div>
          </div>

          {/* FOOTER BUTTONS */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Tutup
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="bg-[#305D9F] hover:bg-[#254b82] active:scale-95 text-white text-xs font-bold px-5 py-2 rounded-lg transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengunggah...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Mulai Upload</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}