import re

file_path = r'C:\YMR\frontend\src\routes\inventory.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

brand_modal = """
      {/* Brand Modal */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{editingBrand ? 'แก้ไขยี่ห้อรถ' : 'เพิ่มยี่ห้อรถ'}</h3>
              <button 
                onClick={() => setIsBrandModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveBrand} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อยี่ห้อรถ *</label>
                <input
                  type="text"
                  required
                  value={brandFormName}
                  onChange={e => setBrandFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                  placeholder="เช่น HONDA, YAMAHA"
                />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Model Modal */}
      {isModelModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden my-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{editingModel ? 'แก้ไขรุ่นรถ' : 'เพิ่มรุ่นรถ'}</h3>
              <button 
                onClick={() => setIsModelModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveModel} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ยี่ห้อรถ *</label>
                <select
                  required
                  value={modelForm.brand_id || ''}
                  onChange={e => setModelForm({...modelForm, brand_id: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                >
                  <option value="">เลือกยี่ห้อรถ</option>
                  {dbBrands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อรุ่นรถ *</label>
                <input
                  type="text"
                  required
                  value={modelForm.name || ''}
                  onChange={e => setModelForm({...modelForm, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                  placeholder="เช่น PCX 160"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
                <input
                  type="text"
                  value={modelForm.type || ''}
                  onChange={e => setModelForm({...modelForm, type: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                  placeholder="เช่น ออโตเมติก, เกียร์ธรรมดา"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ซีซี (CC)</label>
                  <input
                    type="number"
                    value={modelForm.cc || ''}
                    onChange={e => setModelForm({...modelForm, cc: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ปีที่เริ่มผลิต</label>
                  <input
                    type="number"
                    value={modelForm.year_start || ''}
                    onChange={e => setModelForm({...modelForm, year_start: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModelModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
"""

pattern = r"(      \{isProductModalOpen && \()"
content = re.sub(pattern, brand_modal + r"\n\1", content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Modals added")
