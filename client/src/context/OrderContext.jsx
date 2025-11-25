import { createContext, useContext, useState } from 'react'

const OrderContext = createContext()

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    // Load orders from localStorage on initial load
    const savedOrders = localStorage.getItem('orders')
    return savedOrders ? JSON.parse(savedOrders) : {}
  })

  const createOrder = (orderId, orderData) => {
    const newOrder = {
      id: orderId,
      ...orderData,
      placedAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 2400000).toISOString(), // 40 mins from now
      status: 'pending' // pending, confirmed, preparing, out_for_delivery, delivered
    }

    const updatedOrders = {
      ...orders,
      [orderId]: newOrder
    }

    setOrders(updatedOrders)
    // Save to localStorage
    localStorage.setItem('orders', JSON.stringify(updatedOrders))

    return newOrder
  }

  const getOrder = (orderId) => {
    return orders[orderId] || null
  }

  const updateOrderStatus = (orderId, newStatus) => {
    if (orders[orderId]) {
      const updatedOrders = {
        ...orders,
        [orderId]: {
          ...orders[orderId],
          status: newStatus
        }
      }
      setOrders(updatedOrders)
      localStorage.setItem('orders', JSON.stringify(updatedOrders))
    }
  }

  return (
    <OrderContext.Provider value={{ createOrder, getOrder, updateOrderStatus }}>
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
