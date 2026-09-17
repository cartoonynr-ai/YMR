import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { 
  Search,
  Package,
  Plus,
  AlertCircle,
  CheckCircle2,
  FileText,
  X
} from 'lucide-react'
import { getProducts, updateProduct, generateNewPoNumber, type Product } from '../services/inventory'

export const Route = createFileRoute('/new-order')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/' })
    }
    if (context.auth.user?.role?.toLowerCase() !== 'admin') {
      throw redirect({ to: '/pos' })
    }
  },
  component: NewOrderPage,
})

function NewOrderPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState<{ product: Product; addQty: number }[]>([])
  const [referenceDoc, setReferenceDoc] = useState('')
  
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    setAlert({ message, type })
    setTimeout(() => setAlert(null), 3000)
  }

  const loadData = async () => {
    try {
      const [prods, newPo] = await Promise.all([
        getProducts(),
        generateNewPoNumber()
      ])
      setProducts(prods)
      setReferenceDoc(newPo)
    } catch (err: any) {
      showToast(err.message || 'Error loading data')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.sku === product.sku)
    if (existing) {
      setCart(cart.map(item => 
        item.product.sku === product.sku 
          ? { ...item, addQty: item.addQty + 1 } 
          : item
      ))
    } else {
      setCart([...cart, { product, addQty: 1 }])
    }
  }

  const updateCartQty = (sku: string, qty: number) => {
    if (qty < 1) return
    setCart(cart.map(item => 
      item.product.sku === sku 
        ? { ...item, addQty: qty } 
        : item
    ))
  }

  const removeFromCart = (sku: string) => {
    setCart(cart.filter(item => item.product.sku !== sku))
  }

  const handleOrder = async () => {
    if (cart.length === 0) {
      showToast('กรุณาเลือกสินค้าที่ต้องการรับเข้าสต็อก', 'error')
      return
    }

    setIsSubmitting(true)
    let hasError = false

    for (const item of cart) {
      const updatedProduct = {
        ...item.product,
        qty: item.product.qty + item.addQty, // Increase stock
        reference_doc: referenceDoc.trim() || undefined
      }

      const res = await updateProduct(
        item.product.sku, 
        updatedProduct, 
        'รับสินค้าเข้าคลัง (เพิ่มสต็อก)'
      )

      if (!res.success) {
        hasError = true
        showToast(`เกิดข้อผิดพลาดในการอัปเดต ${item.product.name}: ${res.error}`, 'error')
        break // Stop on first error
      }
    }

    if (!hasError) {
      showToast('บันทึกการรับสินค้าเข้าสต็อกเรียบร้อยแล้ว!', 'success')
      setCart([])
      loadData() // Refresh inventory
    }
    
    setIsSubmitting(false)
  }

  return (
    <AppLayout>
      {alert && (
        <div className={`fixed top-5 right-5 z-[9999] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium transition-all ${
          alert.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
        }`}>
          {alert.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          <span>{alert.message}</span>
        </div>
      )}

      <div className="flex flex-col h-full max-h-[calc(100vh-2rem)]">
        <header className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Receive Stock</h1>
            <p className="text-sm text-gray-500 mt-1">คำสั่งให้ระบบเพิ่มสินค้าเข้า</p>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row-reverse gap-6 h-full min-h-0 overflow-hidden">
          
          {/* RIGHT PANEL: Restock Form */}
          <div className="w-full lg:w-[450px] shrink-0 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Order
              </h2>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              {/* Reference Document */}
              <div className="mb-6">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  เลขที่ใบสั่งซื้อ (PO)
                </label>
                <input
                  type="text"
                  value={referenceDoc}
                  readOnly
                  className="w-full bg-gray-50 border border-gray-200 text-gray-500 font-medium text-sm rounded-xl px-3 py-2.5 outline-none cursor-not-allowed"
                />
              </div>

              {/* Cart Items */}
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                รายการสินค้าที่จะรับเข้าสต็อก
              </label>

              {cart.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">ยังไม่มีสินค้าในรายการ</p>
                  <p className="text-xs text-gray-400 mt-1">กดปุ่ม "เพิ่ม" จากตารางด้านขวา</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.product.sku} className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm flex items-start gap-3 relative group">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">{item.product.name}</div>
                        <div className="text-xs text-gray-500 font-medium mt-0.5">SKU: {item.product.sku}</div>
                        <div className="text-[10px] text-gray-400 mt-1">สต็อกปัจจุบัน: <span className="font-semibold text-gray-600">{item.product.qty}</span></div>
                      </div>
                      <div className="w-20 shrink-0">
                        <label className="block text-[10px] text-gray-500 mb-1">จำนวนที่รับ</label>
                        <input
                          type="number"
                          min="1"
                          value={item.addQty}
                          onChange={(e) => updateCartQty(item.product.sku, parseInt(e.target.value) || 1)}
                          className="w-full text-center bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product.sku)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-gray-200 text-gray-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm cursor-pointer"
                        title="ลบ"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-5 border-t border-gray-100 bg-gray-50/50 mt-auto shrink-0">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-500">รวมรายการทั้งหมด:</span>
                <span className="text-base font-bold text-gray-900">{cart.length} รายการ</span>
              </div>
              <div className="flex justify-between items-center mb-5">
                <span className="text-sm font-medium text-gray-500">ยอดรวมการสั่งซื้อ:</span>
                <span className="text-2xl font-black text-primary">
                  ฿{cart.reduce((sum, item) => sum + (item.product.price * item.addQty), 0).toLocaleString()}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCart([])
                  }}
                  className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleOrder}
                  disabled={isSubmitting || cart.length === 0}
                  className="flex-1 py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {isSubmitting ? 'กำลังบันทึก...' : 'สั่งซื้อ / รับเข้า'}
                </button>
              </div>
            </div>
          </div>

          {/* LEFT PANEL: Inventory Table */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 min-w-0 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 shrink-0">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Inventory
              </h2>
              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </span>
                <input
                  type="text"
                  placeholder="ค้นหาสินค้า / SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 bg-white border-b border-gray-100 z-10 shadow-sm">
                  <tr className="text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50/50">
                    <th className="px-6 py-4">Product Details</th>
                    <th className="px-6 py-4 text-center">Stock</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.sku} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500 font-medium mt-0.5">SKU: {product.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-semibold ${product.qty === 0 ? 'text-rose-600' : product.qty <= product.threshold ? 'text-amber-600' : 'text-gray-900'}`}>
                          {product.qty}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        ฿{product.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => addToCart(product)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          เพิ่ม
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                        ไม่พบสินค้าที่ค้นหา
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  )
}
