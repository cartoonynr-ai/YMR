import { supabase } from '../lib/supabase'

export interface Product {
  id?: string
  name: string
  sku: string
  barcode: string
  brand: string
  compatibility: string
  category: string
  category_id?: string
  price: number
  qty: number
  threshold: number
  image_url?: string
}

export interface Category {
  id?: string
  name: string
  thaiName: string
}

export interface StockMovement {
  id?: string
  timestamp: string
  sku: string
  productName: string
  change: number
  balance: number
  reason: string
  by: string
}

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_deleted', false)
    .order('name')
  
  if (error) throw error
  return data.map(c => ({
    id: c.id,
    name: c.name,
    thaiName: c.thai_name
  }))
}

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (name)
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map(p => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    barcode: p.barcode || '',
    brand: p.brand || '',
    compatibility: p.compatibility || '',
    category: (p.categories as any)?.name || '',
    category_id: p.category_id || undefined,
    price: p.price,
    qty: p.qty,
    threshold: p.threshold,
    image_url: p.image_url || undefined,
  }))
}

export const getMovements = async (): Promise<StockMovement[]> => {
  const { data, error } = await supabase
    .from('stock_movements')
    .select(`
      *,
      products (sku, name),
      users (full_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw error
  return data.map(m => ({
    id: m.id,
    timestamp: new Date(m.created_at || '').toLocaleString('th-TH'),
    sku: (m.products as any)?.sku || 'Unknown',
    productName: (m.products as any)?.name || 'Unknown',
    change: m.change,
    balance: m.balance,
    reason: m.reason,
    by: (m.users as any)?.full_name || (m.users as any)?.email || 'Unknown',
  }))
}

export const addCategory = async (category: Category): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.from('categories').insert({
    name: category.name,
    thai_name: category.thaiName
  })
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export const updateCategory = async (oldName: string, category: Category): Promise<{ success: boolean; error?: string }> => {
  // Find category first
  const { data: cat } = await supabase.from('categories').select('id').eq('name', oldName).single()
  if (!cat) return { success: false, error: 'Category not found' }

  const { error } = await supabase.from('categories').update({
    name: category.name,
    thai_name: category.thaiName
  }).eq('id', cat.id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export const deleteCategory = async (name: string): Promise<{ success: boolean; error?: string }> => {
  const { data: cat } = await supabase.from('categories').select('id').eq('name', name).single()
  if (!cat) return { success: false, error: 'Category not found' }

  // Check if products exist
  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('category_id', cat.id).eq('is_deleted', false)
  if (count && count > 0) return { success: false, error: 'Cannot delete: Products exist in this category' }

  const { error } = await supabase.from('categories').update({ is_deleted: true }).eq('id', cat.id)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export const addProduct = async (product: Product): Promise<{ success: boolean; error?: string }> => {
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id

  const { data: cat } = await supabase.from('categories').select('id').eq('name', product.category).single()
  
  const { data: newProd, error } = await supabase.from('products').insert({
    sku: product.sku,
    barcode: product.barcode,
    name: product.name,
    brand: product.brand,
    compatibility: product.compatibility,
    category_id: cat?.id,
    price: product.price,
    qty: product.qty,
    threshold: product.threshold
  }).select().single()

  if (error) return { success: false, error: error.message }

  if (product.qty > 0) {
    await supabase.from('stock_movements').insert({
      product_id: newProd.id,
      change: product.qty,
      balance: product.qty,
      reason: 'สินค้าเข้าคลังใหม่ (สร้างสินค้า)',
      created_by: userId
    })
  }
  return { success: true }
}

export const updateProduct = async (oldSku: string, product: Product): Promise<{ success: boolean; error?: string }> => {
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id

  const { data: oldProd } = await supabase.from('products').select('*').eq('sku', oldSku).single()
  if (!oldProd) return { success: false, error: 'Product not found' }

  const { data: cat } = await supabase.from('categories').select('id').eq('name', product.category).single()

  const qtyDiff = product.qty - oldProd.qty

  const { error } = await supabase.from('products').update({
    sku: product.sku,
    barcode: product.barcode,
    name: product.name,
    brand: product.brand,
    compatibility: product.compatibility,
    category_id: cat?.id,
    price: product.price,
    qty: product.qty,
    threshold: product.threshold
  }).eq('id', oldProd.id)

  if (error) return { success: false, error: error.message }

  if (qtyDiff !== 0) {
    await supabase.from('stock_movements').insert({
      product_id: oldProd.id,
      change: qtyDiff,
      balance: product.qty,
      reason: qtyDiff > 0 ? 'แก้ไขจำนวนสต็อก (ปรับเพิ่ม)' : 'แก้ไขจำนวนสต็อก (ปรับลด)',
      created_by: userId
    })
  } else if (oldProd.name !== product.name) {
    await supabase.from('stock_movements').insert({
      product_id: oldProd.id,
      change: 0,
      balance: product.qty,
      reason: 'แก้ไขรายละเอียดสินค้า',
      created_by: userId
    })
  }

  return { success: true }
}

export const deleteProduct = async (sku: string): Promise<boolean> => {
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id

  const { data: prod } = await supabase.from('products').select('*').eq('sku', sku).single()
  if (!prod) return false

  const { error } = await supabase.from('products').update({ is_deleted: true, qty: 0 }).eq('id', prod.id)
  if (error) return false

  await supabase.from('stock_movements').insert({
    product_id: prod.id,
    change: -prod.qty,
    balance: 0,
    reason: 'ลบสินค้าออกจากระบบ',
    created_by: userId
  })

  return true
}
