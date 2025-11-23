import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function RestaurantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRestaurantDetails()
  }, [id])

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true)

      // Fetch restaurant details
      const restaurantResponse = await fetch(`http://localhost:3001/api/restaurants/${id}`)
      const restaurantData = await restaurantResponse.json()

      if (!restaurantData.success) {
        setError('Failed to load restaurant details')
        return
      }

      setRestaurant(restaurantData.data)

      // Fetch menu items
      const menuResponse = await fetch(`http://localhost:3001/api/restaurants/${id}/menu`)
      const menuData = await menuResponse.json()

      if (menuData.success) {
        setMenuItems(menuData.data)
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message)
      console.error('Error fetching restaurant details:', err)
    } finally {
      setLoading(false)
    }
  }

  // Group menu items by category
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    const category = item.category || 'Other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {})

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-gray-800 text-center text-xl">Loading...</p>
      </main>
    )
  }

  if (error || !restaurant) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Restaurant not found'}
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to restaurants
        </button>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="text-white hover:text-blue-200 mb-6 flex items-center gap-2"
      >
        ← Back to restaurants
      </button>

      {/* Restaurant header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex gap-6">
          {/* Restaurant image */}
          <div className="w-48 h-48 flex-shrink-0 overflow-hidden rounded-lg">
            {restaurant.image_url ? (
              <img
                src={restaurant.image_url}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-7xl">
                🍽️
              </div>
            )}
          </div>

          {/* Restaurant info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              {restaurant.name}
            </h1>

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="inline-block bg-blue-100 text-white px-4 py-2 rounded-full text-sm font-bold">
                  {restaurant.cuisine_type}
                </span>
                <div className="flex items-center bg-yellow-50 px-4 py-2 rounded-lg">
                  <span className="text-yellow-500 text-xl">⭐</span>
                  <span className="ml-2 font-bold text-gray-800">{restaurant.rating}</span>
                </div>
              </div>

              <p className="text-gray-600 text-lg">{restaurant.description}</p>

              <div className="flex flex-col gap-2 text-gray-600">
                <p className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{restaurant.address}</span>
                </p>
                {restaurant.telephone && (
                  <p className="flex items-center gap-2">
                    <span>📞</span>
                    <span>{restaurant.telephone}</span>
                  </p>
                )}
                {restaurant.delivery_time && (
                  <p className="flex items-center gap-2">
                    <span>🕒</span>
                    <span>{restaurant.delivery_time}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Menu</h2>

        {menuItems.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No menu items available</p>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedMenuItems).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-2xl font-semibold text-gray-700 mb-4 capitalize">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-semibold text-gray-800">
                          {item.name}
                        </h4>
                        <span className="text-lg font-bold text-green-600">
                          ${item.price}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {item.description}
                        </p>
                      )}
                      <button className="bg-blue-100 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default RestaurantDetail
