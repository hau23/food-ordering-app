import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useOrder } from '../context/OrderContext'

function TrackOrder() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { getOrder, cancelOrder, submitOrderFeedback } = useOrder()

  // Get order data from context
  const [order, setOrder] = useState(null)
  const [loadingOrder, setLoadingOrder] = useState(true)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  // Feedback form state
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [feedbackData, setFeedbackData] = useState({
    deliveryCondition: '',
    restaurantRating: 0,
    deliveryRating: 0,
    feedbackComment: ''
  })

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    setLoadingOrder(true)
    const orderData = await getOrder(orderId)
    if (orderData) {
      setOrder(orderData)
    }
    setLoadingOrder(false)
  }

  const handleCancelOrder = async () => {
    setCancelling(true)
    const result = await cancelOrder(orderId)

    if (result.success) {
      // Refresh order data
      await fetchOrder()
      setShowCancelModal(false)
      alert('Order cancelled successfully')
    } else {
      alert('Failed to cancel order. It may have already been prepared or is in transit.')
    }
    setCancelling(false)
  }

  const canCancelOrder = () => {
    return order && ['pending', 'confirmed'].includes(order.status)
  }

  const handleSubmitFeedback = async () => {
    // Validate feedback
    if (!feedbackData.deliveryCondition) {
      alert('Please select the delivery condition')
      return
    }
    if (feedbackData.restaurantRating === 0) {
      alert('Please rate the restaurant')
      return
    }
    if (feedbackData.deliveryRating === 0) {
      alert('Please rate the delivery service')
      return
    }

    setSubmittingFeedback(true)
    const result = await submitOrderFeedback(orderId, feedbackData)

    if (result.success) {
      await fetchOrder()
      setShowFeedbackForm(false)
      alert('Thank you for your feedback!')
    } else {
      alert('Failed to submit feedback. Please try again.')
    }
    setSubmittingFeedback(false)
  }

  const StarRating = ({ rating, onRatingChange, readonly = false }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onRatingChange(star)}
            disabled={readonly}
            className={`text-2xl transition-transform ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            }`}
          >
            {star <= rating ? '⭐' : '☆'}
          </button>
        ))}
      </div>
    )
  }

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: '📝' },
    { key: 'confirmed', label: 'Confirmed', icon: '✅' },
    { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '✨' },
    { key: 'cancelled', label: 'Cancelled', icon: '❌' }
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
              {order.status === 'cancelled' ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <div className="text-5xl mb-3">❌</div>
                  <h3 className="text-xl font-bold text-red-800">Order Cancelled</h3>
                </div>
              ) : (
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200">
                    <div
                      className="h-full bg-blue-400 transition-all duration-500"
                      style={{ width: `${(getCurrentStepIndex() / (statusSteps.length - 2)) * 100}%` }}
                    />
                  </div>

                  {/* Steps - exclude cancelled status from timeline */}
                  <div className="relative flex justify-between">
                    {statusSteps.filter(s => s.key !== 'cancelled').map((step, index) => {
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
              )}
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
                    {order.status === 'cancelled' && 'This order has been cancelled'}
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

            {/* Cancel Order */}
            {canCancelOrder() && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Cancel Order</h3>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg hover:bg-red-700"
                >
                  Cancel This Order
                </button>
              </div>
            )}

            {/* Cancelled Status */}
            {order.status === 'cancelled' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-red-800 mb-2">Order Cancelled</h3>
                  <p className="text-sm text-red-600">
                    This order was cancelled on {formatDate(order.cancelledAt)} at {formatTime(order.cancelledAt)}
                  </p>
                  {order.cancellationReason && (
                    <p className="text-sm text-red-600 mt-2">
                      Reason: {order.cancellationReason}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Delivered - Request Feedback */}
            {order.status === 'delivered' && !order.feedbackSubmittedAt && !showFeedbackForm && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-bold text-green-800 mb-2">🎉 Order Delivered!</h3>
                  <p className="text-sm text-green-700">
                    Your order was delivered on {formatDate(order.deliveredAt)} at {formatTime(order.deliveredAt)}
                  </p>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">How was your order?</h3>
                <button
                  onClick={() => setShowFeedbackForm(true)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg hover:bg-blue-700"
                >
                  Leave Feedback
                </button>
              </div>
            )}

            {/* Feedback Form */}
            {order.status === 'delivered' && showFeedbackForm && !order.feedbackSubmittedAt && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Your Feedback</h3>

                {/* Delivery Condition */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Condition *
                  </label>
                  <div className="space-y-2">
                    <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      feedbackData.deliveryCondition === 'good'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="condition"
                        value="good"
                        checked={feedbackData.deliveryCondition === 'good'}
                        onChange={(e) => setFeedbackData({ ...feedbackData, deliveryCondition: e.target.value })}
                        className="w-4 h-4"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-800">✅ Good - Everything arrived perfectly</span>
                    </label>
                    <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      feedbackData.deliveryCondition === 'unsatisfactory'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="condition"
                        value="unsatisfactory"
                        checked={feedbackData.deliveryCondition === 'unsatisfactory'}
                        onChange={(e) => setFeedbackData({ ...feedbackData, deliveryCondition: e.target.value })}
                        className="w-4 h-4"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-800">❌ Unsatisfactory - Issues with the order</span>
                    </label>
                  </div>
                </div>

                {/* Restaurant Rating */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate the Restaurant *
                  </label>
                  <StarRating
                    rating={feedbackData.restaurantRating}
                    onRatingChange={(rating) => setFeedbackData({ ...feedbackData, restaurantRating: rating })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {feedbackData.restaurantRating === 0 && 'Select a rating'}
                    {feedbackData.restaurantRating === 1 && 'Poor'}
                    {feedbackData.restaurantRating === 2 && 'Fair'}
                    {feedbackData.restaurantRating === 3 && 'Good'}
                    {feedbackData.restaurantRating === 4 && 'Very Good'}
                    {feedbackData.restaurantRating === 5 && 'Excellent'}
                  </p>
                </div>

                {/* Delivery Rating */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate the Delivery Service *
                  </label>
                  <StarRating
                    rating={feedbackData.deliveryRating}
                    onRatingChange={(rating) => setFeedbackData({ ...feedbackData, deliveryRating: rating })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {feedbackData.deliveryRating === 0 && 'Select a rating'}
                    {feedbackData.deliveryRating === 1 && 'Poor'}
                    {feedbackData.deliveryRating === 2 && 'Fair'}
                    {feedbackData.deliveryRating === 3 && 'Good'}
                    {feedbackData.deliveryRating === 4 && 'Very Good'}
                    {feedbackData.deliveryRating === 5 && 'Excellent'}
                  </p>
                </div>

                {/* Comments */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Comments (Optional)
                  </label>
                  <textarea
                    value={feedbackData.feedbackComment}
                    onChange={(e) => setFeedbackData({ ...feedbackData, feedbackComment: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    rows="3"
                    placeholder="Tell us more about your experience..."
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFeedbackForm(false)}
                    disabled={submittingFeedback}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitFeedback}
                    disabled={submittingFeedback}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </div>
            )}

            {/* Feedback Already Submitted */}
            {order.status === 'delivered' && order.feedbackSubmittedAt && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-blue-800 mb-3">Thank You for Your Feedback!</h3>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Delivery Condition</p>
                      <p className="font-semibold text-gray-800">
                        {order.deliveryCondition === 'good' ? '✅ Good' : '❌ Unsatisfactory'}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 mb-1">Restaurant Rating</p>
                      <StarRating rating={order.restaurantRating} readonly={true} />
                    </div>

                    <div>
                      <p className="text-gray-600 mb-1">Delivery Service Rating</p>
                      <StarRating rating={order.deliveryRating} readonly={true} />
                    </div>

                    {order.feedbackComment && (
                      <div>
                        <p className="text-gray-600 mb-1">Your Comments</p>
                        <p className="font-medium text-gray-800 italic">"{order.feedbackComment}"</p>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 pt-2 border-t">
                      Submitted on {formatDate(order.feedbackSubmittedAt)} at {formatTime(order.feedbackSubmittedAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}

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

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Cancel Order?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default TrackOrder
