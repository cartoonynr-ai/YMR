import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { 
  Type,
  X,
  ChevronDown,
  MapPin,
  Package,
  CreditCard
} from 'lucide-react'
import { getProducts, Product } from '../data/mockInventory'
import { getOrders, createOrder, Order } from '../data/mockOrderData'

export const Route = createFileRoute('/order')({
  beforeLoad: () => {
    const token = localStorage.getItem('token')
    if (!token) {
      throw redirect({ to: '/' })
    }
  },
  component: OrderPage,
})

function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  
  // Form State
  const [channel, setChannel] = useState('LINE')
  const [payment, setPayment] = useState('BANK TRANSFER')
  const [isPaid, setIsPaid] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  
  // Address State
  const [useSameAddress, setUseSameAddress] = useState(true)
  const [addressLine1, setAddressLine1] = useState('9/9 หมู่9')
  const [street, setStreet] = useState('ก้าวหน้า')
  const [subDistrict, setSubDistrict] = useState('ขามใหญ่')
  const [district, setDistrict] = useState('เมืองอุบลราชธานี')
  const [province, setProvince] = useState('อุบลราชธานี')
  const [zipcode, setZipcode] = useState('34000')

  // Items State
  const [orderItems, setOrderItems] = useState<{sku: string, qty: number}[]>([])
  const [selectedSku, setSelectedSku] = useState('')
  const [itemQty, setItemQty] = useState(1)
  
  const loadData = () => {
    setOrders(getOrders())
    const invProducts = getProducts()
    setProducts(invProducts)
    if (invProducts.length > 0 && !selectedSku) {
      const firstAvailable = invProducts.find(p => p.qty > 0)
      if (firstAvailable) setSelectedSku(firstAvailable.sku)
    }
  }

  useEffect(() => {
    loadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddItem = () => {
    if (!selectedSku) return
    const product = products.find(p => p.sku === selectedSku)
    if (!product) return
    if (itemQty < 1 || itemQty > product.qty) {
      alert('จำนวนสินค้าไม่ถูกต้อง หรือเกินกว่าที่มีในสต๊อก')
      return
    }
    
    setOrderItems(prev => {
      const existing = prev.find(i => i.sku === selectedSku)
      if (existing) {
        return prev.map(i => i.sku === selectedSku ? { ...i, qty: i.qty + itemQty } : i)
      }
      return [...prev, { sku: selectedSku, qty: itemQty }]
    })
    setItemQty(1)
  }

  const handleRemoveItem = (skuToRemove: string) => {
    setOrderItems(prev => prev.filter(i => i.sku !== skuToRemove))
  }

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      const p = products.find(prod => prod.sku === item.sku)
      return sum + (p ? p.price * item.qty : 0)
    }, 0)
  }

  const handleSaveOrder = () => {
    if (orderItems.length === 0) {
      alert('กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ')
      return
    }
    if (channel !== 'STOREFRONT' && (!customerName || !customerPhone)) {
      alert('กรุณากรอกชื่อและเบอร์โทรศัพท์ผู้รับ สำหรับช่องทางออนไลน์')
      return
    }

    const fullAddress = useSameAddress 
      ? 'ใช้ที่อยู่เดียวกับทะเบียนบ้าน'
      : `${addressLine1} ถนน${street} ต.${subDistrict} อ.${district} จ.${province} ${zipcode}`

    const items = orderItems.map(item => {
      const p = products.find(prod => prod.sku === item.sku)!
      return {
        sku: item.sku,
        name: p.name,
        price: p.price,
        qty: item.qty
      }
    })

    const newOrderData = {
      channel,
      customerName: customerName || 'Walk-in',
      customerPhone: customerPhone || '-',
      address: channel === 'STOREFRONT' ? '-' : fullAddress,
      items,
      total: calculateTotal(),
      status: isPaid ? 'Paid' : (payment === 'CASH ON DEL.' ? 'Awaiting payment' : 'Awaiting payment')
    }

    const result = createOrder(newOrderData)
    if (result.success) {
      alert('บันทึกคำสั่งซื้อเรียบร้อย และตัดสต๊อกสำเร็จ!')
      // reset form
      setOrderItems([])
      setCustomerName('')
      setCustomerPhone('')
      loadData()
    } else {
      alert(result.error)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Awaiting payment': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'Paid': return 'bg-sky-100 text-sky-800 border-sky-200'
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'Cancelled': return 'bg-rose-100 text-rose-800 border-rose-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }
  
  const getChannelColor = (ch: string) => {
    switch(ch) {
      case 'LINE': return 'bg-green-500 text-white'
      case 'FACEBOOK': return 'bg-blue-600 text-white'
      case 'STOREFRONT': return 'bg-gray-800 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F3F4F6] text-gray-900 pb-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-white to-transparent opacity-50 pointer-events-none"></div>
        
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 relative z-10">
          
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">Order Records</h1>
              <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]">LIVE</span>
            </div>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-[65%_1fr] gap-6 xl:gap-8 items-start">
            
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-8 transition-transform duration-500 hover:-translate-y-1">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Order history</h2>
                  <p className="text-sm text-gray-500 font-medium mt-1">ประวัติคำสั่งซื้อ</p>
                </div>
                <div className="text-sm font-bold text-gray-400 bg-gray-50 px-4 py-2 rounded-full">
                  {orders.length} records
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="pb-4 pt-2 px-4 text-xs font-black text-gray-400 uppercase tracking-wider">Order</th>
                      <th className="pb-4 pt-2 px-4 text-xs font-black text-gray-400 uppercase tracking-wider">Channel</th>
                      <th className="pb-4 pt-2 px-4 text-xs font-black text-gray-400 uppercase tracking-wider">Customer</th>
                      <th className="pb-4 pt-2 px-4 text-xs font-black text-gray-400 uppercase tracking-wider text-right">Total</th>
                      <th className="pb-4 pt-2 px-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Status</th>
                      <th className="pb-4 pt-2 px-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order) => (
                      <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-gray-900">{order.id}</div>
                          <div className="text-[11px] text-gray-500 font-medium mt-1">{order.date}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-sm ${getChannelColor(order.channel)}`}>
                            {order.channel}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-gray-900">{order.customerName}</div>
                          <div className="text-[11px] text-gray-500 font-medium mt-1">{order.customerPhone}</div>
                        </td>
                        <td className="py-4 px-4 text-right font-black text-gray-900">
                          {formatPrice(order.total)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full border ${getStatusColor(order.status)} whitespace-nowrap`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button className="text-sm font-bold text-gray-400 hover:text-gray-900 underline-offset-4 group-hover:underline transition-all">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-900 to-gray-400"></div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Record new order</h2>
              
              <div className="space-y-8">
                
                <section>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Channel</label>
                  <div className="flex p-1 bg-gray-100 rounded-xl">
                    {['LINE', 'FACEBOOK', 'STOREFRONT'].map(ch => (
                      <button
                        key={ch}
                        onClick={() => setChannel(ch)}
                        className={`flex-1 text-[11px] font-bold py-2.5 rounded-lg transition-all ${channel === ch ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Type className="w-3 h-3" />
                    Recipient Info
                  </label>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Recipient name" 
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent px-4 py-3 outline-none transition-all placeholder:text-gray-400 font-medium"
                    />
                    <input 
                      type="tel" 
                      placeholder="Phone number" 
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent px-4 py-3 outline-none transition-all placeholder:text-gray-400 font-medium"
                    />
                  </div>
                </section>

                {channel !== 'STOREFRONT' && (
                  <section>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        ที่อยู่จัดส่ง (1)
                      </label>
                      <button className="text-xs font-bold text-gray-900 hover:underline">+ เพิ่มที่อยู่</button>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border-4 border-gray-900 bg-white"></div>
                          <span className="text-sm font-bold text-gray-900">ที่อยู่ 1</span>
                          <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-sm font-bold">ใช้จัดส่ง</span>
                        </div>
                      </div>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={useSameAddress}
                          onChange={e => setUseSameAddress(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900" 
                        />
                        <span className="text-xs font-medium text-gray-600">ใช้ที่อยู่เดียวกับทะเบียนบ้าน</span>
                      </label>

                      {!useSameAddress && (
                        <div className="grid grid-cols-3 gap-3 mt-3">
                          <input type="text" placeholder="บ้านเลขที่" value={addressLine1} onChange={e => setAddressLine1(e.target.value)} className="col-span-1 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-gray-900 outline-none" />
                          <input type="text" placeholder="ถนน" value={street} onChange={e => setStreet(e.target.value)} className="col-span-1 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-gray-900 outline-none" />
                          <input type="text" placeholder="ตำบล" value={subDistrict} onChange={e => setSubDistrict(e.target.value)} className="col-span-1 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-gray-900 outline-none" />
                          <input type="text" placeholder="อำเภอ" value={district} onChange={e => setDistrict(e.target.value)} className="col-span-2 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-gray-900 outline-none" />
                          <input type="text" placeholder="จังหวัด" value={province} onChange={e => setProvince(e.target.value)} className="col-span-2 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-gray-900 outline-none" />
                          <input type="text" placeholder="รหัสไปรษณีย์" value={zipcode} onChange={e => setZipcode(e.target.value)} className="col-span-2 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-gray-900 outline-none" />
                        </div>
                      )}
                    </div>
                  </section>
                )}

                <section>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Package className="w-3 h-3" />
                      รายการสินค้า ({orderItems.length})
                    </label>
                  </div>

                  <div className="space-y-2 mb-4">
                    {orderItems.map(item => {
                      const p = products.find(prod => prod.sku === item.sku)
                      return (
                        <div key={item.sku} className="flex justify-between items-center bg-gray-50 p-2 px-3 rounded-lg border border-gray-100">
                          <div className="text-xs font-bold text-gray-900">{p?.name} <span className="text-gray-500 font-medium ml-2">x{item.qty}</span></div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black">{formatPrice((p?.price || 0) * item.qty)}</span>
                            <button onClick={() => handleRemoveItem(item.sku)} className="text-gray-400 hover:text-rose-500">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex gap-2 items-center mb-4 bg-gray-50 p-2 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex-1 relative">
                      <select 
                        value={selectedSku}
                        onChange={e => setSelectedSku(e.target.value)}
                        className="w-full appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-xs font-medium focus:ring-1 focus:ring-gray-900 outline-none text-gray-900"
                      >
                        {products.map(p => (
                          <option key={p.sku} value={p.sku} disabled={p.qty === 0} className={p.qty === 0 ? "text-gray-400" : ""}>
                            {p.name} — {p.qty} left {p.qty === 0 && '(Out of stock)'}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <input 
                      type="number" 
                      value={itemQty}
                      onChange={e => setItemQty(Number(e.target.value))}
                      min="1" 
                      className="w-14 bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs font-medium text-center focus:ring-1 focus:ring-gray-900 outline-none" 
                    />
                    <button onClick={handleAddItem} className="px-3 py-2 bg-gray-900 text-white hover:bg-gray-700 text-xs font-bold rounded-lg transition-colors whitespace-nowrap">
                      Add
                    </button>
                  </div>

                  <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                    <span className="text-sm font-bold text-gray-500">รวม / Total</span>
                    <span className="text-2xl font-black text-gray-900">{formatPrice(calculateTotal())}</span>
                  </div>
                </section>

                <section className="bg-gray-900 rounded-2xl p-5 text-white relative overflow-hidden group">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
                  
                  <div className="relative z-10">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <CreditCard className="w-3 h-3" />
                      Payment Method
                    </label>
                    
                    <div className="flex p-1 bg-gray-800 rounded-xl mb-5">
                      {['BANK TRANSFER', 'CASH ON DEL.'].map(method => (
                        <button
                          key={method}
                          onClick={() => setPayment(method)}
                          className={`flex-1 text-[10px] font-bold py-2.5 rounded-lg transition-all ${payment === method ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer mb-6 group/check">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          className="peer appearance-none w-5 h-5 rounded-md border-2 border-gray-600 bg-gray-800 checked:bg-sky-500 checked:border-sky-500 focus:outline-none transition-colors cursor-pointer" 
                          checked={isPaid}
                          onChange={(e) => setIsPaid(e.target.checked)}
                        />
                        <div className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-gray-300 group-hover/check:text-white transition-colors">
                        Mark as already paid (Status: <span className="font-bold text-sky-400">Paid</span>)
                      </span>
                    </label>

                    <button onClick={handleSaveOrder} className="w-full bg-white hover:bg-gray-100 text-gray-900 font-black text-sm py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2">
                      <Package className="w-4 h-4" />
                      SAVE ORDER & DEDUCT STOCK
                    </button>
                  </div>
                </section>

              </div>
            </div>

          </div>
        </div>


      </div>
    </AppLayout>
  )
}
