import { useState, useEffect } from 'react'
import './App.css'
import RestaurantCard from './components/RestaurantCard'

function App() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/restaurants')
      const data = await response.json()

      if (data.success) {
        setRestaurants(data.data)
      } else {
        setError('Failed to load restaurants')
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message)
      console.error('Error fetching restaurants:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-2xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          🍕 Bear - Food Ordering App
        </h1>

        {loading && (
          <p className="text-gray-800 text-center text-xl">Loading restaurants...</p>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && !error && restaurants.length === 0 && (
          <p className="text-gray-800 text-center text-xl">No restaurants found</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
