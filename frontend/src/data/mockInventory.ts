export interface Product {
  name: string
  sku: string
  barcode: string
  brand: string
  compatibility: string
  category: string // Sourced from Category.name (English)
  price: number
  qty: number
  threshold: number
}

export interface Category {
  name: string // English ID/name
  thaiName: string
}

export interface StockMovement {
  timestamp: string
  sku: string
  productName: string
  change: number
  balance: number
  reason: string
  by: string
}

// Initial mock data setup
const initialCategories: Category[] = [
  { name: 'Engine Oil', thaiName: 'น้ำมันเครื่อง' },
  { name: 'Tires', thaiName: 'ยางมอเตอร์ไซค์' },
  { name: 'Brake System', thaiName: 'ระบบเบรก' },
  { name: 'Filters', thaiName: 'ไส้กรอง' },
]

const initialProducts: Product[] = [
  {
    name: 'Motul 7100 4T 10W-40',
    sku: 'MTL-7100-1L',
    barcode: '3374650247926',
    brand: 'Motul',
    compatibility: 'CBR650R, Ninja 400',
    category: 'Engine Oil',
    price: 520,
    qty: 124,
    threshold: 20,
  },
  {
    name: 'IRC Sandah-Z 2.25-17',
    sku: 'IRC-SNZ-225',
    barcode: '8851234567890',
    brand: 'IRC',
    compatibility: 'Wave 110i, Dream 125',
    category: 'Tires',
    price: 620,
    qty: 4,
    threshold: 8,
  },
  {
    name: 'Pirelli Diablo Rosso IV 180/55 ZR17',
    sku: 'PIR-DR4-180',
    barcode: '8019227397100',
    brand: 'Pirelli',
    compatibility: 'CBR650R, R6, ZX-6R',
    category: 'Tires',
    price: 6800,
    qty: 3,
    threshold: 10,
  },
  {
    name: 'Brembo Sinter Brake Pad Front',
    sku: 'BRB-PAD-782',
    barcode: '8020589012345',
    brand: 'Brembo',
    compatibility: 'CBR650R, Ninja 400',
    category: 'Brake System',
    price: 1450,
    qty: 0,
    threshold: 6,
  },
  {
    name: 'Honda Genuine Engine Oil 4T',
    sku: 'HON-OIL-4T',
    barcode: '8852034012345',
    brand: 'Honda',
    compatibility: 'Wave 110i, Dream 125, Click 160',
    category: 'Engine Oil',
    price: 150,
    qty: 45,
    threshold: 15,
  },
  {
    name: 'Yamalube Super Sport 10W-40',
    sku: 'YAM-SUP-SPORT',
    barcode: '8853045012345',
    brand: 'Yamaha',
    compatibility: 'R15, MT-15',
    category: 'Engine Oil',
    price: 290,
    qty: 30,
    threshold: 12,
  },
  {
    name: 'Brembo Serie Oro Brake Disc',
    sku: 'BRB-DISC-310',
    barcode: '8020589012346',
    brand: 'Brembo',
    compatibility: 'CBR650R',
    category: 'Brake System',
    price: 6500,
    qty: 2,
    threshold: 2,
  },
  {
    name: 'K&N Air Filter HA-6519',
    sku: 'KN-FILT-650',
    barcode: '024844365123',
    brand: 'K&N',
    compatibility: 'CBR650R, CB650R',
    category: 'Filters',
    price: 2400,
    qty: 8,
    threshold: 10,
  },
  {
    name: 'Liqui Moly Motorbike 4T 10W-40',
    sku: 'LM-OIL-10W40',
    barcode: '4100420012345',
    brand: 'Liqui Moly',
    compatibility: 'General 4T Motorcycles',
    category: 'Engine Oil',
    price: 450,
    qty: 15,
    threshold: 5,
  },
  {
    name: 'Michelin City Extra 2.25-17',
    sku: 'MCH-CE-225',
    barcode: '3528701234567',
    brand: 'Michelin',
    compatibility: 'Wave 110i, Dream 125',
    category: 'Tires',
    price: 750,
    qty: 12,
    threshold: 6,
  },
]

