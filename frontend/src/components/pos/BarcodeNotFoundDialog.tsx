import React, { useState, useMemo } from 'react';
import { X, Search, AlertTriangle, Plus } from 'lucide-react';
import { type Product, assignBarcode } from '../../services/inventory';
import { useNavigate } from '@tanstack/react-router';

interface BarcodeNotFoundDialogProps {
  isOpen: boolean;
  barcode: string;
  inventory: Product[];
  onClose: () => void;
  onSuccess: (product: Product) => void;
}

export default function BarcodeNotFoundDialog({ isOpen, barcode, inventory, onClose, onSuccess }: BarcodeNotFoundDialogProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'options' | 'search' | 'confirm'>('options');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isBinding, setIsBinding] = useState(false);
  const [error, setError] = useState('');

  // Reset state when opened
  React.useEffect(() => {
    if (isOpen) {
      setStep('options');
      setSearchTerm('');
      setShowAll(false);
      setSelectedProduct(null);
      setError('');
    }
  }, [isOpen]);

  const filteredProducts = useMemo(() => {
    let result = inventory;
    if (!showAll) {
      result = result.filter(p => !p.barcode);
    }
    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerTerm) || 
        p.sku.toLowerCase().includes(lowerTerm)
      );
    }
    return result;
  }, [inventory, showAll, searchTerm]);

  const handleBindClick = () => {
    setStep('search');
  };

  const handleCreateClick = () => {
    // Redirect to inventory with query params (or state) to prefill
    onClose();
    navigate({ to: '/inventory', search: { action: 'create', barcode } as any });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setStep('confirm');
  };

  const handleConfirmBind = async () => {
    if (!selectedProduct) return;
    setIsBinding(true);
    setError('');
    
    try {
      // API call to bind barcode
      const res = await assignBarcode(selectedProduct.id!, barcode);
      if (res.success) {
        // Return product with updated barcode to POS
        onSuccess({ ...selectedProduct, barcode });
      } else if (res.conflictProduct) {
        setError(`Barcode ถูกใช้งานอยู่แล้วโดยสินค้า: ${res.conflictProduct}`);
      } else {
        setError(res.error || 'เกิดข้อผิดพลาดในการผูก Barcode');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsBinding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">ไม่พบสินค้าสำหรับ barcode {barcode}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm font-medium rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'options' && (
            <div className="space-y-3">
              <button 
                onClick={handleBindClick}
                className="w-full p-4 border border-gray-200 rounded-xl hover:border-[#00b6d5] hover:bg-[#e6f8fb] transition-all text-left group flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-gray-900 group-hover:text-[#00b6d5]">ผูกกับสินค้าที่มีอยู่</div>
                  <div className="text-xs text-gray-500 mt-1">ค้นหาสินค้าเดิมในระบบแล้วผูกรหัสนี้เข้าไป</div>
                </div>
                <Search className="w-5 h-5 text-gray-400 group-hover:text-[#00b6d5]" />
              </button>
              
              <button 
                onClick={handleCreateClick}
                className="w-full p-4 border border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-gray-900 group-hover:text-emerald-600">สร้างสินค้าใหม่</div>
                  <div className="text-xs text-gray-500 mt-1">เพิ่มสินค้ารายการใหม่เข้าสู่ระบบ</div>
                </div>
                <Plus className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
              </button>
              
              <button 
                onClick={onClose}
                className="w-full p-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          )}

          {step === 'search' && (
            <div className="flex flex-col h-full">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="ค้นหาชื่อ หรือ SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00b6d5]"
                />
              </div>
              
              <label className="flex items-center gap-2 text-sm text-gray-600 mb-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showAll}
                  onChange={(e) => setShowAll(e.target.checked)}
                  className="rounded border-gray-300 text-[#00b6d5] focus:ring-[#00b6d5]"
                />
                แสดงสินค้าที่มีบาร์โค้ดแล้วด้วย
              </label>
              
              <div className="flex-1 overflow-y-auto space-y-2 max-h-60">
                {filteredProducts.length === 0 ? (
                  <div className="text-center text-gray-500 py-4 text-sm">ไม่พบสินค้า</div>
                ) : (
                  filteredProducts.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className="w-full text-left p-3 border border-gray-100 rounded-lg hover:border-[#00b6d5] hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-sm text-gray-900">{p.name}</div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">SKU: {p.sku}</span>
                        {p.barcode && <span className="text-xs text-amber-500">มีบาร์โค้ดแล้ว</span>}
                      </div>
                    </button>
                  ))
                )}
              </div>
              
              <button 
                onClick={() => setStep('options')}
                className="mt-4 p-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                ย้อนกลับ
              </button>
            </div>
          )}

          {step === 'confirm' && selectedProduct && (
            <div>
              <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                <div className="text-xs text-gray-500 mb-1">กำลังจะผูกบาร์โค้ด {barcode} ให้กับ:</div>
                <div className="font-bold text-gray-900">{selectedProduct.name}</div>
                <div className="text-sm text-gray-600 mt-1">SKU: {selectedProduct.sku}</div>
              </div>
              
              {selectedProduct.barcode && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-lg text-sm mb-4 flex gap-2 items-start">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="font-bold block">คำเตือน: สินค้านี้มีบาร์โค้ดอยู่แล้ว</span>
                    บาร์โค้ดเดิม <span className="font-mono">{selectedProduct.barcode}</span> จะถูกเขียนทับ
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setStep('search')}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors"
                  disabled={isBinding}
                >
                  ย้อนกลับ
                </button>
                <button 
                  onClick={handleConfirmBind}
                  className="flex-1 px-4 py-2.5 bg-[#00b6d5] hover:bg-[#00a0bc] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                  disabled={isBinding}
                >
                  {isBinding ? 'กำลังบันทึก...' : 'ยืนยันการผูก'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
