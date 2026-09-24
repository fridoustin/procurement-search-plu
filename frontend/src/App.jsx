import { useState, useEffect } from 'react'
import axios from 'axios'

import Header from './components/header'
import RealtimeBanner from './components/realtimebanner'
import StatsWidget from './components/StatsWidget'
import FilterBar from './components/FilterBar'
import DataTable from './components/DataTable'
import ImportModal from './components/ImportModal'

const API_BASE = 'http://localhost:8000/api'

export default function App() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  
  const [currentTime, setCurrentTime] = useState(new Date())
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Filter States
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

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stats`)
      setStats(res.data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Gagal mengambil statistik:', err)
    }
  }

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

  // Ticking Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Initial load & Polling Data (30s)
  useEffect(() => {
    fetchStats()
    fetchItems()
    const interval = setInterval(() => {
      fetchStats()
      fetchItems()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Debounced search / filter fetch
  useEffect(() => {
    const timer = setTimeout(() => fetchItems(), 300)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedKuu, selectedActive])

  // Handle Excel Upload
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
      <Header onOpenModal={() => setIsModalOpen(true)} />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col min-h-0">
        <RealtimeBanner lastUpdated={lastUpdated} currentTime={currentTime} />
        <StatsWidget stats={stats} />
        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedKuu={selectedKuu}
          setSelectedKuu={setSelectedKuu}
          selectedActive={selectedActive}
          setSelectedActive={setSelectedActive}
          stats={stats}
          loading={loading}
          onRefresh={() => { fetchItems(); fetchStats(); }}
        />
        <DataTable items={items} loading={loading} />
      </main>

      <ImportModal
        isOpen={isModalOpen}
        onClose={closeModal}
        adminToken={adminToken}
        setAdminToken={setAdminToken}
        setSelectedFile={setSelectedFile}
        handleUpload={handleUpload}
        uploading={uploading}
        uploadError={uploadError}
        uploadResult={uploadResult}
      />
    </div>
  )
}