const initialMovements: StockMovement[] = [
  {
    timestamp: '2026-08-20 13:42',
    sku: 'MTL-7100-1L',
    productName: 'Motul 7100 4T 10W-40',
    change: -1,
    balance: 124,
    reason: 'Manual stock decrease',
    by: 'Admin Staff',
  },
  {
    timestamp: '2026-08-20 09:10',
    sku: 'IRC-SNZ-225',
    productName: 'IRC Sandah-Z 2.25-17',
    change: 48,
    balance: 124,
    reason: 'Manual stock increase',
    by: 'Admin Staff',
  },
  {
    timestamp: '2026-08-19 15:30',
    sku: 'PIR-DR4-180',
    productName: 'Pirelli Diablo Rosso IV 180/55 ZR17',
    change: -2,
    balance: 3,
    reason: 'Sold via POS (ORD-9019)',
    by: 'Admin Staff',
  },
  {
    timestamp: '2026-08-19 11:15',
    sku: 'BRB-PAD-782',
    productName: 'Brembo Sinter Brake Pad Front',
    change: -4,
    balance: 0,
    reason: 'Sold via LINE (ORD-9021)',
    by: 'Admin Staff',
  },
  {
    timestamp: '2026-08-18 16:45',
    sku: 'KN-FILT-650',
    productName: 'K&N Air Filter HA-6519',
    change: 10,
    balance: 8,
    reason: 'New stock replenishment',
    by: 'Admin Staff',
  },
  {
    timestamp: '2026-08-18 10:20',
    sku: 'HON-OIL-4T',
    productName: 'Honda Genuine Engine Oil 4T',
    change: -5,
    balance: 45,
    reason: 'Sold via FB (ORD-9018)',
    by: 'Admin Staff',
  },
  {
    timestamp: '2026-08-17 14:00',
    sku: 'YAM-SUP-SPORT',
    productName: 'Yamalube Super Sport 10W-40',
    change: 15,
    balance: 30,
    reason: 'Manual stock increase',
    by: 'Admin Staff',
  },
]

// LocalStorage helpers
const KEYS = {
  PRODUCTS: 'ymr_inventory_products',
  CATEGORIES: 'ymr_inventory_categories',
  MOVEMENTS: 'ymr_inventory_movements',
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

export const initInventoryData = () => {
  if (!localStorage.getItem(KEYS.CATEGORIES)) {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(initialCategories))
  }
  if (!localStorage.getItem(KEYS.PRODUCTS)) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(initialProducts))
  }
  if (!localStorage.getItem(KEYS.MOVEMENTS)) {
    localStorage.setItem(KEYS.MOVEMENTS, JSON.stringify(initialMovements))
  }
}

export const getProducts = (): Product[] => {
  initInventoryData()
  return JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]')
}

export const getCategories = (): Category[] => {
  initInventoryData()
  return JSON.parse(localStorage.getItem(KEYS.CATEGORIES) || '[]')
}

export const getMovements = (): StockMovement[] => {
  initInventoryData()
  return JSON.parse(localStorage.getItem(KEYS.MOVEMENTS) || '[]')
}

export const saveProducts = (products: Product[]) => {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products))
}

export const saveCategories = (categories: Category[]) => {
  localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories))
}

export const saveMovements = (movements: StockMovement[]) => {
  localStorage.setItem(KEYS.MOVEMENTS, JSON.stringify(movements))
}

export const logMovement = (
  sku: string,
  productName: string,
  change: number,
  balance: number,
  reason: string
) => {
  const movements = getMovements()
  const newMovement: StockMovement = {
    timestamp: getFormattedDate(),
    sku,
    productName,
    change,
    balance,
    reason,
    by: 'Admin Staff',
  }
  movements.unshift(newMovement) // Add to the top
  saveMovements(movements)
}

