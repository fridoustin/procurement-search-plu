import { useEffect, useRef, useState } from 'react'
import { Upload, X, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

const MAX_BYTES = 10 * 1024 * 1024 // samakan dengan MAX_XLSX_SIZE di backend
const fmtSize = (b) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)

export default function ImportModal({
  isOpen,
  onClose,
  setSelectedFile,
  handleUpload,
  uploading,
  uploadError,
  uploadResult,
}) {
  const [file, setFile] = useState(null)
  const [hideFeedback, setHideFeedback] = useState(false)
  const inputRef = useRef(null)

  // Hasil/error baru dari parent -> tampilkan, lalu kosongkan pilihan file
  useEffect(() => {
    setHideFeedback(false)
    if (uploadResult) {
      setFile(null)
      setSelectedFile(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }, [uploadResult, uploadError]) // eslint-disable-line react-hooks/exhaustive-deps

  // Modal ditutup -> kosongkan pilihan (parent juga mengosongkan selectedFile)
  useEffect(() => {
    if (!isOpen) setFile(null)
  }, [isOpen])

  if (!isOpen) return null

  const tooBig = file && file.size > MAX_BYTES
  const onPick = (e) => {
    const f = e.target.files[0] || null
    setFile(f)
    setSelectedFile(f)
    setHideFeedback(true) // sembunyikan hasil import sebelumnya
  }

  const inserted = uploadResult?.inserted || 0
  const updated = uploadResult?.updated || 0
  const unchanged = uploadResult?.unchanged || 0
  const errors = uploadResult?.errors || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-100 animate-in fade-in zoom-in duration-200">
        {/* HEADER MODAL */}
        <div className="bg-[#D11A22] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Import Data Master PLU</h3>
              <p className="text-xs text-red-100">Upload file Excel (.xlsx)</p>
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
          {!hideFeedback && uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {!hideFeedback && uploadResult && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-lg space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>Import selesai ({inserted + updated + unchanged + errors.length} baris)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white rounded-lg border border-emerald-100 py-2">
                  <p className="text-lg font-bold text-emerald-600">{inserted}</p>
                  <p className="text-[10px] text-slate-500">Baru</p>
                </div>
                <div className="bg-white rounded-lg border border-emerald-100 py-2">
                  <p className="text-lg font-bold text-[#305D9F]">{updated}</p>
                  <p className="text-[10px] text-slate-500">Diperbarui</p>
                </div>
                <div className="bg-white rounded-lg border border-emerald-100 py-2">
                  <p className="text-lg font-bold text-slate-500">{unchanged}</p>
                  <p className="text-[10px] text-slate-500">Tidak berubah</p>
                </div>
              </div>
              {errors.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-2.5">
                  <p className="font-bold mb-1">{errors.length} baris dilewati:</p>
                  <ul className="max-h-28 overflow-y-auto list-disc pl-4 space-y-0.5">
                    {errors.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pilih File Excel</label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition relative ${
                tooBig
                  ? 'border-red-300 bg-red-50'
                  : file
                    ? 'border-emerald-400 bg-emerald-50/50'
                    : 'border-slate-300 hover:border-[#305D9F] bg-slate-50'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx"
                onChange={onPick}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {file ? (
                <>
                  <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800 break-all">{file.name}</p>
                  <p className={`text-[11px] mt-0.5 ${tooBig ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                    {fmtSize(file.size)}
                    {tooBig && ' — melebihi batas 10 MB'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Klik untuk mengganti file</p>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-10 h-10 text-[#305D9F] mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-medium text-slate-700">Klik atau seret file Excel ke area ini</p>
                  <p className="text-[10px] text-slate-400 mt-1">Format yang didukung: .xlsx (maks 10 MB)</p>
                </>
              )}
            </div>
          </div>

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
              disabled={uploading || !file || tooBig}
              className="bg-[#305D9F] hover:bg-[#254b82] active:scale-95 text-white text-xs font-bold px-5 py-2 rounded-lg transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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