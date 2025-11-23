import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function Cart() {
  const navigate = useNavigate()
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart, loading } = useCart()

  if (!isCartOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 backdrop-blur-sm bg-white/30 z-40 transition-all"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-white to-blue-100 border-b border-gray-200 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛒</span>
            <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-gray-600 hover:text-gray-800 text-3xl font-light transition-colors"
          >
            ×
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {!cart.items || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-xl">Your cart is empty</p>
              <p className="text-sm mt-2">Add some delicious items to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.restaurant_name && (
                <div className="bg-gradient-to-r from-white to-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
                  <p className="text-sm text-gray-600">Ordering from</p>
                  <p className="font-bold text-gray-800">{cart.restaurant_name}</p>
                </div>
              )}

              {cart.items.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4 relative hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">${item.price.toFixed(2)}</p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                        disabled={loading}
                        className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 disabled:opacity-50 flex items-center justify-center text-lg font-bold text-blue-700 transition-colors"
                      >
                        -
                      </button>
                      <span className="font-semibold text-gray-800 w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                        disabled={loading}
                        className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 disabled:opacity-50 flex items-center justify-center text-lg font-bold text-blue-700 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeFromCart(item.cart_item_id)}
                      disabled={loading}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                    <p className="font-bold text-gray-800">
                      ${item.subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              {cart.items.length > 0 && (
                <button
                  onClick={clearCart}
                  disabled={loading}
                  className="w-full text-red-600 hover:bg-red-50 text-sm font-medium py-2 rounded-lg disabled:opacity-50 transition-colors"
                >
                  Clear Cart
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer / Checkout */}
        {cart.items && cart.items.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-white to-blue-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-800">Total</span>
              <span className="text-2xl font-bold text-gray-800">
                ${cart.total?.toFixed(2) || '0.00'}
              </span>
            </div>
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              onClick={() => {
                setIsCartOpen(false)
                navigate('/checkout')
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default Cart
