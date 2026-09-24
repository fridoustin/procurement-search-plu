import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          PLU Procurement Dashboard
        </h1>
        <p className="text-slate-500 mb-6 text-sm">
          Tailwind CSS v4 & React + Vite siap digunakan!
        </p>
        
        <button 
          onClick={() => setCount((c) => c + 1)}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-medium px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-indigo-200"
        >
          Count is {count}
        </button>
      </div>
    </div>
  )
}