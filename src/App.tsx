import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Food & Blood Sugar Analyzer
        </h1>
        <p className="text-gray-600 mb-6">
          Welcome to your diabetes management application
        </p>
        <div className="space-y-4">
          <button 
            onClick={() => setCount((count) => count + 1)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Count is {count}
          </button>
          <p className="text-sm text-gray-500">
            Backend API: https://back-end-food-blood-sugar-analyzer.onrender.com
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
