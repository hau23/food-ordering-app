import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total: 0 })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const API_URL = 'http://localhost:3001/api'
  const USER_ID = 1 // Temporary user ID

  // Fetch cart on mount
  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_URL}/cart?userId=${USER_ID}`)
      const data = await response.json()

      if (data.success) {
        setCart(data.data)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    }
  }

  const addToCart = async (menuItem, restaurantId, quantity = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: USER_ID,
          menuItemId: menuItem.id,
          restaurantId: restaurantId,
          quantity: quantity,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCart(data.data)
        setIsCartOpen(true)
        return { success: true, message: 'Item added to cart!' }
      } else {
        return { success: false, message: data.message || 'Failed to add item to cart' }
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      return { success: false, message: 'Error adding to cart' }
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/cart/${cartItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: USER_ID,
          quantity: quantity,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCart(data.data)
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (cartItemId) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/cart/${cartItemId}?userId=${USER_ID}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setCart(data.data)
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/cart?userId=${USER_ID}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setCart(data.data)
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCartItemCount = () => {
    return cart.items?.reduce((total, item) => total + item.quantity, 0) || 0
  }

  const value = {
    cart,
    loading,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartItemCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
