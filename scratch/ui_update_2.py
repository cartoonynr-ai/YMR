import re

file_path = r'C:\YMR\frontend\src\routes\inventory.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the computedBrandData block
old_computed_start = "const computedBrandData = useMemo(() => {"
old_computed_end = "  }, [products])"

# We'll use regex to replace everything between these
pattern = r"const computedBrandData = useMemo\(\(\) => \{[\s\S]*?\}, \[products\]\)"

new_computed = """const computedBrandData = useMemo(() => {
    const brandsMap = new Map<string, {
      id: string
      name: string
      modelsCount: number
      isDb: boolean
      modelsMap: Map<string, { id: string, name: string, type: string, cc: string, year: string, productsCount: number, isDb: boolean }>
      models: any[]
    }>()

    // 1. Add DB Brands
    dbBrands.forEach(b => {
      brandsMap.set(b.id, {
        id: b.id,
        name: b.name,
        modelsCount: 0,
        isDb: true,
        modelsMap: new Map(),
        models: []
      })
    })

    // 2. Add DB Models
    dbModels.forEach(m => {
      const b = brandsMap.get(m.brand_id)
      if (b) {
        b.modelsMap.set(m.name, {
          id: m.id,
          name: m.name,
          type: m.type || '-',
          cc: m.cc ? m.cc.toString() : '-',
          year: m.year_start ? `${m.year_start}-${m.year_end || ''}` : '-',
          productsCount: 0,
          isDb: true
        })
      }
    })

    // 3. Merge products text fields
    products.forEach(p => {
      if (!p.brand) return
      const bName = p.brand.trim()
      
      // Try to find if this brand name already exists in DB brands
      let brandObj = Array.from(brandsMap.values()).find(br => br.name.toLowerCase() === bName.toLowerCase())
      
      if (!brandObj) {
        const tempId = bName.toUpperCase()
        if (!brandsMap.has(tempId)) {
          brandsMap.set(tempId, { id: tempId, name: bName, modelsCount: 0, isDb: false, modelsMap: new Map(), models: [] })
        }
        brandObj = brandsMap.get(tempId)!
      }

      const compats = p.compatibility ? p.compatibility.split(',').map(s => s.trim()).filter(Boolean) : []
      compats.forEach(modelName => {
        // Find existing model by name
        let modObj = Array.from(brandObj!.modelsMap.values()).find(m => m.name.toLowerCase() === modelName.toLowerCase())
        if (!modObj) {
          brandObj!.modelsMap.set(modelName, {
            id: modelName,
            name: modelName,
            type: '-',
            cc: '-',
            year: '-',
            productsCount: 0,
            isDb: false
          })
          modObj = brandObj!.modelsMap.get(modelName)!
        }
        modObj.productsCount += 1
      })
    })

    const result = Array.from(brandsMap.values()).map(b => {
      const arr = Array.from(b.modelsMap.values())
      b.models = arr
      b.modelsCount = arr.length
      return b
    })

    return result.sort((a, b) => a.name.localeCompare(b.name))
  }, [products, dbBrands, dbModels])"""

content = re.sub(pattern, new_computed, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated computedBrandData")
