import { useState, useMemo, useEffect } from 'react';
import { X, Search, Package, Plus, Trash2, Save } from 'lucide-react';
import { type Product, receiveStock, formatDatabaseError } from '../../services/inventory';

interface ReceiveStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Product[];
  onSuccess: () => void;
}

export default function ReceiveStockModal({ isOpen, onClose, inventory, onSuccess }: ReceiveStockModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ product: Product; receiveQty: number }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [poNumber, setPoNumber] = useState('');

  // Generate default PO when opened
  useEffect(() => {
    if (isOpen) {
      const date = new Date();
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setPoNumber(`PO-${yyyy}${mm}${dd}-${random}`);
      setSearchTerm('');
      setSelectedItems([]);
    }
  }, [isOpen]);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const query = searchTerm.toLowerCase();
    return inventory.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.sku.toLowerCase().includes(query) ||
      (p.barcode && p.barcode.toLowerCase().includes(query))
    ).slice(0, 5); // show top 5 results
  }, [searchTerm, inventory]);

  const handleSelectProduct = (product: Product) => {
    if (!selectedItems.find(item => item.product.id === product.id)) {
      setSelectedItems([...selectedItems, { product, receiveQty: 1 }]);
    }
    setSearchTerm('');
  };

  const handleUpdateQty = (id: string, qty: string) => {
    const val = parseInt(qty) || 0;
    setSelectedItems(prev => prev.map(item => item.product.id === id ? { ...item, receiveQty: val } : item));
  };

  const handleRemove = (id: string) => {
    setSelectedItems(prev => prev.filter(item => item.product.id !== id));
  };

  const handleSave = async () => {
    if (selectedItems.length === 0) return;
    if (!poNumber.trim()) {
      alert("กรุณาระบุเลขที่เอกสาร PO");
      return;
    }

    setIsSaving(true);
    const itemsToReceive = selectedItems.map(item => ({
      id: item.product.id!,
      qty: item.receiveQty
    }));

    const result = await receiveStock(itemsToReceive, poNumber);
    setIsSaving(false);

    if (result.success) {
      onSuccess();
    } else {
      alert(formatDatabaseError(result.error, "เกิดข้อผิดพลาดในการรับเข้าสินค้า กรุณาลองใหม่อีกครั้ง"));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">รับเข้าสินค้า (Receive Stock)</h2>
            <p className="text-sm text-gray-500 mt-1">รับเข้าสินค้าและสร้างประวัติการรับเข้าใน Stock History</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">เลขที่อ้างอิง / PO Number</label>
            <input 
              type="text" 
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="เช่น PO-20231011-001"
            />
          </div>

          <div className="mb-6 relative">
            <label className="block text-sm font-semibold text-gray-900 mb-2">ค้นหาสินค้าเพื่อรับเข้า</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อ, SKU หรือ Barcode..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
            
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Package size={16} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-sm truncate">{product.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">SKU: {product.sku} | Barcode: {product.barcode || '-'}</div>
                    </div>
                    <Plus size={16} className="text-gray-400 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">รายการที่ต้องการรับเข้า ({selectedItems.length} รายการ)</label>
            {selectedItems.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center">
                <p className="text-sm text-gray-500 font-medium">ยังไม่มีสินค้าที่เลือก<br/>พิมพ์ค้นหาด้านบนเพื่อเลือกสินค้า</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">สินค้า</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center w-32">จำนวนรับเข้า</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map(({ product, receiveQty }) => (
                      <tr key={product.id} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3">
                          <div className="font-bold text-sm text-gray-900 truncate">{product.name}</div>
                          <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="number"
                            min="1"
                            value={receiveQty}
                            onChange={(e) => handleUpdateQty(product.id!, e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-center focus:ring-2 focus:ring-primary outline-none"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => handleRemove(product.id!)}
                            className="text-gray-400 hover:text-rose-500 transition-colors p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || selectedItems.length === 0 || !poNumber.trim()}
            className="px-5 py-2.5 text-sm font-bold text-white bg-[#00b6d5] hover:bg-[#0095a8] rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <span>กำลังบันทึก...</span>
            ) : (
              <>
                <Save size={16} />
                <span>บันทึกรับเข้า</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
