import re

file_path = r'C:\YMR\frontend\src\routes\inventory.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

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

content = content.replace(state_insert, '')
content = content.replace('const computedBrandData = useMemo', state_insert + '\n  const computedBrandData = useMemo')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed order")
