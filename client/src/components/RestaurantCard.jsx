import { Link } from 'react-router-dom'

function RestaurantCard({ restaurant }) {
  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      className="bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 block cursor-pointer"
    >
      <div className="flex">
        {/* Left side - Restaurant info */}
        <div className="flex-1 p-3 sm:p-4 md:p-6">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
            {restaurant.name}
          </h2>

          <div className="space-y-2 sm:space-y-3">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {/* Cuisine type badge */}
              <div className="flex items-center bg-blue-100 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                {restaurant.cuisine_type}
              </div>
              {/* Rating */}
              <div className="flex justify-center gap-1 sm:gap-2">
                <div className="flex items-center bg-yellow-50 px-2 sm:px-3 py-1 rounded-sm">
                  <span className="text-yellow-500 text-base sm:text-lg">⭐</span>
                  <span className="ml-1 font-bold text-gray-800 text-xs sm:text-sm">{restaurant.rating}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
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
        <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 flex-shrink-0 overflow-hidden">
          {restaurant.image_url ? (
            <img
              src={restaurant.image_url}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-4xl sm:text-5xl md:text-6xl">
              🍽️
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default RestaurantCard;