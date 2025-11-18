import { Link } from 'react-router-dom'

function Header() {
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

          {/* Right side - User address */}
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
        </div>
      </div>
    </header>
  );
}

export default Header;