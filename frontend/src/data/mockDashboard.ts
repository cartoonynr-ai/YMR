export const currentUser = {
  name: 'วรนารี รวงผึ้ง',
  email: 'xxxxx@gmail.com',
}

export interface KpiCardData {
  id: string
  title: string
  value: string
  note?: string
  breakdown?: { label: string; value: number }[]
}

export const kpiCards: KpiCardData[] = [
  {
    id: 'total-sku',
    title: 'Total SKU',
    value: '8',
    note: '+2 added this week',
  },
  {
    id: 'low-stock-alert',
    title: 'Low Stock Alert',
    value: '3',
    note: 'Requires restock',
  },
  {
    id: 'todays-orders',
    title: "Today's Orders",
    value: '3',
    breakdown: [
      { label: 'Pending', value: 1 },
      { label: 'Link', value: 1 },
      { label: 'FB', value: 1 },
      { label: 'POS', value: 1 },
    ],
  },
  {
    id: 'storefront-revenue',
    title: 'Storefront Revenue',
    value: '฿3,490',
    note: 'Today, 2 sales',
  },
]

export type StockStatus = 'Low stock' | 'Out of stock'

export interface StockCriticalItem {
  name: string
  sku: string
  category: string
  qty: number
  threshold: number
  status: StockStatus
}

export const stockCriticality: StockCriticalItem[] = [
  {
    name: 'Pirelli Diablo Rosso IV 180/55 ZR17',
    sku: 'PIR-DR4-180',
    category: 'Tires',
    qty: 3,
    threshold: 10,
    status: 'Low stock',
  },
  {
    name: 'Brembo Sinter Brake Pad Front',
    sku: 'BRB-PAD-782',
    category: 'Brake System',
    qty: 0,
    threshold: 6,
    status: 'Out of stock',
  },
  {
    name: 'IRC Sandah-Z 2.25-17',
    sku: 'IRC-SNZ-225',
    category: 'Tires',
    qty: 4,
    threshold: 8,
    status: 'Low stock',
  },
]

export type OrderChannel = 'LINE' | 'FB' | 'POS'
export type OrderStatus = 'Awaiting payment' | 'Paid' | 'Completed'

export interface RecentOrder {
  channel: OrderChannel
  orderId: string
  price: string
  customer: string
  status: OrderStatus
}

export const recentOrders: RecentOrder[] = [
  {
    channel: 'LINE',
    orderId: '#ORD-9021',
    price: '฿5,900',
    customer: 'Somchai Kittipong',
    status: 'Awaiting payment',
  },
  {
    channel: 'FB',
    orderId: '#ORD-9020',
    price: '฿2,290',
    customer: 'Nattapon Wongsa',
    status: 'Paid',
  },
  {
    channel: 'POS',
    orderId: '#ORD-9019',
    price: '฿860',
    customer: 'Walk-in counter',
    status: 'Completed',
  },
  {
    channel: 'FB',
    orderId: '#ORD-9018',
    price: '฿4,300',
    customer: 'Praewa Chaiyo',
    status: 'Completed',
  },
]

export interface StockMovement {
  sku: string
  change: number
  reason: string
  timestamp: string
  balance: number
}

export const stockMovements: StockMovement[] = [
  {
    sku: 'PIR-DR4-180',
    change: -1,
    reason: 'Order ORD-9021 recorded',
    timestamp: '2026-08-20 13:42',
    balance: 3,
  },
  {
    sku: 'MTL-7100-1L',
    change: 48,
    reason: 'Goods received — supplier invoice INV-2288',
    timestamp: '2026-08-20 09:10',
    balance: 124,
  },
]
