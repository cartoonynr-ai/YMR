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
  paymentMethod?: string
  cancelReason?: string
  date: string
  paidDate?: string
}

const KEYS = {
  ORDERS: 'ymr_orders_v11',
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
  { 
    id: '#ORD-9022', 
    channel: 'LINE', 
    customerName: 'Somsri Jai-dee', 
    customerPhone: '081-999-8888', 
    address: '{"houseNumber":"12/3","street":"สุขุมวิท","subDistrict":"คลองเตย","district":"คลองเตย","province":"กรุงเทพมหานคร","zipcode":"10110"}', 
    items: [{ sku: 'YAM-LUBE-BLUE', name: 'Yamalube Blue Core', price: 170, qty: 2 }], 
    total: 340, 
    status: 'Cancelled', 
    paymentMethod: 'CASH ON DELIVERY', 
    cancelReason: 'ลูกค้าเปลี่ยนใจ ต้องการยกเลิกสินค้า',
    date: '2026-08-27 10:15' 
  },
  { 
    id: '#ORD-9021', 
    channel: 'LINE', 
    customerName: 'Somchai Kittipong', 
    customerPhone: '0812345678', 
    address: '{"houseNumber":"9/9 หมู่9","street":"ก้าวหน้า","subDistrict":"ขามใหญ่","district":"เมืองอุบลราชธานี","province":"อุบลราชธานี","zipcode":"34000"}', 
    items: [{ sku: 'PIR-DR4-180', name: 'Pirelli Diablo Rosso IV 180/55 ZR17', price: 5900, qty: 1 }], 
    total: 5900, 
    status: 'Awaiting payment', 
    paymentMethod: 'CASH ON DELIVERY', 
    date: '2026-08-26 13:42' 
  },
  { 
    id: '#ORD-9020', 
    channel: 'FB', 
    customerName: 'Nattapon Wongsa', 
    customerPhone: '089-556-1140', 
    address: '{"houseNumber":"55/2","street":"พหลโยธิน","subDistrict":"สามเสนใน","district":"พญาไท","province":"กรุงเทพมหานคร","zipcode":"10400"}', 
    items: [{ sku: 'IRC-IZS-120', name: 'IRC IZ-S Super Sport S99 120/70-17', price: 1690, qty: 1 }, { sku: 'NGK-CR8E', name: 'NGK Spark Plug CR8E', price: 300, qty: 2 }], 
    total: 2290, 
    status: 'Paid', 
    paymentMethod: 'BANK TRANSFER', 
    date: '2026-08-25 11:18', 
    paidDate: '2026-08-25 11:30' 
  },
  { 
    id: '#ORD-9019', 
    channel: 'POS', 
    customerName: 'Walk-in counter', 
    customerPhone: '-', 
    address: '-', 
    items: [{ sku: 'YAM-LUBE-BLUE', name: 'Yamalube Blue Core', price: 170, qty: 4 }], 
    total: 680, 
    status: 'Paid', 
    paymentMethod: 'CASH', 
    date: '2026-08-24 10:55', 
    paidDate: '2026-08-24 10:55' 
  },
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

export const createOrder = (orderData: Omit<Order, 'id' | 'date'>): { success: boolean; orderId?: string; error?: string } => {
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
    const p = products.find(prod => prod.sku === item.sku)!
    updateProduct(p.sku, { ...p, qty: p.qty - item.qty })
  }

  const orders = getOrders()
  const newDate = getFormattedDate()
  const newOrder: Order = {
    ...orderData,
    id: generateOrderId(orders),
    date: newDate,
    paidDate: orderData.status === 'Paid' ? newDate : undefined
  }
  
  saveOrders([newOrder, ...orders])
  return { success: true, orderId: newOrder.id }
}

export const markOrderAsPaid = (orderId: string): { success: boolean, error?: string } => {
  const orders = getOrders()
  const orderIdx = orders.findIndex(o => o.id === orderId)
  
  if (orderIdx === -1) {
    return { success: false, error: 'Order not found' }
  }

  if (orders[orderIdx].status === 'Paid') {
    return { success: false, error: 'Order is already paid' }
  }

  orders[orderIdx] = {
    ...orders[orderIdx],
    status: 'Paid',
    paidDate: getFormattedDate()
  }

  saveOrders(orders)
  return { success: true }
}

export const cancelOrder = (orderId: string, reason: string): { success: boolean, error?: string } => {
  const orders = getOrders()
  const orderIdx = orders.findIndex(o => o.id === orderId)
  
  if (orderIdx === -1) {
    return { success: false, error: 'Order not found' }
  }

  if (orders[orderIdx].status === 'Cancelled') {
    return { success: false, error: 'Order is already cancelled' }
  }

  const order = orders[orderIdx]
  
  // Return stock
  const products = getProducts()
  for (const item of order.items) {
    const p = products.find(prod => prod.sku === item.sku)
    if (p) {
      updateProduct(p.sku, { ...p, qty: p.qty + item.qty })
    }
  }

  orders[orderIdx] = {
    ...order,
    status: 'Cancelled',
    cancelReason: reason
  }

  saveOrders(orders)
  return { success: true }
}
