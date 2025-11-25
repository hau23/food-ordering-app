import { createContext, useContext, useState } from 'react'
import { supabase } from '../lib/supabase'

const OrderContext = createContext()

const USER_ID = 1 // Temporary user ID (same as in CartContext)

export function OrderProvider({ children }) {
  const [loading, setLoading] = useState(false)

  const createOrder = async (orderId, orderData) => {
    try {
      setLoading(true)

      const estimatedDelivery = new Date(Date.now() + 2400000).toISOString() // 40 mins from now

      // Insert order into database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          user_id: USER_ID,
          restaurant_id: orderData.restaurant_id || null,
          restaurant_name: orderData.restaurant?.name || null,
          restaurant_phone: orderData.restaurant?.phone || null,
          restaurant_address: orderData.restaurant?.address || null,
          customer_name: orderData.customerName,
          customer_email: orderData.customerEmail,
          customer_phone: orderData.customerPhone,
          delivery_address: orderData.deliveryAddress,
          delivery_notes: orderData.deliveryNotes || null,
          status: 'pending',
          subtotal: orderData.subtotal,
          delivery_fee: orderData.deliveryFee || 5,
          total: orderData.total,
          payment_method: orderData.paymentMethod,
          estimated_delivery: estimatedDelivery
        })
        .select()
        .single()

      if (orderError) {
        console.error('Error creating order:', orderError)
        return { success: false, error: orderError.message }
      }

      // Insert order items
      if (orderData.items && orderData.items.length > 0) {
        const orderItems = orderData.items.map(item => ({
          order_id: orderId,
          menu_item_id: item.menu_item_id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image_url: item.image_url || null
        }))

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)

        if (itemsError) {
          console.error('Error creating order items:', itemsError)
          // Order was created but items failed - this is still considered success
        }
      }

      return { success: true, order }
    } catch (error) {
      console.error('Error creating order:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const getOrder = async (orderId) => {
    try {
      // Fetch order with items
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (orderError || !order) {
        console.error('Error fetching order:', orderError)
        return null
      }

      // Fetch order items
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)

      if (itemsError) {
        console.error('Error fetching order items:', itemsError)
      }

      // Format to match expected structure
      return {
        id: order.id,
        status: order.status,
        restaurant: {
          name: order.restaurant_name,
          phone: order.restaurant_phone,
          address: order.restaurant_address
        },
        items: items || [],
        deliveryAddress: order.delivery_address,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        customerEmail: order.customer_email,
        deliveryNotes: order.delivery_notes,
        placedAt: order.placed_at,
        estimatedDelivery: order.estimated_delivery,
        total: parseFloat(order.total),
        subtotal: parseFloat(order.subtotal),
        deliveryFee: parseFloat(order.delivery_fee),
        paymentMethod: order.payment_method,
        cancelledAt: order.cancelled_at,
        cancellationReason: order.cancellation_reason
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      return null
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true)

      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('user_id', USER_ID)

      if (error) {
        console.error('Error updating order status:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating order status:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const cancelOrder = async (orderId, reason = null) => {
    try {
      setLoading(true)

      const { error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('user_id', USER_ID)
        // Only allow cancellation for pending and confirmed orders
        .in('status', ['pending', 'confirmed'])

      if (error) {
        console.error('Error cancelling order:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error cancelling order:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const getAllOrders = async () => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', USER_ID)
        .order('placed_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        return []
      }

      return orders || []
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  }

  return (
    <OrderContext.Provider value={{
      createOrder,
      getOrder,
      updateOrderStatus,
      cancelOrder,
      getAllOrders,
      loading
    }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrder() {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider')
  }
  return context
}
