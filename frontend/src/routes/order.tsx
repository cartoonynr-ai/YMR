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
import { getProducts, type Product } from '../data/mockInventory'
import { searchAddressByZipcode } from 'thai-address-database'
import { getOrders, createOrder, type Order } from '../data/mockOrderData'

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
  interface AddressData {
    id: number;
    houseNumber: string;
    street: string;
    subDistrict: string;
    district: string;
    province: string;
    zipcode: string;
  }
  const [addresses, setAddresses] = useState<AddressData[]>([{
    id: 1, houseNumber: '', street: '', subDistrict: '', district: '', province: '', zipcode: ''
  }])
  const [selectedAddressId, setSelectedAddressId] = useState<number>(1)
  const [addressSuggestions, setAddressSuggestions] = useState<{[id: number]: any[]}>({})

  const handleZipcodeChange = (id: number, val: string) => {
    updateAddress(id, 'zipcode', val);
    const zip = val.replace(/\D/g, '').slice(0, 5);
    
    if (zip.length === 5) {
      const results = searchAddressByZipcode(zip);
      if (results.length === 1) {
        updateAddress(id, 'subDistrict', results[0].district);
        updateAddress(id, 'district', results[0].amphoe);
        updateAddress(id, 'province', results[0].province);
        setAddressSuggestions(prev => ({ ...prev, [id]: [] }));
      } else if (results.length > 1) {
        setAddressSuggestions(prev => ({ ...prev, [id]: results }));
      } else {
        setAddressSuggestions(prev => ({ ...prev, [id]: [] }));
      }
    } else {
      setAddressSuggestions(prev => ({ ...prev, [id]: [] }));
      updateAddress(id, 'subDistrict', '');
      updateAddress(id, 'district', '');
      updateAddress(id, 'province', '');
    }
  }

  const selectSuggestion = (id: number, suggestion: any) => {
    updateAddress(id, 'subDistrict', suggestion.district);
    updateAddress(id, 'district', suggestion.amphoe);
    updateAddress(id, 'province', suggestion.province);
    updateAddress(id, 'zipcode', String(suggestion.zipcode));
    setAddressSuggestions(prev => ({ ...prev, [id]: [] }));
  }

  const handleAddAddress = () => {
    const newId = addresses.length > 0 ? Math.max(...addresses.map(a => a.id)) + 1 : 1
    setAddresses([...addresses, { id: newId, houseNumber: '', street: '', subDistrict: '', district: '', province: '', zipcode: '' }])
    setSelectedAddressId(newId)
  }

  const updateAddress = (id: number, field: keyof AddressData, value: string) => {
    setAddresses(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a))
  }

  const canFillAddress = !!customerName.trim() && customerPhone.replace(/\D/g, '').length === 10;
  const isAllAddressesValid = addresses.every(addr => 
    addr.houseNumber.trim() !== '' && 
    addr.subDistrict.trim() !== '' && 
    addr.district.trim() !== '' && 
    addr.province.trim() !== '' && 
    addr.zipcode.trim() !== ''
  );
  const canAddAddress = canFillAddress && isAllAddressesValid;

  // Items State
  const createEmptyItem = () => ({ id: Math.random().toString(36).substring(7), sku: '', qty: 1 })
  const [orderItems, setOrderItems] = useState<{id: string, sku: string, qty: number}[]>([createEmptyItem()])
  
  const loadData = () => {
    setOrders(getOrders())
    const invProducts = getProducts()
    setProducts(invProducts)
  }

  useEffect(() => {
    loadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddRow = () => {
    setOrderItems(prev => [...prev, createEmptyItem()])
  }

  const handleRemoveRow = (idToRemove: string) => {
    setOrderItems(prev => prev.filter(i => i.id !== idToRemove))
  }

  const handleUpdateRow = (id: string, field: 'sku' | 'qty', value: any) => {
    setOrderItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      if (field === 'sku') {
        return { ...item, sku: value, qty: 1 };
      }
      if (field === 'qty') {
        const product = products.find(p => p.sku === item.sku);
        let validQty = parseInt(value) || 1;
        if (validQty < 1) validQty = 1;
        if (product && validQty > product.qty) validQty = product.qty;
        return { ...item, qty: validQty };
      }
      return item;
    }))
  }

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      const p = products.find(prod => prod.sku === item.sku)
      return sum + (p ? p.price * item.qty : 0)
    }, 0)
  }

  // Toast State
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'error' | 'success'>('error')

  const showToast = (msg: string, type: 'error' | 'success' = 'error') => {
    setToastMessage(msg)
    setToastType(type)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const handleSaveOrder = () => {
    if (orderItems.length === 0) {
      showToast('กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ')
      return
    }
    if (orderItems.some(item => !item.sku)) {
      showToast('กรุณาเลือกสินค้าให้ครบทุกรายการ')
      return
    }
    
    const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0]
    
    if (channel !== 'STOREFRONT') {
      if (!customerName || !customerPhone) {
        showToast('กรุณากรอกชื่อและเบอร์โทรศัพท์ผู้รับ สำหรับช่องทางออนไลน์')
        return
      }
      
      const { houseNumber, street, subDistrict, district, province, zipcode } = selectedAddress
      if (!houseNumber || !street || !subDistrict || !district || !province || !zipcode) {
        showToast('กรุณากรอกข้อมูลที่อยู่จัดส่งให้ครบทุกช่อง')
        return
      }
    }

    const fullAddress = JSON.stringify({
      houseNumber: selectedAddress.houseNumber,
      street: selectedAddress.street,
      subDistrict: selectedAddress.subDistrict,
      district: selectedAddress.district,
      province: selectedAddress.province,
      zipcode: selectedAddress.zipcode
    })

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
      customerName: channel === 'STOREFRONT' ? 'Walk-in' : customerName,
      customerPhone: channel === 'STOREFRONT' ? '-' : customerPhone,
      address: channel === 'STOREFRONT' ? '-' : fullAddress,
      items,
      total: calculateTotal(),
      status: isPaid ? 'Paid' : (payment === 'CASH ON DELIVERY' ? 'Awaiting payment' : 'Awaiting payment')
    }

    const result = createOrder(newOrderData)
    if (result.success) {
      showToast('บันทึกคำสั่งซื้อเรียบร้อย และตัดสต๊อกสำเร็จ!', 'success')
      // reset form
      setOrderItems([createEmptyItem()])
      setCustomerName('')
      setCustomerPhone('')
      setAddresses([{ id: 1, houseNumber: '', street: '', subDistrict: '', district: '', province: '', zipcode: '' }])
      setSelectedAddressId(1)
      loadData()
    } else {
      showToast(result.error || 'เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Awaiting payment': return 'text-[#da8018] bg-[#fff3d7] rounded-xl'
      case 'Paid': return 'text-[#276ed2] bg-[#e7f3ff] rounded-xl'
      case 'Completed': return 'text-[#31976a] bg-[#e0faec] rounded-xl'
      case 'Cancelled': return 'text-[#e70029] bg-[#ffeded] rounded-xl'
      default: return 'bg-gray-100 text-gray-800 rounded-xl'
    }
  }
  
  const getChannelColor = (ch: string) => {
    switch(ch) {
      case 'LINE': return 'text-[#1f956a] bg-[#e0faec] rounded-xl'
      case 'FACEBOOK': 
      case 'FB': return 'text-[#276ed2] bg-[#e7f3ff] rounded-xl'
      case 'STOREFRONT': 
      case 'POS': return 'text-[#1d295b] bg-[#f1f5f9] rounded-xl'
      default: return 'bg-gray-500 text-white rounded-xl'
    }
  }

  return (
    <AppLayout>
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 flex items-center gap-2 transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-4 ${
          toastType === 'success' ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-white'
        }`}>
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}
      <div className="min-h-screen bg-[#F3F4F6] text-gray-900 pb-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-white to-transparent opacity-50 pointer-events-none"></div>
        
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 relative z-10">
          
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">Order Records</h1>
              <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]">LIVE</span>
            </div>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-[65%_1fr] gap-6 xl:gap-8 items-start">
            
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-8">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Order history</h2>
                </div>
                <div className="text-sm font-bold text-gray-400 bg-gray-50 px-4 py-2 rounded-full">
                  {orders.length} records
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-150">
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
                          <span className={`text-[10px] font-bold px-2.5 py-1 ${getChannelColor(order.channel)}`}>
                            {order.channel === 'FACEBOOK' ? 'FB' : order.channel === 'STOREFRONT' ? 'POS' : order.channel}
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
                          <span className={`text-[11px] font-bold px-3 py-1.5 ${getStatusColor(order.status)} whitespace-nowrap`}>
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
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-gray-900 to-gray-400"></div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Record new order</h2>
              
              <div className="space-y-8">
                
                <section>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Channel</label>
                  <div className="flex p-1 bg-gray-100 rounded-xl">
                    {['LINE', 'FACEBOOK', 'STOREFRONT'].map(ch => (
                      <button
                        key={ch}
                        onClick={() => setChannel(ch)}
                        className={`flex-1 text-[11px] font-bold py-2.5 rounded-lg transition-all ${channel === ch ? 'text-[#00b6d5] bg-[#e6f8fb] border border-[#66d4e6] shadow-sm' : 'text-gray-500 hover:text-gray-700 border border-transparent'}`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </section>

                {channel !== 'STOREFRONT' && (
                  <section>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
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
                        maxLength={10}
                        value={customerPhone}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                          setCustomerPhone(val)
                          const digits = val
                          if (digits.length === 10) {
                            const pastOrders = orders.filter(o => o.customerPhone === val || o.customerPhone === digits || o.customerPhone.replace(/\D/g, '') === digits)
                            if (pastOrders.length > 0) {
                              if (!customerName) {
                                 const match = pastOrders.find(o => o.customerName && o.customerName !== 'Walk-in' && o.customerName !== 'Walk-in counter');
                                 if (match) setCustomerName(match.customerName)
                              }
                              const foundAddresses: AddressData[] = []
                              pastOrders.forEach(o => {
                                if (o.address && o.address !== '-' && o.address.startsWith('{')) {
                                  try {
                                    const parsed = JSON.parse(o.address)
                                    if (!foundAddresses.some(a => a.houseNumber === parsed.houseNumber && a.district === parsed.district)) {
                                      foundAddresses.push({ ...parsed, id: foundAddresses.length + 1 })
                                    }
                                  } catch(err) {}
                                }
                              })
                              if (foundAddresses.length > 0) {
                                setAddresses(foundAddresses)
                                setSelectedAddressId(foundAddresses[0].id)
                              }
                            }
                          }
                        }}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent px-4 py-3 outline-none transition-all placeholder:text-gray-400 font-medium"
                      />
                    </div>
                  </section>
                )}

                {channel !== 'STOREFRONT' && (
                  <section>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        Shipping address ({addresses.length})
                      </label>
                      <button 
                        type="button" 
                        onClick={handleAddAddress} 
                        disabled={!canAddAddress}
                        className={`text-xs font-bold ${canAddAddress ? 'text-gray-900 hover:underline' : 'text-gray-300 cursor-not-allowed'}`}
                      >
                        +Add address
                      </button>
                    </div>
                    
                    <div className={`space-y-4 transition-opacity duration-300 ${!canFillAddress ? 'opacity-40 pointer-events-none' : ''}`}>
                      {addresses.map((addr, idx) => (
                        <div key={addr.id} className={`rounded-xl border p-4 space-y-4 transition-colors ${selectedAddressId === addr.id ? 'bg-gray-50 border-blue-200' : 'bg-white border-gray-100 opacity-60 hover:opacity-100'}`}>
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="radio" 
                                name="addressSelection"
                                checked={selectedAddressId === addr.id} 
                                onChange={() => setSelectedAddressId(addr.id)}
                                disabled={!canFillAddress}
                                className="w-4 h-4 accent-blue-500 cursor-pointer disabled:opacity-50" 
                              />
                              <span className="text-sm font-bold text-gray-900">address ({idx + 1})</span>
                              {selectedAddressId === addr.id && (
                                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-sm font-bold">For shipping</span>
                              )}
                            </label>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3 mt-3">
                            <div className="flex flex-col gap-1 col-span-1">
                              <label className="text-[10px] font-bold text-gray-500">House number</label>
                              <input type="text" placeholder="House number" value={addr.houseNumber} onChange={e => updateAddress(addr.id, 'houseNumber', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-gray-900 outline-none disabled:bg-gray-100 disabled:text-gray-400" disabled={!canFillAddress || selectedAddressId !== addr.id} />
                            </div>
                            <div className="flex flex-col gap-1 col-span-1">
                              <label className="text-[10px] font-bold text-gray-500">Street</label>
                              <input type="text" placeholder="Street" value={addr.street} onChange={e => updateAddress(addr.id, 'street', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-gray-900 outline-none disabled:bg-gray-100 disabled:text-gray-400" disabled={!canFillAddress || selectedAddressId !== addr.id} />
                            </div>
                            <div className="relative flex flex-col gap-1 col-span-1">
                              <label className="text-[10px] font-bold text-gray-500">Postal Code</label>
                              <input type="text" placeholder="Postal Code" maxLength={5} value={addr.zipcode} onChange={e => handleZipcodeChange(addr.id, e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-gray-900 outline-none disabled:bg-gray-100 disabled:text-gray-400" disabled={!canFillAddress || selectedAddressId !== addr.id} />
                              
                              {addressSuggestions[addr.id]?.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                                  {addressSuggestions[addr.id].map((sug, i) => (
                                    <div key={i} onClick={() => selectSuggestion(addr.id, sug)} className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-xs border-b border-gray-100 last:border-0">
                                      <div className="font-bold text-gray-800">{sug.district}</div>
                                      <div className="text-gray-500 text-[10px]">{sug.amphoe}, {sug.province}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 col-span-1">
                              <label className="text-[10px] font-bold text-gray-500">Subdistrict</label>
                              <input type="text" placeholder="Subdistrict" value={addr.subDistrict} onChange={e => updateAddress(addr.id, 'subDistrict', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-gray-900 outline-none disabled:bg-gray-100 disabled:text-gray-400" disabled={!canFillAddress || selectedAddressId !== addr.id} />
                            </div>
                            <div className="flex flex-col gap-1 col-span-1">
                              <label className="text-[10px] font-bold text-gray-500">District</label>
                              <input type="text" placeholder="District" value={addr.district} onChange={e => updateAddress(addr.id, 'district', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-gray-900 outline-none disabled:bg-gray-100 disabled:text-gray-400" disabled={!canFillAddress || selectedAddressId !== addr.id} />
                            </div>
                            <div className="flex flex-col gap-1 col-span-1">
                              <label className="text-[10px] font-bold text-gray-500">Province</label>
                              <input type="text" placeholder="Province" value={addr.province} onChange={e => updateAddress(addr.id, 'province', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-gray-900 outline-none disabled:bg-gray-100 disabled:text-gray-400" disabled={!canFillAddress || selectedAddressId !== addr.id} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Package className="w-3 h-3" />
                      Product List ({orderItems.length})
                    </label>
                    <button type="button" onClick={handleAddRow} className="text-xs font-bold text-gray-900 hover:underline">+ Add item</button>
                  </div>

                  <div className="space-y-2 mb-4">
                    {orderItems.map(item => {
                      return (
                        <div key={item.id} className="flex gap-2 items-center bg-gray-50 p-2 rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex-1 relative">
                            <select 
                              value={item.sku}
                              onChange={e => handleUpdateRow(item.id, 'sku', e.target.value)}
                              className="w-full appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-xs font-medium focus:ring-1 focus:ring-gray-900 outline-none text-gray-900"
                            >
                              <option value="" disabled>เลือกสินค้า...</option>
                              {products.map(p => {
                                const isSelectedByOther = orderItems.some(i => i.id !== item.id && i.sku === p.sku)
                                if (isSelectedByOther) return null
                                return (
                                  <option key={p.sku} value={p.sku} disabled={p.qty === 0} className={p.qty === 0 ? "text-gray-400" : ""}>
                                    {p.name} — {p.qty} left {p.qty === 0 && '(Out of stock)'}
                                  </option>
                                )
                              })}
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                          
                          <input 
                            type="number" 
                            value={item.qty}
                            onChange={e => handleUpdateRow(item.id, 'qty', e.target.value)}
                            min="1" 
                            className="w-14 bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs font-medium text-center focus:ring-1 focus:ring-gray-900 outline-none" 
                          />
                          <button type="button" onClick={() => handleRemoveRow(item.id)} className="text-gray-400 hover:text-rose-500 p-1 flex-shrink-0">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                    <span className="text-sm font-bold text-gray-500">Total</span>
                    <span className="text-2xl font-black text-gray-900">{formatPrice(calculateTotal())}</span>
                  </div>
                </section>

                <section className="bg-gray-900 rounded-2xl p-5 text-white relative overflow-hidden group">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
                  
                  <div className="relative z-10">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <CreditCard className="w-3 h-3" />
                      Payment Method
                    </label>
                    
                    <div className="flex p-1 bg-gray-800 rounded-xl mb-5">
                      {['BANK TRANSFER', 'CASH ON DELIVERY'].map(method => (
                        <button
                          key={method}
                          onClick={() => setPayment(method)}
                          className={`flex-1 text-[10px] font-bold py-2.5 rounded-lg transition-all ${payment === method ? 'text-[#00b6d5] bg-[#e6f8fb] border border-[#66d4e6] shadow-md' : 'text-gray-400 hover:text-white border border-transparent'}`}
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
                        Mark as already paid
                      </span>
                    </label>

                    <button onClick={handleSaveOrder} className="w-full text-white bg-[#07090c] hover:bg-gray-800 font-black text-sm py-4 rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2">
                      Save order & deduct stock
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
