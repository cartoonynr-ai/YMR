import re

file_path = r'C:\YMR\frontend\src\routes\inventory.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

import_old = "import { getProducts, getCategories, addCategory, updateCategory, deleteCategory, addProduct, updateProduct, deleteProduct, Product, Category } from '../services/inventory'"
import_new = "import { getProducts, getCategories, addCategory, updateCategory, deleteCategory, addProduct, updateProduct, deleteProduct, Product, Category, getBrands, addBrand, updateBrand, deleteBrand, getVehicleModels, addVehicleModel, updateVehicleModel, deleteVehicleModel, Brand, VehicleModel } from '../services/inventory'"
content = content.replace(import_old, import_new)

state_insert = """
  // Brand & Model DB State
  const [dbBrands, setDbBrands] = useState<Brand[]>([])
  const [dbModels, setDbModels] = useState<VehicleModel[]>([])
  
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [brandFormName, setBrandFormName] = useState('')
  
  const [isModelModalOpen, setIsModelModalOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<VehicleModel | null>(null)
  const [modelForm, setModelForm] = useState<Partial<VehicleModel>>({ name: '', type: '', cc: 0, year_start: new Date().getFullYear() })
"""
content = re.sub(r"(const \[editingCategory, setEditingCategory\] = useState<Category \| null>\(null\))", r"\1\n" + state_insert, content)

load_old = """      const [prods, cats] = await Promise.all([
        getProducts(),
        getCategories()
      ])
      setProducts(prods)
      setCategories(cats)"""
load_new = """      const [prods, cats, brs, mods] = await Promise.all([
        getProducts(),
        getCategories(),
        getBrands(),
        getVehicleModels()
      ])
      setProducts(prods)
      setCategories(cats)
      setDbBrands(brs)
      setDbModels(mods)"""
content = content.replace(load_old, load_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Step 1,2,3 done")
