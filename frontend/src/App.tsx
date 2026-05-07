import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState<string>('Loading...')

  useEffect(() => {
    // Test API connection
    fetch('http://localhost:8000/health')
      .then(res => res.json())
      .then(data => setApiStatus(data.status))
      .catch(err => setApiStatus('Error: ' + err.message))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">LogsStock</h1>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-2">API Status:</p>
          <p className="text-lg font-semibold text-green-600">{apiStatus}</p>
        </div>

        <div className="text-sm text-gray-500">
          <p>✓ React + TypeScript</p>
          <p>✓ Tailwind CSS</p>
          <p>✓ Vite</p>
        </div>
      </div>
    </div>
  )
}

export default App
