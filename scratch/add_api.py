import re

file_path = r'C:\YMR\frontend\src\services\inventory.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

types_to_add = """export interface Brand {
  id: string;
  name: string;
  is_deleted?: boolean;
}

export interface VehicleModel {
  id: string;
  brand_id: string;
  name: string;
  type?: string;
  cc?: number;
  year_start?: number;
  year_end?: number;
  is_deleted?: boolean;
}
"""

types_pattern = r"(export interface StockMovement \{[\s\S]*?\})"
content = re.sub(types_pattern, r"\1\n\n" + types_to_add, content)

api_to_add = """
// --- Brands API ---
export const getBrands = async (): Promise<Brand[]> => {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('is_deleted', false)
    .order('name');
  if (error) throw error;
  return data;
}

export const addBrand = async (name: string): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.from('brands').insert({ name });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export const updateBrand = async (id: string, name: string): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.from('brands').update({ name }).eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export const deleteBrand = async (id: string): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.from('brands').update({ is_deleted: true }).eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// --- Vehicle Models API ---
export const getVehicleModels = async (): Promise<VehicleModel[]> => {
  const { data, error } = await supabase
    .from('vehicle_models')
    .select('*')
    .eq('is_deleted', false)
    .order('name');
  if (error) throw error;
  return data;
}

export const addVehicleModel = async (model: Partial<VehicleModel>): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.from('vehicle_models').insert({
    brand_id: model.brand_id,
    name: model.name,
    type: model.type,
    cc: model.cc,
    year_start: model.year_start,
    year_end: model.year_end
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export const updateVehicleModel = async (id: string, model: Partial<VehicleModel>): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.from('vehicle_models').update({
    name: model.name,
    type: model.type,
    cc: model.cc,
    year_start: model.year_start,
    year_end: model.year_end
  }).eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export const deleteVehicleModel = async (id: string): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.from('vehicle_models').update({ is_deleted: true }).eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
"""

content += api_to_add

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("API added")
