import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total: 0, restaurant_name: null })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const USER_ID = 1 // Temporary user ID

  // Fetch cart on mount
  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      // Fetch cart items with menu item details
      const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          menu_items (
            id,
            name,
            price,
            image_url,
            restaurant_id,
            restaurants (
              id,
              name
            )
          )
        `)
        .eq('user_id', USER_ID)

      if (error) {
        console.error('Error fetching cart:', error)
        return
      }

      // Calculate cart data
      if (cartItems && cartItems.length > 0) {
        const items = cartItems.map(item => ({
          cart_item_id: item.id,
          name: item.menu_items.name,
          price: item.menu_items.price,
          image_url: item.menu_items.image_url,
          quantity: item.quantity,
          subtotal: item.menu_items.price * item.quantity,
        }))

        const total = items.reduce((sum, item) => sum + item.subtotal, 0)
        const restaurant_name = cartItems[0]?.menu_items?.restaurants?.name || null

        setCart({
          items,
          total,
          restaurant_name,
        })
      } else {
        setCart({ items: [], total: 0, restaurant_name: null })
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    }
  }

  const addToCart = async (menuItem, restaurantId, quantity = 1) => {
    try {
      setLoading(true)

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', USER_ID)
        .eq('menu_item_id', menuItem.id)
        .single()

      if (existingItem) {
        // Update quantity if item exists
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id)

        if (error) {
          console.error('Error updating cart item:', error)
          return { success: false, message: 'Failed to add item to cart' }
        }
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: USER_ID,
            menu_item_id: menuItem.id,
            quantity: quantity,
          })

        if (error) {
          console.error('Error adding to cart:', error)
          return { success: false, message: 'Failed to add item to cart' }
        }
      }

      await fetchCart()
      setIsCartOpen(true)
      return { success: true, message: 'Item added to cart!' }
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

      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        await removeFromCart(cartItemId)
        return
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId)
        .eq('user_id', USER_ID)

      if (error) {
        console.error('Error updating quantity:', error)
      } else {
        await fetchCart()
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

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', USER_ID)

      if (error) {
        console.error('Error removing from cart:', error)
      } else {
        await fetchCart()
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

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', USER_ID)

      if (error) {
        console.error('Error clearing cart:', error)
      } else {
        await fetchCart()
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
