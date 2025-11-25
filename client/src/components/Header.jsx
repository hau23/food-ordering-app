import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useLocation } from '../context/LocationContext'
import logo from '../assets/logo.png'

function Header() {
  const { getCartItemCount, setIsCartOpen } = useCart()
  const { location, loadingLocation, getCurrentLocation } = useLocation()
  const itemCount = getCartItemCount()

  const displayAddress = location
    ? `${location.street}, ${location.district || location.city}`
    : "Set your location"

  return (
    <header className="bg-blue-500 shadow-md border-b border-blue-100">
      <div className="mx-auto px-10 md:px-6 py-2 md:py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Left side - App name/logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity flex-shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24">
              <img src={logo} alt="Birdee Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-white">Birdee</h1>
              <p className="text-xs text-white hidden sm:block">Food Ordering and Delivery</p>
            </div>
          </Link>

          {/* Right side - User address and cart */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={getCurrentLocation}
              disabled={loadingLocation}
              className="flex items-center gap-1 md:gap-2 bg-gray-600 px-2 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-gray-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loadingLocation ? (
                <>
                  <span className="text-base md:text-lg inline-block animate-spin">⏳</span>
                  <div className="hidden md:block max-w-xs">
                    <p className="text-xs text-white font-medium">Getting location...</p>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-base md:text-lg">📍</span>
                  <div className="max-w-[100px] sm:max-w-[150px] md:max-w-xs">
                    <p className="text-xs text-white font-medium hidden sm:block">Deliver to</p>
                    <p className="text-xs sm:text-sm text-white font-semibold truncate">
                      {displayAddress}
                    </p>
                  </div>
                  <span className="text-white ml-1 hidden md:inline">▼</span>
                </>
              )}
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-gray-600 text-white px-3 py-2 md:px-4 rounded-lg hover:bg-gray-500 transition-all flex items-center gap-2 flex-shrink-0 shadow-md"
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