// Product Actions
export const addProduct = (product: Product): { success: boolean; error?: string } => {
  const products = getProducts()
  if (products.some((p) => p.sku === product.sku)) {
    return { success: false, error: 'SKU นี้มีอยู่ในระบบแล้ว' }
  }
  products.push(product)
  saveProducts(products)
  logMovement(
    product.sku,
    product.name,
    product.qty,
    product.qty,
    'สินค้าเข้าคลังใหม่ (สร้างสินค้า)'
  )
  return { success: true }
}

export const updateProduct = (
  oldSku: string,
  updatedProduct: Product
): { success: boolean; error?: string } => {
  const products = getProducts()
  const idx = products.findIndex((p) => p.sku === oldSku)
  if (idx === -1) {
    return { success: false, error: 'ไม่พบสินค้านี้ในระบบ' }
  }

  // Check if SKU changed and if new SKU already exists
  if (oldSku !== updatedProduct.sku && products.some((p) => p.sku === updatedProduct.sku)) {
    return { success: false, error: 'SKU ใหม่มีอยู่ในระบบแล้ว' }
  }

  const oldProduct = products[idx]
  const qtyDiff = updatedProduct.qty - oldProduct.qty

  products[idx] = updatedProduct
  saveProducts(products)

  // Log stock movement if qty changed
  if (qtyDiff !== 0) {
    logMovement(
      updatedProduct.sku,
      updatedProduct.name,
      qtyDiff,
      updatedProduct.qty,
      qtyDiff > 0 ? 'แก้ไขจำนวนสต็อก (ปรับเพิ่ม)' : 'แก้ไขจำนวนสต็อก (ปรับลด)'
    )
  } else if (oldProduct.name !== updatedProduct.name) {
    logMovement(
      updatedProduct.sku,
      updatedProduct.name,
      0,
      updatedProduct.qty,
      'แก้ไขรายละเอียดสินค้า'
    )
  }
  return { success: true }
}

export const deleteProduct = (sku: string): boolean => {
  const products = getProducts()
  const product = products.find((p) => p.sku === sku)
  if (!product) return false

  const filtered = products.filter((p) => p.sku !== sku)
  saveProducts(filtered)

  // Log deletion with -qty change
  logMovement(
    sku,
    product.name,
    -product.qty,
    0,
    'ลบสินค้าออกจากระบบ'
  )
  return true
}

// Category Actions
export const addCategory = (category: Category): { success: boolean; error?: string } => {
  const categories = getCategories()
  if (categories.some((c) => c.name.toLowerCase() === category.name.toLowerCase())) {
    return { success: false, error: 'มีหมวดหมู่นี้ในระบบแล้ว' }
  }
  categories.push(category)
  saveCategories(categories)
  return { success: true }
}

export const updateCategory = (
  oldName: string,
  updatedCategory: Category
): { success: boolean; error?: string } => {
  const categories = getCategories()
  const idx = categories.findIndex((c) => c.name === oldName)
  if (idx === -1) {
    return { success: false, error: 'ไม่พบหมวดหมู่นี้' }
  }

  // Update categories lists in products
  const products = getProducts()
  let productsUpdated = false
  products.forEach((p) => {
    if (p.category === oldName) {
      p.category = updatedCategory.name
      productsUpdated = true
    }
  })

  if (productsUpdated) {
    saveProducts(products)
  }

  categories[idx] = updatedCategory
  saveCategories(categories)
  return { success: true }
}

export const deleteCategory = (name: string): { success: boolean; error?: string } => {
  const products = getProducts()
  // Check if any product is using this category
  if (products.some((p) => p.category === name)) {
    return {
      success: false,
      error: 'ไม่สามารถลบได้ เนื่องจากมีสินค้าใช้งานหมวดหมู่นี้อยู่',
    }
  }

  const categories = getCategories()
  const filtered = categories.filter((c) => c.name !== name)
  saveCategories(filtered)
  return { success: true }
}
