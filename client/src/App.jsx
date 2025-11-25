import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import RestaurantList from './pages/RestaurantList'
import RestaurantDetail from './pages/RestaurantDetail'
import Checkout from './pages/Checkout'
import TrackOrder from './pages/TrackOrder'
import Cart from './components/Cart'
import { CartProvider } from './context/CartContext'
import { OrderProvider } from './context/OrderContext'
import { LocationProvider } from './context/LocationContext'

function App() {
  return (
    <LocationProvider>
      <OrderProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <Routes>
                <Route path="/" element={<RestaurantList />} />
                <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/track-order/:orderId" element={<TrackOrder />} />
              </Routes>
              <Cart />
            </div>
          </Router>
        </CartProvider>
      </OrderProvider>
    </LocationProvider>
  )
}

export default App
