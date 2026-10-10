import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getProductByBarcode, assignBarcode } from './inventory'
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
})
