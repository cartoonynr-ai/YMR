import re

file_path = r'C:\YMR\frontend\src\routes\inventory.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

load_old = """  const loadData = async () => {
    setProducts(await getProducts())
    setCategories(await getCategories())
    setMovements(await getMovements())
  }"""
  
load_new = """  const loadData = async () => {
    setProducts(await getProducts())
    setCategories(await getCategories())
    setMovements(await getMovements())
    setDbBrands(await getBrands())
    setDbModels(await getVehicleModels())
  }"""

content = content.replace(load_old, load_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("loadData fixed")
