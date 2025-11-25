import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'

function RestaurantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addingToCart, setAddingToCart] = useState(null)
  const [quantities, setQuantities] = useState({})

  useEffect(() => {
    fetchRestaurantDetails()
  }, [id])

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true)

      // Fetch restaurant details
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single()

      if (restaurantError) {
        setError('Failed to load restaurant details: ' + restaurantError.message)
        console.error('Error fetching restaurant:', restaurantError)
        return
      }

      setRestaurant(restaurantData)

      // Fetch menu items
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', id)
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (menuError) {
        console.error('Error fetching menu items:', menuError)
      } else {
        setMenuItems(menuData || [])
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message)
      console.error('Error fetching restaurant details:', err)
    } finally {
      setLoading(false)
    }
  }

  const getQuantity = (itemId) => {
    return quantities[itemId] || 1
  }

  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) return
    setQuantities(prev => ({
      ...prev,
      [itemId]: quantity
    }))
  }

  const handleAddToCart = async (item) => {
    setAddingToCart(item.id)
    const quantity = getQuantity(item.id)

    // Add item with specified quantity
    for (let i = 0; i < quantity; i++) {
      await addToCart(item, restaurant.id)
    }

    // Reset quantity back to 1
    setQuantities(prev => ({
      ...prev,
      [item.id]: 1
    }))

    setTimeout(() => setAddingToCart(null), 500)
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <p className="text-gray-800 text-center text-lg sm:text-xl">Loading...</p>
      </main>
    )
  }

  if (error || !restaurant) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Restaurant not found'}
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-800 text-sm sm:text-base"
        >
          ← Back to restaurants
        </button>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="text-white hover:text-blue-200 mb-4 sm:mb-6 flex items-center gap-2 text-sm sm:text-base"
      >
        ← Back to restaurants
      </button>

      {/* Restaurant header */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {/* Restaurant image */}
          <div className="w-full sm:w-32 h-32 sm:h-32 md:w-48 md:h-48 flex-shrink-0 overflow-hidden rounded-lg mx-auto sm:mx-0">
            {restaurant.image_url ? (
              <img
                src={restaurant.image_url}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-5xl sm:text-6xl md:text-7xl">
                🍽️
              </div>
            )}
          </div>

          {/* Restaurant info */}
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 text-center sm:text-left">
              {restaurant.name}
            </h1>

            <div className="space-y-3">
              <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-4 flex-wrap">
                <span className="inline-block bg-blue-100 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold">
                  {restaurant.cuisine_type}
                </span>
                <div className="flex items-center bg-yellow-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
                  <span className="text-yellow-500 text-lg sm:text-xl">⭐</span>
                  <span className="ml-2 font-bold text-gray-800 text-sm sm:text-base">{restaurant.rating}</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm sm:text-base md:text-lg text-center sm:text-left">{restaurant.description}</p>

              <div className="flex flex-col gap-2 text-gray-600 text-sm sm:text-base">
                <p className="flex items-center justify-center sm:justify-start gap-2">
                  <span>📍</span>
                  <span className="text-center sm:text-left">{restaurant.address}</span>
                </p>
                {restaurant.telephone && (
                  <p className="flex items-center justify-center sm:justify-start gap-2">
                    <span>📞</span>
                    <span>{restaurant.telephone}</span>
                  </p>
                )}
                {restaurant.delivery_time && (
                  <p className="flex items-center justify-center sm:justify-start gap-2">
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
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Menu</h2>

        {menuItems.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No menu items available</p>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {Object.entries(groupedMenuItems).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3 sm:mb-4 capitalize">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="flex">
                        {/* Menu item image */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl sm:text-3xl">
                              🍴
                            </div>
                          )}
                        </div>

                        {/* Menu item info */}
                        <div className="flex-1 p-3 sm:p-4">
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <h4 className="text-base sm:text-lg font-semibold text-gray-800 flex-1">
                              {item.name}
                            </h4>
                            <span className="text-base sm:text-lg font-bold text-green-600 whitespace-nowrap">
                              ${item.price}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                              {item.description}
                            </p>
                          )}

                          {/* Quantity controls */}
                          <div className="flex items-center gap-2 sm:gap-3 mb-3 flex-wrap">
                            <span className="text-xs sm:text-sm text-gray-600">Qty:</span>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, getQuantity(item.id) - 1)}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-bold"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={getQuantity(item.id)}
                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                className="w-12 sm:w-16 text-center border border-gray-300 rounded px-1 sm:px-2 py-1 text-xs sm:text-sm font-semibold text-black"
                              />
                              <button
                                onClick={() => updateQuantity(item.id, getQuantity(item.id) + 1)}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Add to cart button */}
                          <button
                            onClick={() => handleAddToCart(item)}
                            disabled={addingToCart === item.id}
                            className="bg-blue-100 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50 w-full"
                          >
                            {addingToCart === item.id ? 'Adding...' : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
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
