import { Link } from 'react-router-dom'

function RestaurantCard({ restaurant }) {
  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      className="bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 block cursor-pointer"
    >
      <div className="flex">
        {/* Left side - Restaurant info */}
        <div className="flex-1 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            {restaurant.name}
          </h2>

          <div className="space-y-3">
            <div className="flex">
              {/* Cuisine type badge */}
              <div className="flex items-center bg-blue-100 text-white px-3 py-1 rounded-full text-sm font-bold">
                {restaurant.cuisine_type}
              </div>
              {/* Rating */}
              <div className="flex justify-center gap-2">
                <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-sm">
                  <span className="text-yellow-500 text-lg">⭐</span>
                  <span className="ml-1 font-bold text-gray-800 text-sm">{restaurant.rating}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-2">
              {restaurant.description}
            </p>

            {/* Address */}
            <p className="text-xs text-gray-500 flex items-start gap-1">
              <span>📍</span>
              <span className="line-clamp-1">{restaurant.address}</span>
            </p>

            {/* Delivery time */}
            <p className="text-xs text-gray-500">
              📞 {restaurant.delivery_time}
            </p>
          </div>
        </div>

        {/* Right side - Square photo */}
        <div className="w-40 h-40 flex-shrink-0 overflow-hidden">
          {restaurant.image_url ? (
            <img
              src={restaurant.image_url}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-6xl">
              🍽️
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default RestaurantCard;