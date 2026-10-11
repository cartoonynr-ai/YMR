import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getProductByBarcode, assignBarcode, addBrand, updateBrand, formatDatabaseError, addVehicleModel, addCategory, updateCategory, deleteCategory, addProduct } from './inventory'
import { supabase } from '../lib/supabase'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } })
    }
  }
}))

describe('Backend: inventory.ts (AC1/AC2/AC3)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // - ค้นหาด้วย barcode ที่มีอยู่ → 200 + ข้อมูลถูกต้อง
  it('should find existing product by barcode (200 + ข้อมูลถูกต้อง)', async () => {
    const mockProduct = {
      id: 'prod-1', name: 'Test Product', sku: 'SKU-1', barcode: '123456',
      brand: '', compatibility: '', category_id: 'cat-1',
      price: 100, qty: 10, threshold: 5, categories: { name: 'Category 1' }
    }
    
    const singleMock = vi.fn().mockResolvedValue({ data: mockProduct, error: null })
    const eqMock2 = vi.fn().mockReturnValue({ single: singleMock })
    const eqMock1 = vi.fn().mockReturnValue({ eq: eqMock2 })
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock1 })
    
    vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as any)

    const result = await getProductByBarcode('123456')
    expect(result.data).toBeDefined()
    expect(result.data?.name).toBe('Test Product')
    expect(result.error).toBeUndefined()
  })

  // - barcode ไม่มีในระบบ → 404 BARCODE_NOT_FOUND
  it('should return BARCODE_NOT_FOUND when barcode does not exist in system (404 BARCODE_NOT_FOUND)', async () => {
    const singleMock = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    const eqMock2 = vi.fn().mockReturnValue({ single: singleMock })
    const eqMock1 = vi.fn().mockReturnValue({ eq: eqMock2 })
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock1 })
    
    vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as any)

    const result = await getProductByBarcode('999999')
    expect(result.data).toBeUndefined()
    expect(result.error).toBe('Product not found')
    expect(result.code).toBe('BARCODE_NOT_FOUND')
  })

  // - barcode ที่ขึ้นต้นด้วย 0 ค้นหาเจอ (ไม่ถูกตัด 0)
  it('should search with leading zeroes correctly (ไม่ถูกตัด 0)', async () => {
    const singleMock = vi.fn().mockResolvedValue({ data: { id: 'p', name: 'Test', sku: '1', barcode: '00123', price: 10, qty: 1, threshold: 1 }, error: null })
    const eqMock2 = vi.fn().mockReturnValue({ single: singleMock })
    const eqMock1 = vi.fn().mockReturnValue({ eq: eqMock2 })
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock1 })
    
    vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as any)

    const result = await getProductByBarcode('00123')
    expect(result.data?.barcode).toBe('00123')
    expect(eqMock2).toHaveBeenCalledWith('barcode', '00123')
  })

  // - ผูก barcode สำเร็จ / ผูก barcode ที่ซ้ำ → 409 / มี audit log
  it('should assign barcode successfully and create audit log', async () => {
    let callCount = 0;
    
    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === 'products') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockImplementation(() => {
                  if (callCount === 0) {
                    callCount++;
                    return Promise.resolve({ data: null, error: { code: 'PGRST116' } })
                  }
                  return Promise.resolve({ data: { name: 'P1', barcode: '' }, error: null })
                })
              }),
              single: vi.fn().mockImplementation(() => {
                  return Promise.resolve({ data: { name: 'P1', barcode: '' }, error: null })
              })
            })
          }),
          update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
        } as any
      }
      if (table === 'audit_logs') {
        return { insert: vi.fn().mockResolvedValue({ error: null }) } as any
      }
      return {} as any
    })

    const res = await assignBarcode('prod-1', 'new-barcode')
    expect(res.success).toBe(true)
  })

  it('should return conflict when barcode is used by another product (409)', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: 'other-prod', name: 'Other' }, error: null })
          })
        })
      })
    } as any)

    const res = await assignBarcode('prod-1', 'used-barcode')
    expect(res.success).toBe(false)
    expect(res.error).toBe('Barcode already in use')
    expect(res.conflictProduct).toBe('Other')
  })

  // Brands handling
  it('should restore soft-deleted brand when addBrand is called with existing deleted name', async () => {
    const mockDeletedBrand = { id: 'b-yamaha', name: 'YAMAHA', is_deleted: true }
    const mockRestoredBrand = { id: 'b-yamaha', name: 'YAMAHA', is_deleted: false }

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'brands') {
        return {
          select: vi.fn().mockReturnValue({
            ilike: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: mockDeletedBrand, error: null })
            })
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockRestoredBrand, error: null })
              })
            })
          })
        } as any
      }
      return {} as any
    })

    const res = await addBrand('YAMAHA')
    expect(res.success).toBe(true)
    expect(res.data?.name).toBe('YAMAHA')
    expect(res.data?.is_deleted).toBe(false)
  })

  it('should return polite Thai error when adding a brand that is already active', async () => {
    const mockActiveBrand = { id: 'b-honda', name: 'HONDA', is_deleted: false }

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'brands') {
        return {
          select: vi.fn().mockReturnValue({
            ilike: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: mockActiveBrand, error: null })
            })
          })
        } as any
      }
      return {} as any
    })

    const res = await addBrand('HONDA')
    expect(res.success).toBe(false)
    expect(res.error).toBe('ชื่อยี่ห้อนี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง')
  })

  it('should allow renaming brand to a soft-deleted brand name by cleaning up old record', async () => {
    const mockExistingDeleted = { id: 'old-deleted-id', name: 'YAMAHA', is_deleted: true }

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'brands') {
        return {
          select: vi.fn().mockReturnValue({
            ilike: vi.fn().mockReturnValue({
              neq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: mockExistingDeleted, error: null })
              })
            })
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null })
          })
        } as any
      }
      if (table === 'vehicle_models') {
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null })
          })
        } as any
      }
      return {} as any
    })

    const res = await updateBrand('b-bendix', 'YAMAHA')
    expect(res.success).toBe(true)
  })

  // formatDatabaseError tests
  describe('formatDatabaseError', () => {
    it('should format unique constraint errors into polite Thai', () => {
      expect(formatDatabaseError({ code: '23505', message: 'duplicate key value violates unique constraint "brands_name_key"' }))
        .toBe('ชื่อยี่ห้อนี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง')
      
      expect(formatDatabaseError({ code: '23505', message: 'duplicate key value violates unique constraint "vehicle_models_brand_id_name_key"' }))
        .toBe('ชื่อรุ่นรถนี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง')

      expect(formatDatabaseError({ code: '23505', message: 'duplicate key value violates unique constraint "products_sku_key"' }))
        .toBe('รหัส SKU นี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง')

      expect(formatDatabaseError({ code: '23505', message: 'duplicate key value violates unique constraint "products_barcode_key"' }))
        .toBe('บาร์โค้ดนี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง')

      expect(formatDatabaseError({ code: '23505', message: 'duplicate key value violates unique constraint "categories_name_key"' }))
        .toBe('ชื่อหมวดหมู่นี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง')

      expect(formatDatabaseError({ code: '23505', message: 'duplicate key value violates unique constraint "orders_order_number_key"' }))
        .toBe('หมายเลขคำสั่งซื้อนี้มีอยู่ในระบบแล้ว กรุณาลองใหม่อีกครั้ง')
    })

    it('should format foreign key and network errors', () => {
      expect(formatDatabaseError({ code: '23503', message: 'violates foreign key constraint' }))
        .toBe('ไม่สามารถดำเนินการได้ เนื่องจากข้อมูลมีความเชื่อมโยงกับรายการอื่นในระบบ')

      expect(formatDatabaseError(new Error('Failed to fetch')))
        .toBe('ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาตรวจสอบสัญญาณอินเทอร์เน็ต')
    })

    it('should preserve existing Thai error messages', () => {
      expect(formatDatabaseError('ชื่อรุ่นรถนี้มีอยู่ในยี่ห้อนี้แล้ว กรุณาตรวจสอบอีกครั้ง'))
        .toBe('ชื่อรุ่นรถนี้มีอยู่ในยี่ห้อนี้แล้ว กรุณาตรวจสอบอีกครั้ง')
    })
  })

  // Duplicate checks for vehicle models, categories, products
  describe('Duplicate Entity Handling', () => {
    it('should return Thai error when adding a duplicate vehicle model in the same brand', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            ilike: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: 'm-1', name: 'PCX 160', brand_id: 'b-honda', is_deleted: false },
                error: null
              })
            })
          })
        })
      } as any)

      const res = await addVehicleModel({ name: 'PCX 160', brand_id: 'b-honda' })
      expect(res.success).toBe(false)
      expect(res.error).toBe('ชื่อรุ่นรถนี้มีอยู่ในยี่ห้อนี้แล้ว กรุณาตรวจสอบอีกครั้ง')
    })

    it('should return Thai error when adding a duplicate category', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { id: 'c-1', name: 'Engine Oil', thai_name: 'น้ำมันเครื่อง', is_deleted: false },
              error: null
            })
          })
        })
      } as any)

      const res = await addCategory({ name: 'Engine Oil', thaiName: 'น้ำมันเครื่อง' })
      expect(res.success).toBe(false)
      expect(res.error).toBe('ชื่อหมวดหมู่นี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง')
    })

    it('should return Thai error when adding a product with duplicate SKU', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: 'p-1', sku: 'HONDA-OIL-01' },
                error: null
              })
            })
          })
        })
      } as any)

      const res = await addProduct({
        name: 'Oil',
        sku: 'HONDA-OIL-01',
        barcode: '1234567890123',
        brand: 'HONDA',
        compatibility: '',
        category: 'Engine Oil',
        price: 100,
        qty: 1,
        threshold: 1
      })
      expect(res.success).toBe(false)
      expect(res.error).toBe('รหัส SKU นี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบอีกครั้ง')
    })

    it('should successfully update category by id or name', async () => {
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'categories') {
          return {
            select: vi.fn().mockImplementation((fields: string) => {
              if (fields === 'id, name') {
                return {
                  eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                      data: [{ id: '62daec53-2ebf-4d2a-88fb-5e20786d3eb6', name: 'Spark Plugs' }],
                      error: null
                    })
                  })
                }
              }
              return {
                neq: vi.fn().mockReturnValue({
                  or: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
                    })
                  })
                })
              }
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null })
            })
          } as any
        }
        return {} as any
      })

      const res = await updateCategory('62daec53-2ebf-4d2a-88fb-5e20786d3eb6', {
        name: 'Spark Plugs',
        thaiName: 'หัวเทียน'
      })
      expect(res.success).toBe(true)
    })

    it('should block deleting category when products are still assigned', async () => {
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'categories') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  data: [{ id: 'cat-with-products', name: 'Spark Plugs' }],
                  error: null
                })
              })
            })
          } as any
        }
        if (table === 'products') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ count: 5, error: null })
              })
            })
          } as any
        }
        return {} as any
      })

      const res = await deleteCategory('cat-with-products')
      expect(res.success).toBe(false)
      expect(res.error).toBe('ไม่สามารถลบได้เนื่องจากยังมีสินค้าอยู่ในหมวดหมู่นี้')
    })
  })
})
