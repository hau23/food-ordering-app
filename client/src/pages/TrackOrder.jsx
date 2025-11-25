import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useOrder } from '../context/OrderContext'

function TrackOrder() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { getOrder } = useOrder()

  // Get order data from context
  const [order, setOrder] = useState(null)

  useEffect(() => {
    const orderData = getOrder(orderId)
    if (orderData) {
      setOrder(orderData)
    } else {
      // Order not found, show mock data or redirect
      setOrder({
        id: orderId || '12345',
        status: 'preparing',
        restaurant: {
          name: 'Pizza Palace',
          phone: '(123) 456-7890',
          address: '100 Pizza Street'
        },
        items: [
          { id: 1, name: 'Margherita Pizza', quantity: 2, price: 12.99 },
          { id: 2, name: 'Caesar Salad', quantity: 1, price: 7.99 }
        ],
        deliveryAddress: '123 Main Street, Apartment 4B, San Francisco, CA 94102',
        customerName: 'John Doe',
        customerPhone: '(555) 123-4567',
        placedAt: new Date(Date.now() - 1800000).toISOString(),
        estimatedDelivery: new Date(Date.now() + 1200000).toISOString(),
        total: 38.97,
        paymentMethod: 'Cash on Delivery'
      })
    }
  }, [orderId, getOrder])

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: '📝' },
    { key: 'confirmed', label: 'Confirmed', icon: '✅' },
    { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '✨' }
  ]

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex(step => step.key === order.status)
  }

  const formatTime = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Show loading state while order is being fetched
  if (!order) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading order...</h2>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-white flex items-center gap-2 transition-colors text-sm sm:text-base"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Order Status Card */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
            <div className="border-b border-gray-200 pb-3 sm:pb-4 mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Track Your Order</h1>
              <p className="text-sm sm:text-base text-gray-600">Order ID: #{order.id}</p>
            </div>

            {/* Status Timeline */}
            <div className="mb-8">
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200">
                  <div
                    className="h-full bg-blue-400 transition-all duration-500"
                    style={{ width: `${(getCurrentStepIndex() / (statusSteps.length - 1)) * 100}%` }}
                  />
                </div>

                {/* Steps */}
                <div className="relative flex justify-between">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= getCurrentStepIndex()
                    const isCurrent = index === getCurrentStepIndex()

                    return (
                      <div key={step.key} className="flex flex-col items-center">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 transition-all ${
                            isCompleted
                              ? 'bg-blue-400 shadow-lg'
                              : 'bg-gray-200'
                          } ${isCurrent ? 'ring-4 ring-blue-200 scale-110' : ''}`}
                        >
                          {step.icon}
                        </div>
                        <p className={`text-xs md:text-sm font-medium text-center max-w-[80px] ${
                          isCompleted ? 'text-gray-800' : 'text-gray-400'
                        }`}>
                          {step.label}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Current Status Message */}
            <div className="bg-gradient-to-r from-white to-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">{statusSteps[getCurrentStepIndex()].icon}</span>
                <div>
                  <p className="font-bold text-gray-800 text-base sm:text-lg">
                    {statusSteps[getCurrentStepIndex()].label}
                  </p>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    {order.status === 'preparing' && 'Your food is being prepared with care'}
                    {order.status === 'confirmed' && 'Restaurant has confirmed your order'}
                    {order.status === 'out_for_delivery' && 'Your order is on the way!'}
                    {order.status === 'delivered' && 'Enjoy your meal!'}
                    {order.status === 'pending' && 'We received your order'}
                  </p>
                </div>
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Order Placed</p>
                <p className="font-bold text-gray-800">
                  {formatTime(order.placedAt)} - {formatDate(order.placedAt)}
                </p>
              </div>
              <div className="bg-gradient-to-r from-white to-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Estimated Delivery</p>
                <p className="font-bold text-gray-800">
                  {formatTime(order.estimatedDelivery)} - {formatDate(order.estimatedDelivery)}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Order Items</h2>
            <div className="space-y-2 sm:space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-200 last:border-0 gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{item.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-gray-800 text-sm sm:text-base whitespace-nowrap">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-3 sm:mt-4 pt-3 sm:pt-4 text-sm sm:text-base">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800">${(order.subtotal || order.total - 5).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="text-gray-800">${(order.deliveryFee || 5).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-base sm:text-lg font-bold pt-2 border-t">
                <span className="text-gray-800">Total</span>
                <span className="text-gray-800">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          {/* Restaurant Info */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:sticky lg:top-8">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Restaurant Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Restaurant</p>
                <p className="font-semibold text-gray-800">{order.restaurant.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold text-gray-800">{order.restaurant.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-semibold text-gray-800">{order.restaurant.address}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Delivery Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Deliver to</p>
                  <p className="font-semibold text-gray-800">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-800">{order.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold text-gray-800">{order.deliveryAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold text-gray-800">{order.paymentMethod}</p>
                </div>
              </div>
            </div>

            {/* Need Help */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Need Help?</h3>
              <button className="w-full bg-blue-100 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default TrackOrder
