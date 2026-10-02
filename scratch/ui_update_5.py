import re

file_path = r'C:\YMR\frontend\src\routes\inventory.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update "เพิ่มยี่ห้อรถ" button
old_add_brand = """              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-medium rounded-lg transition-all cursor-pointer">
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มยี่ห้อรถ</span>
              </button>"""
new_add_brand = """              <button 
                onClick={() => {
                  setEditingBrand(null);
                  setBrandFormName('');
                  setIsBrandModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-medium rounded-lg transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มยี่ห้อรถ</span>
              </button>"""
content = content.replace(old_add_brand, new_add_brand)

# 2. Update Compatibility Header Buttons (Edit/Delete Brand, Add Model)
old_compat_header = """              <h3 className="font-bold text-gray-900 text-lg">Compatibility</h3>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg text-sm transition-all shadow-sm cursor-pointer">
                <Plus className="w-4 h-4" />
                <span>เพิ่มรุ่น</span>
              </button>"""

new_compat_header = """              <h3 className="font-bold text-gray-900 text-lg">Compatibility</h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {(() => {
                  const currentBrand = computedBrandData.find(b => b.id === selectedBrand);
                  if (currentBrand && currentBrand.isDb) {
                    return (
                      <>
                        <button onClick={() => { setEditingBrand(currentBrand as any); setBrandFormName(currentBrand.name); setIsBrandModalOpen(true); }} className="p-2.5 text-gray-400 hover:text-primary bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" title="แก้ไขยี่ห้อรถ">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteBrand(currentBrand.id)} className="p-2.5 text-gray-400 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="ลบยี่ห้อรถ">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )
                  }
                  return null;
                })()}
                <button 
                  onClick={() => {
                    const currentBrand = computedBrandData.find(b => b.id === selectedBrand);
                    if (!currentBrand || !currentBrand.isDb) {
                      alert('กรุณากด "+ เพิ่มยี่ห้อรถ" ด้านบน แล้วสร้างยี่ห้อนี้ลงในฐานข้อมูลก่อนเพิ่มรุ่นรถครับ (ข้อมูลยี่ห้อปัจจุบันดึงมาจากชื่อสินค้าเท่านั้น)');
                      return;
                    }
                    setEditingModel(null);
                    setModelForm({ name: '', brand_id: currentBrand.id, type: '', cc: 0, year_start: new Date().getFullYear() });
                    setIsModelModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg text-sm transition-all shadow-sm cursor-pointer w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มรุ่น</span>
                </button>
              </div>"""
content = content.replace(old_compat_header, new_compat_header)

# 3. Update Model Table Actions (Edit/Delete Model)
old_model_actions = """                                <button className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer" title="แก้ไขรุ่นรถ">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="ลบรุ่นรถ">
                                  <Trash2 className="w-4 h-4" />
                                </button>"""
new_model_actions = """                                {model.isDb ? (
                                  <>
                                    <button 
                                      onClick={() => {
                                        setEditingModel(model as any);
                                        setModelForm(model as any);
                                        setIsModelModalOpen(true);
                                      }}
                                      className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer" title="แก้ไขรุ่นรถ"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteModel(model.id)}
                                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="ลบรุ่นรถ"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-xs text-gray-400" title="ข้อมูลดึงมาจากสินค้า (ไม่สามารถแก้ไขได้)">Auto</span>
                                )}"""
content = content.replace(old_model_actions, new_model_actions)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("UI connections updated")
