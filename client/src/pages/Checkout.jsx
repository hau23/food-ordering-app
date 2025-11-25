import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useOrder } from '../context/OrderContext'
import { useLocation } from '../context/LocationContext'
import { supabase } from '../lib/supabase'

function Checkout() {
  const navigate = useNavigate()
  const { cart, clearCart } = useCart()
  const { createOrder } = useOrder()
  const { location } = useLocation()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'cash',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    deliveryNotes: ''
  })

  const [errors, setErrors] = useState({})
  const [restaurantData, setRestaurantData] = useState(null)

  // Fetch restaurant data
  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (cart.restaurant_id) {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', cart.restaurant_id)
          .single()

        if (error) {
          console.error('Error fetching restaurant:', error)
        } else {
          setRestaurantData(data)
        }
      }
    }

    fetchRestaurantData()
  }, [cart.restaurant_id])

  // Auto-fill address from location context
  useEffect(() => {
    if (location && !formData.address && !formData.city) {
      setFormData(prev => ({
        ...prev,
        address: location.street || '',
        city: location.district || location.city || ''
      }))
    }
  }, [location, formData.address, formData.city])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.address.trim()) newErrors.address = 'Delivery address is required'
    if (!formData.city.trim()) newErrors.city = 'District is required'

    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required'
      if (!formData.cardExpiry.trim()) newErrors.cardExpiry = 'Expiry date is required'
      if (!formData.cardCVV.trim()) newErrors.cardCVV = 'CVV is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Generate a random order ID
    const orderId = Math.random().toString(36).substring(2, 9).toUpperCase()

    // Create order with all checkout data
    const orderData = {
      restaurant_id: cart.restaurant_id,
      restaurant: {
        name: cart.restaurant_name || 'Restaurant',
        phone: restaurantData?.telephone || 'N/A',
        address: restaurantData?.address || 'N/A'
      },
      items: cart.items.map(item => ({
        menu_item_id: item.cart_item_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image_url: item.image_url
      })),
      deliveryAddress: `${formData.address}, ${formData.city}`,
      customerName: formData.fullName,
      customerPhone: formData.phone,
      customerEmail: formData.email,
      deliveryNotes: formData.deliveryNotes,
      total: parseFloat(cart.total || 0) + 5, // Add delivery fee
      subtotal: parseFloat(cart.total || 0),
      deliveryFee: 5,
      paymentMethod: formData.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Credit/Debit Card'
    }

    // Save order to Supabase
    const result = await createOrder(orderId, orderData)

    if (result.success) {
      // Clear cart and navigate to tracking page
      await clearCart()
      navigate(`/track-order/${orderId}`)
    } else {
      // Show error message
      alert('Failed to create order. Please try again.')
      console.error('Order creation failed:', result.error)
    }
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
          <div className="text-5xl sm:text-6xl mb-4">🛒</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items before checking out</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r bg-blue-100 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purpe-700 transition-all"
          >
            Browse Restaurants
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-white flex items-center gap-2 transition-colors text-sm sm:text-base"
        >
          ← Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Order Summary - appears first on mobile, second on desktop */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:sticky lg:top-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Order Summary</h2>

            {cart.restaurant_name && (
              <div className="bg-gradient-to-r from-white to-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
                <p className="text-sm text-gray-600">Ordering from</p>
                <p className="font-bold text-gray-800">{cart.restaurant_name}</p>
              </div>
            )}

            <div className="space-y-2 sm:space-y-3 mb-4 max-h-64 overflow-y-auto">
              {cart.items.map((item) => (
                <div key={item.cart_item_id} className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{item.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm sm:text-base whitespace-nowrap">${item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-3 sm:pt-4 space-y-2 text-sm sm:text-base">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${cart.total?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>$5.00</span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-bold text-gray-800 pt-2 border-t">
                <span>Total</span>
                <span>${(parseFloat(cart.total || 0) + 5).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form - appears second on mobile, first on desktop */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Checkout</h1>

            <form onSubmit={handleSubmit}>
              {/* Contact Information */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${errors.fullName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="John Doe"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="(+852) 1234 5678"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Delivery Address</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${errors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="123 Main Street, Apt 4B"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Notes (Optional)
                    </label>
                    <textarea
                      name="deliveryNotes"
                      value={formData.deliveryNotes}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="Leave at door, Ring doorbell, etc."
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Method</h2>
                <div className="space-y-3 mb-4">
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.paymentMethod === 'cash'
                    ? 'border-blue-400 bg-blue-400 text-white'
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 flex-shrink-0"
                    />
                    <span className={`ml-3 font-medium ${formData.paymentMethod === 'cash' ? 'text-white' : 'text-gray-800'
                      }`}>Cash on Delivery</span>
                  </label>

                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.paymentMethod === 'card'
                    ? 'border-blue-400 bg-blue-400 text-white'
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 flex-shrink-0"
                    />
                    <span className={`ml-3 font-medium ${formData.paymentMethod === 'card' ? 'text-white' : 'text-gray-800'
                      }`}>Credit/Debit Card</span>
                  </label>
                </div>

                {formData.paymentMethod === 'card' && (
                  <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="1234 5678 9012 3456"
                      />
                      {errors.cardNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          name="cardExpiry"
                          value={formData.cardExpiry}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${errors.cardExpiry ? 'border-red-500' : 'border-gray-300'
                            }`}
                          placeholder="MM/YY"
                        />
                        {errors.cardExpiry && (
                          <p className="text-red-500 text-sm mt-1">{errors.cardExpiry}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          name="cardCVV"
                          value={formData.cardCVV}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${errors.cardCVV ? 'border-red-500' : 'border-gray-300'
                            }`}
                          placeholder="123"
                        />
                        {errors.cardCVV && (
                          <p className="text-red-500 text-sm mt-1">{errors.cardCVV}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-100 text-white py-4 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Place Order
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Checkout
