import re

file_path = r'C:\YMR\frontend\src\routes\inventory.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

handlers = """
  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!brandFormName.trim()) return
    
    try {
      if (editingBrand) {
        await updateBrand(editingBrand.id, brandFormName)
      } else {
        await addBrand(brandFormName)
      }
      await loadData()
      setIsBrandModalOpen(false)
    } catch (err: any) {
      alert(err.message || 'Error saving brand')
    }
  }

  const handleDeleteBrand = async (id: string) => {
    if (!confirm('ยืนยันการลบยี่ห้อรถนี้?')) return
    try {
      await deleteBrand(id)
      await loadData()
    } catch (err: any) {
      alert(err.message || 'Error deleting brand')
    }
  }

  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modelForm.name || !modelForm.brand_id) return
    
    try {
      if (editingModel) {
        await updateVehicleModel(editingModel.id, modelForm)
      } else {
        await addVehicleModel(modelForm)
      }
      await loadData()
      setIsModelModalOpen(false)
    } catch (err: any) {
      alert(err.message || 'Error saving model')
    }
  }

  const handleDeleteModel = async (id: string) => {
    if (!confirm('ยืนยันการลบรุ่นรถนี้?')) return
    try {
      await deleteVehicleModel(id)
      await loadData()
    } catch (err: any) {
      alert(err.message || 'Error deleting model')
    }
  }
"""

# Insert handlers before `const handleSaveCategory = async`
pattern = r"(const handleSaveCategory = async)"
content = re.sub(pattern, handlers + r"\n  \1", content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Handlers added")
