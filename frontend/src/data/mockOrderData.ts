import { getProducts, updateProduct } from './mockInventory'

export interface OrderItem {
  sku: string
  name: string
  price: number
  qty: number
}

export interface Order {
  id: string
  channel: string
  customerName: string
  customerPhone: string
  address: string
  items: OrderItem[]
  total: number
  status: string
  date: string
}

const KEYS = {
  ORDERS: 'ymr_orders_v3',
}

const getFormattedDate = (): string => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const date = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${date} ${hours}:${minutes}`
}

const initialOrders: Order[] = [
  { id: '#ORD-9021', channel: 'LINE', customerName: 'Somchai Kittipong', customerPhone: '0812345678', address: '{"houseNumber":"9/9 หมู่9","street":"ก้าวหน้า","subDistrict":"ขามใหญ่","district":"เมืองอุบลราชธานี","province":"อุบลราชธานี","zipcode":"34000"}', items: [], total: 5900, status: 'Awaiting payment', date: '2026-08-20 13:42' },
  { id: '#ORD-9020', channel: 'FB', customerName: 'Nattapon Wongsa', customerPhone: '089-556-1140', address: '-', items: [], total: 2290, status: 'Paid', date: '2026-08-20 11:18' },
  { id: '#ORD-9019', channel: 'POS', customerName: 'Walk-in counter', customerPhone: '-', address: '-', items: [], total: 680, status: 'Completed', date: '2026-08-20 10:55' },
]

export const initOrderData = () => {
  if (!localStorage.getItem(KEYS.ORDERS)) {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(initialOrders))
  }
}

export const getOrders = (): Order[] => {
  initOrderData()
  return JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]')
}

export const saveOrders = (orders: Order[]) => {
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders))
}

export const generateOrderId = (orders: Order[]): string => {
  if (orders.length === 0) return '#ORD-9000'
  const maxId = orders.reduce((max, order) => {
    const numStr = order.id.replace('#ORD-', '')
    const num = parseInt(numStr, 10)
    return isNaN(num) ? max : Math.max(max, num)
  }, 9000)
  return `#ORD-${maxId + 1}`
}

export const createOrder = (orderData: Omit<Order, 'id' | 'date'>): { success: boolean; error?: string } => {
  const products = getProducts()
  
  // Verify stock
  for (const item of orderData.items) {
    const product = products.find(p => p.sku === item.sku)
    if (!product) return { success: false, error: `ไม่พบสินค้า SKU: ${item.sku}` }
    if (product.qty < item.qty) {
      return { success: false, error: `สินค้า ${product.name} มีสต็อกไม่เพียงพอ (เหลือ ${product.qty})` }
    }
  }

  // Deduct stock
  for (const item of orderData.items) {
    const product = products.find(p => p.sku === item.sku)!
    const newQty = product.qty - item.qty
    updateProduct(product.sku, { ...product, qty: newQty })
    // logMovement is handled within updateProduct, but we can add order reference in real app
  }

  const orders = getOrders()
  const newOrder: Order = {
    ...orderData,
    id: generateOrderId(orders),
    date: getFormattedDate(),
  }

  orders.unshift(newOrder) // Prepend
  saveOrders(orders)
  return { success: true }
}
