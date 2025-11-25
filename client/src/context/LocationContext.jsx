import { createContext, useContext, useState } from 'react'

const LocationContext = createContext()

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(() => {
    // Load from localStorage on initial load
    const saved = localStorage.getItem('userLocation')
    return saved ? JSON.parse(saved) : null
  })
  const [loadingLocation, setLoadingLocation] = useState(false)

  const getCurrentLocation = () => {
    console.log('getCurrentLocation called from context')

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setLoadingLocation(true)
    console.log('Requesting geolocation...')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        console.log('Got position:', latitude, longitude)

        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          console.log('Fetching address from:', url)

          const response = await fetch(url, {
            headers: {
              'User-Agent': 'FoodOrderingApp/1.0'
            }
          })
          const data = await response.json()
          console.log('Reverse geocoding response:', data)

          if (data && data.address) {
            const address = data.address
            const street = address.road || address.street || ''
            const houseNumber = address.house_number || ''
            const district = address.suburb || address.district || address.city_district || ''
            const city = address.city || address.town || address.village || ''

            const locationData = {
              fullAddress: data.display_name,
              street: `${houseNumber} ${street}`.trim(),
              district: district,
              city: city,
              latitude,
              longitude
            }

            console.log('Setting location:', locationData)
            setLocation(locationData)
            localStorage.setItem('userLocation', JSON.stringify(locationData))
          } else {
            console.log('No address data received')
            alert('Could not get address from location. Please try again.')
          }
        } catch (error) {
          console.error('Error getting address:', error)
          alert('Could not get address from location. Please try again.')
        } finally {
          setLoadingLocation(false)
        }
      },
      (error) => {
        setLoadingLocation(false)
        console.error('Geolocation error:', error)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('Location permission denied. Please enable location access in your browser settings.')
            break
          case error.POSITION_UNAVAILABLE:
            alert('Location information unavailable. Please try again.')
            break
          case error.TIMEOUT:
            alert('Location request timed out. Please try again.')
            break
          default:
            alert('An error occurred while getting your location. Please try again.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const clearLocation = () => {
    setLocation(null)
    localStorage.removeItem('userLocation')
  }

  return (
    <LocationContext.Provider value={{ location, loadingLocation, getCurrentLocation, clearLocation }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}
