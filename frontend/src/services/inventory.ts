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
  reference_doc?: string
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
  reference_doc?: string
  document_url?: string
}

export interface Brand {
  id: string;
  name: string;
  is_deleted?: boolean | null;
}

export interface VehicleModel {
  id: string;
  brand_id: string | null;
  name: string;
  type?: string | null;
  cc?: number | null;
  year_start?: number | null;
  year_end?: number | null;
  is_deleted?: boolean | null;
}

export function formatDatabaseError(error: any, fallbackMessage: string = 'เกิดข้อผิดพลาดในการดำเนินการ'): string {
  if (!error) return fallbackMessage;
  const msg = typeof error === 'string' ? error : (error.message || '');
  const code = error?.code || '';
  const lowerMsg = msg.toLowerCase();

  // 1. Check duplicate key / unique constraint (PostgreSQL code 23505)
  if (
    code === '23505' ||
    lowerMsg.includes('unique constraint') ||
    lowerMsg.includes('duplicate key') ||
    lowerMsg.includes('already exists')
  ) {
    if (lowerMsg.includes('vehicle_models') || lowerMsg.includes('model')) {
      return 'ชื่อรุ่นรถนี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง';
    }
    if (lowerMsg.includes('brands_name_key') || lowerMsg.includes('brands') || (lowerMsg.includes('brand') && !lowerMsg.includes('brand_id'))) {
      return 'ชื่อยี่ห้อนี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง';
    }
    if (lowerMsg.includes('products_sku_key') || lowerMsg.includes('sku')) {
      return 'รหัส SKU นี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง';
    }
    if (lowerMsg.includes('products_barcode_key') || lowerMsg.includes('barcode')) {
      return 'บาร์โค้ดนี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง';
    }
    if (lowerMsg.includes('categories_name_key') || lowerMsg.includes('categories_thai_name_key') || lowerMsg.includes('categor') || lowerMsg.includes('thai_name')) {
      return 'ชื่อหมวดหมู่นี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง';
    }
    if (lowerMsg.includes('orders_order_number_key') || lowerMsg.includes('order')) {
      return 'หมายเลขคำสั่งซื้อนี้มีอยู่ในระบบแล้ว กรุณาลองใหม่อีกครั้ง';
    }
    return 'ข้อมูลนี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง (ข้อมูลซ้ำ)';
  }

  // 2. Foreign key violation (PostgreSQL code 23503)
  if (code === '23503' || lowerMsg.includes('foreign key constraint')) {
    return 'ไม่สามารถดำเนินการได้ เนื่องจากข้อมูลมีความเชื่อมโยงกับรายการอื่นในระบบ';
  }

  // 3. Not found
  if (code === 'PGRST116' || lowerMsg.includes('row not found') || lowerMsg.includes('not found')) {
    return 'ไม่พบข้อมูลที่ระบุในระบบ';
  }

  // 4. Auth errors
  if (lowerMsg.includes('not authenticated') || lowerMsg.includes('jwt') || lowerMsg.includes('unauthorized')) {
    return 'กรุณาเข้าสู่ระบบก่อนทำรายการ';
  }

  // 5. Connection errors
  if (lowerMsg.includes('failed to fetch') || lowerMsg.includes('networkerror') || lowerMsg.includes('network')) {
    return 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาตรวจสอบสัญญาณอินเทอร์เน็ต';
  }

  // If already in Thai, return as-is
  if (/[\u0E00-\u0E7F]/.test(msg)) {
    return msg;
  }

  return fallbackMessage;
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

export const getProductByBarcode = async (barcode: string): Promise<{ data?: Product; error?: string; code?: string }> => {
  const cleanBarcode = barcode.trim()
  if (!cleanBarcode) return { error: 'Barcode is required', code: 'INVALID_BARCODE' }

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (name)
    `)
    .eq('is_deleted', false)
    .eq('barcode', cleanBarcode)
    .single()

  if (error) {
    if (error.code === 'PGRST116') { // PostgREST code for 0 rows returned
      return { error: 'Product not found', code: 'BARCODE_NOT_FOUND' }
    }
    return { error: error.message, code: 'DB_ERROR' }
  }

  if (!data) return { error: 'Product not found', code: 'BARCODE_NOT_FOUND' }

  return {
    data: {
      id: data.id,
      name: data.name,
      sku: data.sku,
      barcode: data.barcode || '',
      brand: data.brand || '',
      compatibility: data.compatibility || '',
      category: (data.categories as any)?.name || '',
      category_id: data.category_id || undefined,
      price: data.price,
      qty: data.qty,
      threshold: data.threshold,
      image_url: data.image_url || undefined,
    }
  }
}

export const assignBarcode = async (productId: string, newBarcode: string): Promise<{ success: boolean; error?: string; conflictProduct?: string }> => {
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id
  
  if (!userId) {
    return { success: false, error: 'User not authenticated' }
  }

  // 1. Check if barcode is already used
  const { data: existing, error: _error } = await supabase
    .from('products')
    .select('id, name')
    .eq('barcode', newBarcode)
    .eq('is_deleted', false)
    .single()
    
  if (existing && existing.id !== productId) {
    return { success: false, error: 'Barcode already in use', conflictProduct: existing.name }
  }
  
  // 2. Get current product info for audit log
  const { data: product, error: prodError } = await supabase
    .from('products')
    .select('barcode, name')
    .eq('id', productId)
    .single()
    
  if (prodError || !product) {
    return { success: false, error: 'Product not found' }
  }
  
  const oldBarcode = product.barcode || ''

  // 3. Update barcode
  const { error: updateError } = await supabase
    .from('products')
    .update({ barcode: newBarcode })
    .eq('id', productId)
    
  if (updateError) {
    return { success: false, error: updateError.message }
  }
  
  // 4. Record audit log
  await supabase.from('audit_logs' as any).insert({
    user_id: userId,
    action: 'UPDATE_BARCODE',
    entity_type: 'product',
    entity_id: productId,
    old_value: oldBarcode,
    new_value: newBarcode,
    details: `Updated barcode for ${product.name} from ${oldBarcode} to ${newBarcode}`
  })
  
  return { success: true }
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
    timestamp: new Date(m.created_at || '').toLocaleString('th-TH', { calendar: 'gregory' }),
    sku: (m.products as any)?.sku || 'Unknown',
    productName: (m.products as any)?.name || 'Unknown',
    change: m.change,
    balance: m.balance,
    reason: m.reason,
    by: (m.users as any)?.full_name || (m.users as any)?.email || 'Unknown',
    reference_doc: m.reference_doc || '',
    document_url: m.document_url || undefined,
  }))
}

export const uploadPoDocument = async (file: File, poNumber: string): Promise<{ success: boolean; url?: string; error?: string }> => {
  const ext = file.name.split('.').pop()
  const path = `${poNumber}-${Date.now()}.${ext}`

  const { error } = await supabase.storage.from('po-documents').upload(path, file)
  if (error) return { success: false, error: formatDatabaseError(error, 'เกิดข้อผิดพลาดในการอัปโหลดเอกสาร PO') }

  const { data } = supabase.storage.from('po-documents').getPublicUrl(path)
  return { success: true, url: data.publicUrl }
}

export const addCategory = async (category: Category): Promise<{ success: boolean; error?: string }> => {
  const nameTrim = (category.name || '').trim();
  const thaiTrim = (category.thaiName || '').trim();
  if (!nameTrim || !thaiTrim) return { success: false, error: 'กรุณาระบุข้อมูลหมวดหมู่ให้ครบถ้วน' };

  // Check duplicate category name or thai_name
  const { data: existing } = await supabase
    .from('categories')
    .select('id, is_deleted, name, thai_name')
    .or(`name.ilike.${nameTrim},thai_name.ilike.${thaiTrim}`)
    .maybeSingle();

  if (existing) {
    if (existing.is_deleted) {
      const { error: restoreErr } = await supabase
        .from('categories')
        .update({ is_deleted: false, name: nameTrim, thai_name: thaiTrim })
        .eq('id', existing.id);
      if (restoreErr) return { success: false, error: formatDatabaseError(restoreErr, 'เกิดข้อผิดพลาดในการกู้คืนหมวดหมู่') };
      return { success: true };
    } else {
      return { success: false, error: 'ชื่อหมวดหมู่นี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง' };
    }
  }

  const { error } = await supabase.from('categories').insert({
    name: nameTrim,
    thai_name: thaiTrim
  });
  if (error) return { success: false, error: formatDatabaseError(error, 'เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่') };
  return { success: true };
}

export const updateCategory = async (idOrOldName: string, category: Category): Promise<{ success: boolean; error?: string }> => {
  const nameTrim = (category.name || '').trim();
  const thaiTrim = (category.thaiName || '').trim();
  if (!nameTrim || !thaiTrim) return { success: false, error: 'กรุณาระบุข้อมูลหมวดหมู่ให้ครบถ้วน' };

  let query = supabase.from('categories').select('id, name').eq('is_deleted', false);
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrOldName);
  if (isUuid) {
    query = query.eq('id', idOrOldName);
  } else {
    query = query.eq('name', idOrOldName);
  }
  const { data: catList, error: findErr } = await query;
  if (findErr || !catList || catList.length === 0) return { success: false, error: 'ไม่พบหมวดหมู่ที่ระบุในระบบ' };
  const cat = catList[0];

  // Check duplicate
  const { data: existing } = await supabase
    .from('categories')
    .select('id, is_deleted')
    .neq('id', cat.id)
    .or(`name.ilike.${nameTrim},thai_name.ilike.${thaiTrim}`)
    .eq('is_deleted', false)
    .maybeSingle();

  if (existing) {
    return { success: false, error: 'ชื่อหมวดหมู่นี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง' };
  }

  const { error } = await supabase.from('categories').update({
    name: nameTrim,
    thai_name: thaiTrim
  }).eq('id', cat.id);

  if (error) return { success: false, error: formatDatabaseError(error, 'เกิดข้อผิดพลาดในการแก้ไขหมวดหมู่') };
  return { success: true };
}

export const deleteCategory = async (idOrName: string): Promise<{ success: boolean; error?: string }> => {
  let query = supabase.from('categories').select('id, name').eq('is_deleted', false);
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrName);
  if (isUuid) {
    query = query.eq('id', idOrName);
  } else {
    query = query.eq('name', idOrName);
  }
  const { data: catList, error: findErr } = await query;
  if (findErr || !catList || catList.length === 0) return { success: false, error: 'ไม่พบหมวดหมู่ที่ระบุในระบบ' };
  const cat = catList[0];

  // Check if products exist
  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('category_id', cat.id).eq('is_deleted', false);
  if (count && count > 0) return { success: false, error: 'ไม่สามารถลบได้เนื่องจากยังมีสินค้าอยู่ในหมวดหมู่นี้' };

  const { error } = await supabase.from('categories').update({ is_deleted: true }).eq('id', cat.id);
  if (error) return { success: false, error: formatDatabaseError(error, 'เกิดข้อผิดพลาดในการลบหมวดหมู่') };
  return { success: true };
}

export const addProduct = async (product: Product): Promise<{ success: boolean; error?: string }> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;

  const skuTrim = product.sku.trim().toUpperCase();
  const barcodeTrim = (product.barcode || '').trim();

  // Check duplicate SKU
  const { data: existingSku } = await supabase
    .from('products')
    .select('id')
    .eq('sku', skuTrim)
    .eq('is_deleted', false)
    .maybeSingle();

  if (existingSku) {
    return { success: false, error: 'รหัส SKU นี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง' };
  }

  // Check duplicate Barcode
  if (barcodeTrim) {
    const { data: existingBarcode } = await supabase
      .from('products')
      .select('id')
      .eq('barcode', barcodeTrim)
      .eq('is_deleted', false)
      .maybeSingle();

    if (existingBarcode) {
      return { success: false, error: 'บาร์โค้ดนี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง' };
    }
  }

  const { data: cat } = await supabase.from('categories').select('id').eq('name', product.category).maybeSingle();
  
  const { data: newProd, error } = await supabase.from('products').insert({
    sku: skuTrim,
    barcode: barcodeTrim || null,
    name: product.name.trim(),
    brand: product.brand,
    compatibility: product.compatibility,
    category_id: cat?.id,
    price: product.price,
    qty: product.qty,
    threshold: product.threshold
  }).select().single();

  if (error) return { success: false, error: formatDatabaseError(error, 'เกิดข้อผิดพลาดในการเพิ่มสินค้าใหม่') };

  if (product.qty > 0 && newProd) {
    const { error: moveError } = await supabase.from('stock_movements').insert({
      product_id: newProd.id,
      change: product.qty,
      balance: product.qty,
      reason: 'สินค้าเข้าคลังใหม่ (สร้างสินค้า)',
      created_by: userId,
      reference_doc: product.reference_doc
    });
    if (moveError) return { success: false, error: formatDatabaseError(moveError, 'เกิดข้อผิดพลาดในการบันทึกประวัติสต็อก') };
  }
  return { success: true };
}

export const updateProduct = async (oldSku: string, product: Product, customReason?: string, documentUrl?: string): Promise<{ success: boolean; error?: string }> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;

  const { data: oldProd } = await supabase.from('products').select('*').eq('sku', oldSku).maybeSingle();
  if (!oldProd) return { success: false, error: 'ไม่พบข้อมูลสินค้าในระบบ' };

  const barcodeTrim = (product.barcode || '').trim();
  if (barcodeTrim) {
    const { data: existingBarcode } = await supabase
      .from('products')
      .select('id')
      .eq('barcode', barcodeTrim)
      .neq('id', oldProd.id)
      .eq('is_deleted', false)
      .maybeSingle();

    if (existingBarcode) {
      return { success: false, error: 'บาร์โค้ดนี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง' };
    }
  }

  const { data: cat } = await supabase.from('categories').select('id').eq('name', product.category).maybeSingle();

  const qtyDiff = product.qty - oldProd.qty;

  const { error } = await supabase.from('products').update({
    sku: product.sku.trim(),
    barcode: barcodeTrim || null,
    name: product.name.trim(),
    brand: product.brand,
    compatibility: product.compatibility,
    category_id: cat?.id,
    price: product.price,
    qty: product.qty,
    threshold: product.threshold
  }).eq('id', oldProd.id);

  if (error) return { success: false, error: formatDatabaseError(error, 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลสินค้า') };

  if (qtyDiff !== 0) {
    const { error: moveError } = await supabase.from('stock_movements').insert({
      product_id: oldProd.id,
      change: qtyDiff,
      balance: product.qty,
      reason: customReason ? customReason : (qtyDiff > 0 ? 'แก้ไขจำนวนสต็อก (ปรับเพิ่ม)' : 'แก้ไขจำนวนสต็อก (ปรับลด)'),
      created_by: userId,
      reference_doc: product.reference_doc,
      document_url: documentUrl
    });
    if (moveError) return { success: false, error: formatDatabaseError(moveError, 'เกิดข้อผิดพลาดในการบันทึกประวัติสต็อก') };
  } else if (oldProd.price !== product.price) {
    const { error: moveError } = await supabase.from('stock_movements').insert({
      product_id: oldProd.id,
      change: 0,
      balance: product.qty,
      reason: `แก้ไขราคาสินค้า (จาก ฿${oldProd.price} เป็น ฿${product.price})`,
      created_by: userId,
      reference_doc: product.reference_doc
    });
    if (moveError) return { success: false, error: formatDatabaseError(moveError, 'เกิดข้อผิดพลาดในการบันทึกประวัติสต็อก') };
  } else if (oldProd.name !== product.name) {
    const { error: moveError } = await supabase.from('stock_movements').insert({
      product_id: oldProd.id,
      change: 0,
      balance: product.qty,
      reason: 'แก้ไขรายละเอียดสินค้า',
      created_by: userId,
      reference_doc: product.reference_doc
    });
    if (moveError) return { success: false, error: formatDatabaseError(moveError, 'เกิดข้อผิดพลาดในการบันทึกประวัติสต็อก') };
  }

  return { success: true };
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

export const generateNewPoNumber = async (): Promise<string> => {
  const today = new Date()
  const day = String(today.getDate()).padStart(2, '0')
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const year = String(today.getFullYear()).slice(-2) // e.g., '26'
  
  const prefix = `PO-${day}${month}${year}-`

  const { data, error } = await supabase
    .from('stock_movements')
    .select('reference_doc')
    .like('reference_doc', `${prefix}%`)
    .order('reference_doc', { ascending: false })
    .limit(1)

  if (error) {
    console.error("Error fetching PO number:", error)
    return `${prefix}001`
  }

  if (data && data.length > 0 && data[0].reference_doc) {
    const lastDoc = data[0].reference_doc
    const lastSeqStr = lastDoc.split('-').pop()
    const lastSeq = parseInt(lastSeqStr || '0', 10)
    if (!isNaN(lastSeq)) {
      const newSeq = String(lastSeq + 1).padStart(3, '0')
      return `${prefix}${newSeq}`
    }
  }

  return `${prefix}001`
}

// --- Brands API ---
export const getBrands = async (): Promise<Brand[]> => {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('is_deleted', false)
    .order('name');
  if (error) throw error;
  return data;
}

export const addBrand = async (name: string): Promise<{ success: boolean; error?: string; data?: Brand }> => {
  try {
    const trimmedName = name.trim();
    if (!trimmedName) return { success: false, error: 'กรุณาระบุชื่อยี่ห้อรถ' };

    // Check if brand with this name already exists in DB (including soft-deleted)
    const { data: existing, error: findError } = await supabase
      .from('brands')
      .select('*')
      .ilike('name', trimmedName)
      .maybeSingle();

    if (findError && findError.code !== 'PGRST116') {
      return { success: false, error: findError.message };
    }

    if (existing) {
      if (existing.is_deleted) {
        // Automatically restore soft-deleted brand
        const { data: restored, error: restoreError } = await supabase
          .from('brands')
          .update({ is_deleted: false, name: trimmedName })
          .eq('id', existing.id)
          .select()
          .single();

        if (restoreError) return { success: false, error: restoreError.message };
        return { success: true, data: restored };
      } else {
        // Active brand already exists
        return { success: false, error: 'ชื่อยี่ห้อนี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง' };
      }
    }

    // Insert new brand
    const { data, error } = await supabase.from('brands').insert({ name: trimmedName }).select().single();
    if (error) {
      if (error.code === '23505' || error.message.includes('unique constraint') || error.message.includes('duplicate key')) {
        return { success: false, error: 'ชื่อยี่ห้อนี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง' };
      }
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'เกิดข้อผิดพลาดในการเพิ่มยี่ห้อรถ' };
  }
}

export const updateBrand = async (id: string, name: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const trimmedName = name.trim();
    if (!trimmedName) return { success: false, error: 'กรุณาระบุชื่อยี่ห้อรถ' };

    // Check if another brand with this name already exists
    const { data: existing, error: findError } = await supabase
      .from('brands')
      .select('*')
      .ilike('name', trimmedName)
      .neq('id', id)
      .maybeSingle();

    if (findError && findError.code !== 'PGRST116') {
      return { success: false, error: findError.message };
    }

    if (existing) {
      if (existing.is_deleted) {
        // Move any models belonging to the deleted brand to this brand
        await supabase
          .from('vehicle_models')
          .update({ brand_id: id })
          .eq('brand_id', existing.id);

        // Rename the deleted brand so name unique constraint won't conflict
        await supabase
          .from('brands')
          .update({ name: `${existing.name}_deleted_${Date.now()}` })
          .eq('id', existing.id);
      } else {
        // Active brand already exists with this name
        return { success: false, error: 'ชื่อยี่ห้อนี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง' };
      }
    }

    const { error } = await supabase.from('brands').update({ name: trimmedName }).eq('id', id);
    if (error) {
      if (error.code === '23505' || error.message.includes('unique constraint') || error.message.includes('duplicate key')) {
        return { success: false, error: 'ชื่อยี่ห้อนี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง' };
      }
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'เกิดข้อผิดพลาดในการแก้ไขยี่ห้อรถ' };
  }
}

export const deleteBrand = async (id: string): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.from('brands').update({ is_deleted: true }).eq('id', id);
  if (error) return { success: false, error: formatDatabaseError(error, 'เกิดข้อผิดพลาดในการลบยี่ห้อรถ') };
  return { success: true };
}

export const clearBrandFromProducts = async (brandName: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('products').update({ brand: '' }).eq('brand', brandName);
    if (error) return { success: false, error: formatDatabaseError(error, 'เกิดข้อผิดพลาดในการปรับปรุงข้อมูลสินค้า') };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: formatDatabaseError(err, 'เกิดข้อผิดพลาดในการปรับปรุงข้อมูลสินค้า') };
  }
}

// --- Vehicle Models API ---
export const getVehicleModels = async (): Promise<VehicleModel[]> => {
  const { data, error } = await supabase
    .from('vehicle_models')
    .select('*')
    .eq('is_deleted', false)
    .order('name');
  if (error) throw error;
  return data;
}

export const addVehicleModel = async (model: Partial<VehicleModel>): Promise<{ success: boolean; error?: string; data?: VehicleModel }> => {
  const trimmedName = (model.name || '').trim();
  if (!trimmedName || !model.brand_id) {
    return { success: false, error: 'กรุณาระบุข้อมูลรุ่นรถให้ครบถ้วน' };
  }

  // Check if model already exists for this brand (including soft-deleted)
  const { data: existing, error: findError } = await supabase
    .from('vehicle_models')
    .select('*')
    .eq('brand_id', model.brand_id)
    .ilike('name', trimmedName)
    .maybeSingle();

  if (findError && findError.code !== 'PGRST116') {
    return { success: false, error: formatDatabaseError(findError, 'เกิดข้อผิดพลาดในการตรวจสอบรุ่นรถ') };
  }

  if (existing) {
    if (existing.is_deleted) {
      // Auto restore soft-deleted model
      const { data: restored, error: restoreErr } = await supabase
        .from('vehicle_models')
        .update({
          is_deleted: false,
          name: trimmedName,
          type: model.type ?? existing.type,
          cc: model.cc ?? existing.cc,
          year_start: model.year_start ?? existing.year_start,
          year_end: model.year_end ?? existing.year_end
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (restoreErr) return { success: false, error: formatDatabaseError(restoreErr, 'เกิดข้อผิดพลาดในการกู้คืนรุ่นรถ') };
      return { success: true, data: restored };
    } else {
      return { success: false, error: 'ชื่อรุ่นรถนี้มีอยู่ในยี่ห้อนี้แล้ว กรุณาตรวจสอบอีกครั้ง' };
    }
  }

  const { data: inserted, error } = await supabase.from('vehicle_models').insert({
    brand_id: model.brand_id,
    name: trimmedName,
    type: model.type,
    cc: model.cc,
    year_start: model.year_start,
    year_end: model.year_end
  }).select().single();

  if (error) return { success: false, error: formatDatabaseError(error, 'เกิดข้อผิดพลาดในการเพิ่มรุ่นรถ') };
  return { success: true, data: inserted };
}

export const updateVehicleModel = async (id: string, model: Partial<VehicleModel>): Promise<{ success: boolean; error?: string }> => {
  const trimmedName = (model.name || '').trim();
  if (!trimmedName) {
    return { success: false, error: 'กรุณาระบุชื่อรุ่นรถ' };
  }

  if (model.brand_id) {
    const { data: existing } = await supabase
      .from('vehicle_models')
      .select('id, is_deleted')
      .eq('brand_id', model.brand_id)
      .ilike('name', trimmedName)
      .neq('id', id)
      .maybeSingle();

    if (existing && !existing.is_deleted) {
      return { success: false, error: 'ชื่อรุ่นรถนี้มีอยู่ในยี่ห้อนี้แล้ว กรุณาตรวจสอบอีกครั้ง' };
    }
  }

  const { error } = await supabase.from('vehicle_models').update({
    name: trimmedName,
    type: model.type,
    cc: model.cc,
    year_start: model.year_start,
    year_end: model.year_end
  }).eq('id', id);

  if (error) return { success: false, error: formatDatabaseError(error, 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลรุ่นรถ') };
  return { success: true };
}

export const deleteVehicleModel = async (id: string): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.from('vehicle_models').update({ is_deleted: true }).eq('id', id);
  if (error) return { success: false, error: formatDatabaseError(error, 'เกิดข้อผิดพลาดในการลบรุ่นรถ') };
  return { success: true };
}

export const deleteAllModelsForBrand = async (brandId: string): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.from('vehicle_models').update({ is_deleted: true }).eq('brand_id', brandId);
  if (error) return { success: false, error: formatDatabaseError(error, 'เกิดข้อผิดพลาดในการลบรุ่นรถทั้งหมด') };
  return { success: true };
}

export const receiveStock = async (items: { id: string; qty: number }[], poNumber: string): Promise<{ success: boolean; error?: string }> => {
  const { data: userData } = await supabase.auth.getSession()
  const user = userData.session?.user

  try {
    for (const item of items) {
      // Get current stock
      const { data: prod } = await supabase.from('products').select('id, qty, sku, name').eq('id', item.id).single()
      if (!prod) continue
      
      const newQty = (prod.qty || 0) + item.qty
      
      // Update stock
      await supabase.from('products').update({ qty: newQty }).eq('id', item.id)
      
      // Add movement
      await supabase.from('stock_movements').insert({
        product_id: prod.id,
        change: item.qty,
        balance: newQty,
        reason: 'Receive Stock',
        reference_doc: poNumber,
        created_by: user?.id
      })
    }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: formatDatabaseError(error, 'เกิดข้อผิดพลาดในการรับเข้าสินค้า') }
  }
}


