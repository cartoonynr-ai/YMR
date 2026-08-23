import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import AppLayout from '../components/layout/AppLayout'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  FolderPlus,
  Layers,
} from 'lucide-react'
import {
  getProducts,
  getCategories,
  getMovements,
  addProduct,
  updateProduct,
  deleteProduct,
  addCategory,
  updateCategory,
  deleteCategory,
  type Product,
  type Category,
  type StockMovement,
} from '../data/mockInventory'

export const Route = createFileRoute('/inventory')({
  beforeLoad: () => {
    const token = localStorage.getItem('token')
    if (!token) {
      throw redirect({ to: '/' })
    }
  },
  component: Inventory,
})

type TabType = 'all' | 'low' | 'history' | 'categories'

function Inventory() {
  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>('all')

  // Data States
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])

  // Search state
  const [searchTerm, setSearchTerm] = useState('')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Modals States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null) // null means creating

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null) // null means creating

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'product' | 'category'
    key: string // SKU for product, name for category
    displayName: string
  } | null>(null)

  // Error/Success Alerts
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Form States
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    sku: '',
    barcode: '',
    brand: '',
    compatibility: '',
    category: '',
    price: 0,
    qty: 0,
    threshold: 0,
  })

  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({
    name: '',
    thaiName: '',
  })

  // Load Data
  const loadData = () => {
    setProducts(getProducts())
    setCategories(getCategories())
    setMovements(getMovements())
  }

  useEffect(() => {
    loadData()
  }, [])

  // Auto Dismiss Alert
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [alert])

  // Reset pagination when tab or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchTerm])

  // Reset Product Form when modal closes or editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      setProductForm(editingProduct)
    } else {
      setProductForm({
        name: '',
        sku: '',
        barcode: '',
        brand: '',
        compatibility: '',
        category: categories[0]?.name || '',
        price: 0,
        qty: 0,
        threshold: 5,
      })
    }
  }, [editingProduct, isProductModalOpen, categories])

  // Reset Category Form when modal closes or editingCategory changes
  useEffect(() => {
    if (editingCategory) {
      setCategoryForm(editingCategory)
    } else {
      setCategoryForm({
        name: '',
        thaiName: '',
      })
    }
  }, [editingCategory, isCategoryModalOpen])

  // Filtered Products Count per Category
  const getProductCountByCategory = (catName: string) => {
    return products.filter((p) => p.category === catName).length
  }

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()

    if (activeTab === 'all' || activeTab === 'low') {
      let result = products

      if (activeTab === 'low') {
        result = products.filter((p) => p.qty <= p.threshold)
      }

      if (term) {
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.sku.toLowerCase().includes(term) ||
            p.barcode.toLowerCase().includes(term) ||
            p.brand.toLowerCase().includes(term) ||
            p.compatibility.toLowerCase().includes(term)
        )
      }
      return result
    }

    if (activeTab === 'history') {
      if (!term) return movements
      return movements.filter(
        (m) =>
          m.productName.toLowerCase().includes(term) ||
          m.sku.toLowerCase().includes(term) ||
          m.reason.toLowerCase().includes(term) ||
          m.by.toLowerCase().includes(term)
      )
    }

    if (activeTab === 'categories') {
      if (!term) return categories
      return categories.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.thaiName.toLowerCase().includes(term)
      )
    }

    return []
  }, [activeTab, products, categories, movements, searchTerm])

  // Paginated Data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredData.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredData, currentPage])

  // Total pages
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage))

  // Helpers to get Category Thai Name
  const getCategoryThaiName = (engName: string) => {
    return categories.find((c) => c.name === engName)?.thaiName || engName
  }

  // Handle Product CRUD
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const { name, sku, barcode, brand, compatibility, category, price, qty, threshold } = productForm

    if (!name || !sku || !category) {
      setAlert({ message: 'กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน', type: 'error' })
      return
    }

    const pData: Product = {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      barcode: barcode?.trim() || '',
      brand: brand?.trim() || '',
      compatibility: compatibility?.trim() || '',
      category: category,
      price: Number(price) || 0,
      qty: Number(qty) || 0,
      threshold: Number(threshold) || 0,
    }

    if (editingProduct) {
      // Edit
      const res = updateProduct(editingProduct.sku, pData)
      if (res.success) {
        setAlert({ message: 'แก้ไขข้อมูลสินค้าสำเร็จ', type: 'success' })
        setIsProductModalOpen(false)
        loadData()
      } else {
        setAlert({ message: res.error || 'เกิดข้อผิดพลาด', type: 'error' })
      }
    } else {
      // Add
      const res = addProduct(pData)
      if (res.success) {
        setAlert({ message: 'เพิ่มสินค้าใหม่ลงคลังสำเร็จ', type: 'success' })
        setIsProductModalOpen(false)
        loadData()
      } else {
        setAlert({ message: res.error || 'เกิดข้อผิดพลาด', type: 'error' })
      }
    }
  }

  // Handle Category CRUD
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const { name, thaiName } = categoryForm

    if (!name || !thaiName) {
      setAlert({ message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง', type: 'error' })
      return
    }

    const cData: Category = {
      name: name.trim(),
      thaiName: thaiName.trim(),
    }

    if (editingCategory) {
      // Edit
      const res = updateCategory(editingCategory.name, cData)
      if (res.success) {
        setAlert({ message: 'แก้ไขหมวดหมู่สำเร็จ', type: 'success' })
        setIsCategoryModalOpen(false)
        loadData()
      } else {
        setAlert({ message: res.error || 'เกิดข้อผิดพลาด', type: 'error' })
      }
    } else {
      // Add
      const res = addCategory(cData)
      if (res.success) {
        setAlert({ message: 'เพิ่มหมวดหมู่ใหม่สำเร็จ', type: 'success' })
        setIsCategoryModalOpen(false)
        loadData()
      } else {
        setAlert({ message: res.error || 'เกิดข้อผิดพลาด', type: 'error' })
      }
    }
  }

  // Confirm delete
  const executeDelete = () => {
    if (!deleteTarget) return

    if (deleteTarget.type === 'product') {
      const res = deleteProduct(deleteTarget.key)
      if (res) {
        setAlert({ message: `ลบสินค้า ${deleteTarget.displayName} สำเร็จ`, type: 'success' })
      } else {
        setAlert({ message: 'ไม่สามารถลบสินค้าได้', type: 'error' })
      }
    } else {
      const res = deleteCategory(deleteTarget.key)
      if (res.success) {
        setAlert({ message: `ลบหมวดหมู่ ${deleteTarget.displayName} สำเร็จ`, type: 'success' })
      } else {
        setAlert({ message: res.error || 'เกิดข้อผิดพลาด', type: 'error' })
      }
    }

    setIsDeleteModalOpen(false)
    setDeleteTarget(null)
    loadData()
  }

  return (
    <AppLayout>
      {/* Toast Alert */}
      {alert && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium transition-all ${
          alert.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
        }`}>
          <span>{alert.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'categories' ? (
            <button
              onClick={() => {
                setEditingCategory(null)
                setIsCategoryModalOpen(true)
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg text-sm transition-all shadow-sm cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>New Category</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingProduct(null)
                setIsProductModalOpen(true)
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg text-sm transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1.5 flex flex-wrap items-center gap-1 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'all' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          All Stock
        </button>
        <button
          onClick={() => setActiveTab('low')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'low' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Low/Out Of Stock
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'history' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Stock History
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'categories' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Categories
        </button>

        {/* Search Input */}
        <div className="relative ml-auto w-full md:w-64 mt-2 md:mt-0">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder={
              activeTab === 'categories'
                ? 'ค้นหาหมวดหมู่...'
                : activeTab === 'history'
                ? 'ค้นหาประวัติ...'
                : 'ค้นหาชื่อสินค้า/SKU/บาร์โค้ด...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 focus:bg-white border border-gray-200 focus:border-primary rounded-lg focus:outline-none transition-all placeholder-gray-400"
          />
        </div>
      </div>
      {/* Main Content Pane */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400">
            <Layers className="w-12 h-12 stroke-1 mb-3" />
            <p className="text-sm">ไม่พบข้อมูลที่ต้องการ</p>
          </div>
        ) : (
          <>
            {/* Products Table (All & Low) */}
            {(activeTab === 'all' || activeTab === 'low') && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <th className="px-6 py-3.5">Product Details</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Compatibility</th>
                      <th className="px-6 py-3.5 text-center">Stock Quantity</th>
                      <th className="px-6 py-3.5">Price</th>
                      <th className="px-6 py-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(paginatedData as Product[]).map((product) => {
                      const isLow = product.qty <= product.threshold
                      const isOut = product.qty === 0

                      return (
                        <tr key={product.sku} className="border-b border-gray-100 hover:bg-gray-50/40 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400 mt-1">
                              <span>SKU: {product.sku}</span>
                              {product.barcode && <span>Barcode: {product.barcode}</span>}
                              {product.brand && <span>Brand: {product.brand}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                              {getCategoryThaiName(product.category)}
                            </span>
                          </td>
                          <td className="px-6 py-4 max-w-xs truncate text-gray-600" title={product.compatibility}>
                            {product.compatibility || '-'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className={`font-semibold text-base ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-gray-900'}`}>
                                {product.qty}
                              </span>
                              {isOut ? (
                                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full uppercase">
                                  Out of stock
                                </span>
                              ) : isLow ? (
                                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full uppercase">
                                  Low Stock
                                </span>
                              ) : null}
                              <span className="text-[10px] text-gray-400 mt-0.5">Threshold: {product.threshold}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            ฿{product.price.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingProduct(product)
                                  setIsProductModalOpen(true)
                                }}
                                className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                                title="แก้ไขสินค้า"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteTarget({
                                    type: 'product',
                                    key: product.sku,
                                    displayName: product.name,
                                  })
                                  setIsDeleteModalOpen(true)
                                }}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="ลบสินค้า"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* History Table */}
            {activeTab === 'history' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <th className="px-6 py-3.5">Timestamp</th>
                      <th className="px-6 py-3.5">Product</th>
                      <th className="px-6 py-3.5 text-center">Change</th>
                      <th className="px-6 py-3.5 text-center">Balance</th>
                      <th className="px-6 py-3.5">Reason</th>
                      <th className="px-6 py-3.5">By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(paginatedData as StockMovement[]).map((move, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/40 transition-colors">
                        <td className="px-6 py-4 text-gray-600 font-mono text-xs whitespace-nowrap">
                          {move.timestamp}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{move.productName}</div>
                          <div className="text-xs text-gray-400 mt-0.5">SKU: {move.sku}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-semibold text-sm px-2 py-0.5 rounded-full ${
                            move.change > 0
                              ? 'bg-emerald-50 text-emerald-700'
                              : move.change < 0
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-slate-50 text-slate-700'
                          }`}>
                            {move.change > 0 ? `+${move.change}` : move.change}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-gray-900">
                          {move.balance}
                        </td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                          {move.reason}
                        </td>
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                          {move.by}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Categories Table */}
            {activeTab === 'categories' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <th className="px-6 py-3.5">Category Name</th>
                      <th className="px-6 py-3.5">Thai name</th>
                      <th className="px-6 py-3.5 text-center">Products Count</th>
                      <th className="px-6 py-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(paginatedData as Category[]).map((cat) => (
                      <tr key={cat.name} className="border-b border-gray-100 hover:bg-gray-50/40 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {cat.name}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {cat.thaiName}
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-primary">
                          {getProductCountByCategory(cat.name)} Products
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex gap-1.5">
                            <button
                              onClick={() => {
                                setEditingCategory(cat)
                                setIsCategoryModalOpen(true)
                              }}
                              className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                              title="แก้ไขหมวดหมู่"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTarget({
                                  type: 'category',
                                  key: cat.name,
                                  displayName: `${cat.name} (${cat.thaiName})`,
                                })
                                setIsDeleteModalOpen(true)
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="ลบหมวดหมู่"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-gray-500 font-medium">
                {(() => {
                  const start = (currentPage - 1) * itemsPerPage + 1
                  const end = Math.min(filteredData.length, currentPage * itemsPerPage)
                  const total = filteredData.length

                  if (activeTab === 'all' || activeTab === 'low') {
                    return `Showing ${start}-${end} of ${total} products`
                  } else if (activeTab === 'history') {
                    return `${start}-${end} of ${total} stock movements`
                  } else {
                    return `${start}-${end} of ${total} categories`
                  }
                })()}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold px-3 py-1.5 bg-gray-100 rounded-lg">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* PRODUCT CREATION/EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 transform transition-all">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">
                {editingProduct ? 'Edit Product Details' : 'New Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors cursor-pointer text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                    Name Product *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Name Product"
                    value={productForm.name || ''}
                    onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none text-sm transition-all bg-gray-50/50 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* SKU */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                      SKU *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter SKU"
                      disabled={!!editingProduct} // SKU shouldn't be edited once created
                      value={productForm.sku || ''}
                      onChange={(e) => setProductForm((f) => ({ ...f, sku: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none text-sm transition-all bg-gray-50/50 focus:bg-white disabled:opacity-50 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Barcode */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                      Barcode
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Barcode"
                      value={productForm.barcode || ''}
                      onChange={(e) => setProductForm((f) => ({ ...f, barcode: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none text-sm transition-all bg-gray-50/50 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Brand */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Brand"
                      value={productForm.brand || ''}
                      onChange={(e) => setProductForm((f) => ({ ...f, brand: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none text-sm transition-all bg-gray-50/50 focus:bg-white"
                    />
                  </div>

                  {/* Compatibility */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                      Compatibility
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Compatibility"
                      value={productForm.compatibility || ''}
                      onChange={(e) => setProductForm((f) => ({ ...f, compatibility: e.target.value }))}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none text-sm transition-all bg-gray-50/50 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                      Category *
                    </label>
                    <select
                      value={productForm.category || ''}
                      onChange={(e) => setProductForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none text-sm bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({c.thaiName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                      Price (฿) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="Enter Price"
                      value={productForm.price === 0 ? '' : productForm.price}
                      onChange={(e) => setProductForm((f) => ({ ...f, price: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none text-sm transition-all bg-gray-50/50 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Stock QTY */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="Enter Stock QTY"
                      value={productForm.qty === 0 ? '' : productForm.qty}
                      onChange={(e) => setProductForm((f) => ({ ...f, qty: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none text-sm transition-all bg-gray-50/50 focus:bg-white"
                    />
                  </div>

                  {/* Threshold */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                      Threshold *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="Enter Threshold"
                      value={productForm.threshold === 0 ? '' : productForm.threshold}
                      onChange={(e) => setProductForm((f) => ({ ...f, threshold: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none text-sm transition-all bg-gray-50/50 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium shadow-sm transition-all cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY CREATION/EDIT MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 transform transition-all">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors cursor-pointer text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* English Name (ID) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                    Category Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingCategory} // Cannot change ID/English name as it relates products
                    placeholder="Engine Oil, Spark Plugs"
                    value={categoryForm.name || ''}
                    onChange={(e) => setCategoryForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none text-sm transition-all bg-gray-50/50 focus:bg-white disabled:opacity-50 disabled:bg-gray-100"
                  />
                </div>

                {/* Thai Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                    Thai Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="น้ำมันเครื่อง, หัวเทียน"
                    value={categoryForm.thaiName || ''}
                    onChange={(e) => setCategoryForm((f) => ({ ...f, thaiName: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none text-sm transition-all bg-gray-50/50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium shadow-sm transition-all cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 transform transition-all p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-full shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 text-lg">ยืนยันการลบข้อมูล?</h3>
                <p className="text-sm text-gray-500">
                  คุณแน่ใจหรือไม่ว่าต้องการลบ{' '}
                  <span className="font-semibold text-gray-800">
                    {deleteTarget.displayName}
                  </span>{' '}
                  ออกจากระบบ? การดำเนินการนี้ไม่สามารถย้อนกลับได้
                </p>
                {deleteTarget.type === 'category' && (
                  <p className="text-xs text-rose-500 mt-2 font-medium bg-rose-50/70 p-2 rounded border border-rose-100">
                    * จะลบได้ต่อเมื่อไม่มีสินค้าตัวใดอ้างอิงถึงหมวดหมู่นี้อยู่
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setDeleteTarget(null)
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
