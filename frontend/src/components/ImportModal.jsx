import { Upload, X, Lock, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

export default function ImportModal({
  isOpen,
  onClose,
  adminToken,
  setAdminToken,
  setSelectedFile,
  handleUpload,
  uploading,
  uploadError,
  uploadResult,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-[#305D9F] rounded-lg">
              <Upload className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-slate-800 text-base">Import Master Data Excel</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleUpload} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Admin Token
            </label>
            <input
              type="password"
              placeholder="Masukkan Token Admin..."
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#305D9F] focus:bg-white transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              File Excel (.xlsx)
            </label>
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setSelectedFile(e.target.files[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#305D9F] hover:file:bg-blue-100 transition-all cursor-pointer"
              required
            />
          </div>

          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadResult && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Import Berhasil Dituntaskan!</span>
              </div>
              <div className="pl-5 text-emerald-700">
                <p>• Data Baru (Inserted): <strong>{uploadResult.inserted}</strong></p>
                <p>• Data Diperbarui (Updated): <strong>{uploadResult.updated}</strong></p>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-[#305D9F] hover:bg-[#254b82] text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengunggah...</span>
                </>
              ) : (
                <span>Unggah & Process</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}