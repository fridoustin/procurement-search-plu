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

  // Fetch Stats dari FastAPI
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stats`)
      setStats(res.data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Gagal mengambil statistik:', err)
    }
  }

  // Fetch Items dari FastAPI
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

  // Initial load & Polling Real-time (Auto-refresh setiap 30 detik)
  useEffect(() => {
    fetchStats()
    fetchItems()

    const interval = setInterval(() => {
      fetchStats()
      fetchItems()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Auto-fetch saat filter berubah (debounce search)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedKuu, selectedActive])

  // Handle Upload Excel
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
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 leading-tight">Search PLU</h1>
              <p className="text-xs text-slate-500">Procurement & Master Data System</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Real-time Status Badge */}
            <div className="hidden md:flex items-center gap-2 bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-full border border-slate-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live • {lastUpdated.toLocaleTimeString()}</span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Import Excel</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Widget Statistik Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Card 1: Total Items */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Total Items / Master</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</h3>
                <p className="text-[11px] text-indigo-600 font-medium mt-0.5">{stats.plu} PLU Unik</p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Package className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2: Total Supplier */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Total Supplier</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.suppliers}</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Terdaftar aktif</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Card 3: Status Aktif vs Inaktif */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Status Active</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</h3>
                <p className="text-[11px] text-rose-500 font-medium mt-0.5">{stats.inactive} Tidak Aktif</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckSquare className="w-6 h-6" />
              </div>
            </div>

            {/* Card 4: Perubahan Hari Ini */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Update Hari Ini</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {stats.new_today + stats.changed_today}
                </h3>
                <p className="text-[11px] text-amber-600 font-medium mt-0.5">
                  +{stats.new_today} Baru / {stats.changed_today} Diubah
                </p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-3">
          {/* Input Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari PLU atau Nama Barang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filter KUU Dinamis */}
          <div className="w-full md:w-48">
            <select
              value={selectedKuu}
              onChange={(e) => setSelectedKuu(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
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
          <div className="w-full md:w-48">
            <select
              value={selectedActive}
              onChange={(e) => setSelectedActive(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            >
              <option value="">Semua Status</option>
              <option value="true">Aktif</option>
              <option value="false">Tidak Aktif</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => { fetchItems(); fetchStats(); }}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            title="Refresh Manual"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">PLU</th>
                  <th className="py-3.5 px-4">Nama Barang</th>
                  <th className="py-3.5 px-4">Supplier</th>
                  <th className="py-3.5 px-4">Dept</th>
                  <th className="py-3.5 px-4">KUU Cabang</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
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
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-indigo-600">{item.plu}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{item.name}</td>
                      <td className="py-3 px-4 text-slate-600">{item.supplier}</td>
                      <td className="py-3 px-4 text-slate-500 text-xs">{item.dept || '-'}</td>
                      <td className="py-3 px-4 text-slate-500 text-xs font-mono">{item.kuu || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-slate-800 text-base">Import Master Data Excel</h2>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Admin Token
                </label>
                <input
                  type="password"
                  placeholder="Masukkan Token Admin..."
                  value={adminToken}
                  onChange={(e) => setAdminToken(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  File Excel (.xlsx)
                </label>
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
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
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
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
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
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