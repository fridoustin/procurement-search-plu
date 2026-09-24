import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Search, RefreshCw, Database, Upload, X, CheckCircle, 
  AlertCircle, Lock, Package, Users, CheckSquare, Clock 
} from 'lucide-react'

const API_BASE = 'http://localhost:8000/api'

export default function App() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  
  // Real-time Clock states
  const [currentTime, setCurrentTime] = useState(new Date())
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedKuu, setSelectedKuu] = useState('')
  const [selectedActive, setSelectedActive] = useState('')

  // Admin Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [adminToken, setAdminToken] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [uploadError, setUploadError] = useState('')

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stats`)
      setStats(res.data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Gagal mengambil statistik:', err)
    }
  }

  // Fetch Items
  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = {}
      if (searchQuery) params.q = searchQuery
      if (selectedKuu) params.kuu = selectedKuu
      if (selectedActive !== '') params.active = selectedActive === 'true'

      const res = await axios.get(`${API_BASE}/items`, { params })
      setItems(res.data.items)
      setTotal(res.data.total)
    } catch (err) {
      console.error('Gagal mengambil data items:', err)
    } finally {
      setLoading(false)
    }
  }

  // Live Clock (Update Jam setiap 1 detik)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Initial load & Polling Data (Auto-refresh data setiap 30 detik)
  useEffect(() => {
    fetchStats()
    fetchItems()

    const interval = setInterval(() => {
      fetchStats()
      fetchItems()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Auto-fetch filter
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedKuu, selectedActive])

  // Upload Excel
  const handleUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile || !adminToken) {
      setUploadError('Lengkapi token dan pilih file Excel.')
      return
    }

    setUploading(true)
    setUploadError('')
    setUploadResult(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const res = await axios.post(`${API_BASE}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-admin-token': adminToken,
        },
      })
      setUploadResult(res.data)
      fetchItems()
      fetchStats()
    } catch (err) {
      if (err.response) {
        setUploadError(err.response.data.detail || 'Gagal mengunggah file.')
      } else {
        setUploadError('Gagal terhubung ke server.')
      }
    } finally {
      setUploading(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedFile(null)
    setUploadResult(null)
    setUploadError('')
  }

  return (
    <div className="h-screen bg-slate-100 text-slate-800 flex flex-col overflow-hidden">
      {/* Header Utama Warna Merah Alfamidi */}
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

          <div className="flex items-center space-x-4">
            {/* Admin Upload Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#305D9F] hover:bg-[#254b82] active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-md cursor-pointer border border-white/20"
            >
              <Upload className="w-4 h-4" />
              <span>Import Excel</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col min-h-0">
        
        {/* Banner Status Real-Time & Live Clock Di Atas Statistik */}
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 mb-3 shadow-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-slate-800">Sistem Active</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 text-[11px]">
              Sync Terakhir: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          {/* Jam Real-time Berjalan */}
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#305D9F] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
            <Clock className="w-3.5 h-3.5 text-[#305D9F]" />
            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        </div>

        {/* Widget Statistik Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 shrink-0">
            {/* Card 1: Total Items */}
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

            {/* Card 2: Total Supplier */}
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

            {/* Card 3: Status Aktif */}
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

            {/* Card 4: Perubahan Hari Ini */}
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
        )}

        {/* Filter Controls (Fixed) */}
        <div className="bg-white p-3 rounded-xl shadow-xs border border-slate-200 mb-4 flex flex-col md:flex-row gap-3 shrink-0">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari PLU atau Nama Barang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D11A22] focus:bg-white transition-all"
            />
          </div>

          {/* Filter KUU Dinamis */}
          <div className="w-full md:w-52">
            <select
              value={selectedKuu}
              onChange={(e) => setSelectedKuu(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D11A22] focus:bg-white transition-all cursor-pointer font-medium"
            >
              <option value="">Semua KUU Cabang</option>
              {stats?.per_kuu
                ?.filter((k) => k.name)
                .map((k, idx) => (
                  <option key={idx} value={k.name}>
                    {k.name} ({k.n} item)
                  </option>
                ))}
            </select>
          </div>

          {/* Filter Status */}
          <div className="w-full md:w-44">
            <select
              value={selectedActive}
              onChange={(e) => setSelectedActive(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D11A22] focus:bg-white transition-all cursor-pointer font-medium"
            >
              <option value="">Semua Status</option>
              <option value="true">Aktif</option>
              <option value="false">Tidak Aktif</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => { fetchItems(); fetchStats(); }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer font-semibold"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Data Table Container - SCROLLABLE KHUSUS TABEL DATA */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-0">
          <div className="overflow-y-auto flex-1 h-full">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-1 shadow-xs">
                <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">PLU</th>
                  <th className="py-3 px-4">Nama Barang</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Dept</th>
                  <th className="py-3 px-4">KUU Cabang</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400">
                      Memuat data...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400">
                      Tidak ada data ditemukan.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-bold text-indigo-600">{item.plu}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{item.name}</td>
                      <td className="py-2.5 px-4 text-slate-600 font-medium">{item.supplier}</td>
                      <td className="py-2.5 px-4 text-slate-500 text-xs font-medium">{item.dept || '-'}</td>
                      <td className="py-2.5 px-4 text-slate-600 text-xs font-mono font-bold">
                        <span className="bg-blue-50 text-[#305D9F] px-2 py-0.5 rounded border border-blue-100">
                          {item.kuu || '-'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            item.active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {item.active ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Upload Excel Admin */}
      {isModalOpen && (
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
                onClick={closeModal}
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
                  onClick={closeModal}
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
      )}
    </div>
  )
}