import { supabase } from '../lib/supabase'

export interface OrderItem {
  id?: string
  sku: string
  name: string
  price: number
  qty: number
  product_id?: string
}

export interface Order {
  id: string
  order_number?: string
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
  customer_id?: string
}

export const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers (name, phone),
      customer_addresses (house_number, street, sub_district, district, province, zipcode),
      order_items (
        id,
        qty,
        unit_price,
        products (sku, name)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data.map((o: any) => {
    let addressStr = '-'
    if (o.customer_addresses) {
      addressStr = JSON.stringify(o.customer_addresses)
    }

    return {
      id: o.id,
      order_number: o.order_number,
      channel: o.channel,
      customerName: o.customers?.name || 'Walk-in counter',
      customerPhone: o.customers?.phone || '-',
      address: addressStr,
      total: o.total,
      status: o.status,
      paymentMethod: o.payment_method || undefined,
      cancelReason: o.cancel_reason || undefined,
      date: new Date(o.created_at).toLocaleString('th-TH'),
      paidDate: o.paid_at ? new Date(o.paid_at).toLocaleString('th-TH') : undefined,
      items: o.order_items.map((i: any) => ({
        id: i.id,
        qty: i.qty,
        price: i.unit_price,
        sku: i.products?.sku || '-',
        name: i.products?.name || '-'
      }))
    }
  })
}

export const createOrder = async (orderData: Omit<Order, 'id' | 'date'>): Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }> => {
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user?.id

  // Start transaction logic via Supabase RPC or do it sequentially
  try {
    // 1. Generate Order Number (OR-ddmmyy-XXXX) based on Thai Timezone
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    const parts = formatter.formatToParts(now)
    const day = parts.find(p => p.type === 'day')?.value || '01'
    const month = parts.find(p => p.type === 'month')?.value || '01'
    const yearFull = parts.find(p => p.type === 'year')?.value || '2024'
    const year = yearFull.slice(-2)
    const ddmmyy = `${day}${month}${year}`

    const startOfDayStr = `${yearFull}-${month}-${day}T00:00:00+07:00`

    const { data: latestOrders, error: latestError } = await supabase
      .from('orders')
      .select('order_number')
      .gte('created_at', startOfDayStr)
      .like('order_number', `OR-${ddmmyy}-%`)
      .order('created_at', { ascending: false })
      .limit(1)

    if (latestError) throw latestError

    let nextNumber = 1
    if (latestOrders && latestOrders.length > 0) {
      const lastOrderNumber = latestOrders[0].order_number
      const splits = lastOrderNumber.split('-')
      if (splits.length === 3) {
        nextNumber = parseInt(splits[2], 10) + 1
      }
    }

    const runningNumberStr = nextNumber.toString().padStart(4, '0')
    const orderNumber = `OR-${ddmmyy}-${runningNumberStr}`

    // 2. Create customer if not Walk-in or use existing (simplify for now, just insert Walk-in)
    // Actually, let's insert a dummy customer for simplicity as per old mock
    const { data: customer } = await supabase.from('customers').insert({
      name: orderData.customerName,
      phone: orderData.customerPhone !== '-' ? orderData.customerPhone : null
    }).select().single()

    // 3. Create Order
    const { data: order, error: orderError } = await supabase.from('orders').insert({
      order_number: orderNumber,
      channel: orderData.channel,
      customer_id: customer?.id,
      total: orderData.total,
      status: orderData.status,
      payment_method: orderData.paymentMethod,
      created_by: userId,
      paid_at: orderData.status === 'Paid' ? new Date().toISOString() : null
    }).select().single()

    if (orderError) throw orderError

    // 4. Create Order Items and update stock
    for (const item of orderData.items) {
      // Get product
      const { data: p } = await supabase.from('products').select('*').eq('sku', item.sku).single()
      if (!p) throw new Error(`ไม่พบสินค้า SKU: ${item.sku}`)
      if (p.qty < item.qty) throw new Error(`สินค้า ${p.name} มีสต็อกไม่เพียงพอ (เหลือ ${p.qty})`)

      // Insert Order Item
      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: p.id,
        qty: item.qty,
        unit_price: item.price
      })

      // Update product stock
      await supabase.from('products').update({ qty: p.qty - item.qty }).eq('id', p.id)

      // Log movement
      await supabase.from('stock_movements').insert({
        product_id: p.id,
        change: -item.qty,
        balance: p.qty - item.qty,
        reason: `Sold via ${orderData.channel} (${orderNumber})`,
        created_by: userId
      })
    }

    return { success: true, orderId: order.id, orderNumber: order.order_number }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export const markOrderAsPaid = async (orderId: string): Promise<{ success: boolean, error?: string }> => {
  const { error } = await supabase.from('orders').update({
    status: 'Paid',
    paid_at: new Date().toISOString()
  }).eq('id', orderId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export const cancelOrder = async (orderId: string, reason: string): Promise<{ success: boolean, error?: string }> => {
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user?.id

  // Get order items
  const { data: items } = await supabase.from('order_items').select('*, products(*)').eq('order_id', orderId)
  
  if (items) {
    for (const item of items) {
      const p = item.products
      if (p) {
        // Return stock
        await supabase.from('products').update({ qty: p.qty + item.qty }).eq('id', p.id)
        
        // Log movement
        await supabase.from('stock_movements').insert({
          product_id: p.id,
          change: item.qty,
          balance: p.qty + item.qty,
          reason: 'Cancelled Order',
          created_by: userId
        })
      }
    }
  }

  const { error } = await supabase.from('orders').update({
    status: 'Cancelled',
    cancel_reason: reason
  }).eq('id', orderId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
