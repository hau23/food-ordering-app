import { useState, useEffect } from 'react'
import RestaurantCard from '../components/RestaurantCard'
import { supabase } from '../lib/supabase'

function RestaurantList() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('All')
  const [cuisineTypes, setCuisineTypes] = useState(['All'])

  useEffect(() => {
    fetchCuisineTypes()
  }, [])

  useEffect(() => {
    fetchRestaurants()
  }, [searchTerm, selectedCuisine])

  const fetchCuisineTypes = async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('restaurants')
        .select('cuisine_type')

      if (supabaseError) {
        console.error('Error fetching cuisine types:', supabaseError)
      } else {
        const uniqueCuisines = [...new Set(data.map(r => r.cuisine_type).filter(Boolean))]
        setCuisineTypes(['All', ...uniqueCuisines.sort()])
      }
    } catch (err) {
      console.error('Error fetching cuisine types:', err)
    }
  }

  const fetchRestaurants = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('restaurants')
        .select('*')

      // Apply search filter
      if (searchTerm.trim()) {
        query = query.ilike('name', `%${searchTerm}%`)
      }

      // Apply cuisine filter
      if (selectedCuisine !== 'All') {
        query = query.eq('cuisine_type', selectedCuisine)
      }

      query = query.order('name')

      const { data, error: supabaseError } = await query

      if (supabaseError) {
        setError('Failed to load restaurants: ' + supabaseError.message)
        console.error('Error fetching restaurants:', supabaseError)
      } else {
        setRestaurants(data || [])
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message)
      console.error('Error fetching restaurants:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedCuisine('All')
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Find Restaurants</h2>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1.5">
              Search by name
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-gray-800"
            />
          </div>

          {/* Cuisine Filter */}
          <div className="sm:w-64">
            <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-1.5">
              Cuisine Type
            </label>
            <select
              id="cuisine"
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base bg-white text-gray-800"
            >
              {cuisineTypes.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || selectedCuisine !== 'All') && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1.5 bg-blue-100 px-3 py-1 rounded-full text-xs sm:text-sm">
                Name: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="hover:text-blue-900"
                  aria-label="Clear search"
                >
                  ×
                </button>
              </span>
            )}
            {selectedCuisine !== 'All' && (
              <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs sm:text-sm">
                Cuisine: {selectedCuisine}
                <button
                  onClick={() => setSelectedCuisine('All')}
                  className="hover:text-blue-900"
                  aria-label="Clear cuisine filter"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="text-xs sm:text-sm hover:text-blue-800 underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <p className="text-gray-800 text-center text-lg sm:text-xl">Loading restaurants...</p>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* No Results */}
      {!loading && !error && restaurants.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl sm:text-6xl mb-4">🔍</div>
          <p className="text-gray-800 text-lg sm:text-xl font-semibold mb-2">No restaurants found</p>
          <p className="text-gray-600 text-sm sm:text-base mb-4">
            {searchTerm || selectedCuisine !== 'All'
              ? "Try adjusting your search or filters"
              : "No restaurants available at the moment"}
          </p>
          {(searchTerm || selectedCuisine !== 'All') && (
            <button
              onClick={handleClearFilters}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Restaurant Grid */}
      {!loading && !error && restaurants.length > 0 && (
        <>
          <div className="mb-4 text-sm sm:text-base text-gray-600">
            Found {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </>
      )}
    </main>
  )
}

export default RestaurantList
