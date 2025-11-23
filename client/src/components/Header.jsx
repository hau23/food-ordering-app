import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function Header() {
  const { getCartItemCount, setIsCartOpen } = useCart()
  const itemCount = getCartItemCount()

  // Mock user address - can be replaced with actual user data later
  const userAddress = "123 Main Street, Apartment 4B, San Francisco, CA 94102";

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="mx-auto px-6 py-4 bg-gradient-to-r from-white to-blue-100 ">
        <div className="flex items-center justify-between">
          {/* Left side - App name/logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="text-4xl">🐦</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Birdee</h1>
              <p className="text-xs text-gray-500">Food Ordering and Delivery</p>
            </div>
          </Link>

          {/* Right side - User address and cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <span className="text-lg">📍</span>
              <div className="max-w-xs">
                <p className="text-xs text-gray-500 font-medium">Deliver to</p>
                <p className="text-sm text-gray-800 font-semibold truncate">
                  {userAddress}
                </p>
              </div>
              <span className="text-gray-400 ml-2">▼</span>
            </div>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;