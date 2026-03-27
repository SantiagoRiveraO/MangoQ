import { supabase } from '../../lib/supabase';
import { Product } from '../types';

interface ProductRow {
  id: string;
  name: string;
  description: string;
  price?: number;
  price_retail?: number;
  price_wholesale?: number;
  price_special?: number;
  stock: number;
  category: string;
  sku: string;
  image: string | null;
}

const toProduct = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  description: row.description,
  // Fallbacks maintain compatibility if legacy `price` still exists.
  priceRetail: row.price_retail ?? row.price ?? 0,
  priceWholesale: row.price_wholesale ?? row.price ?? 0,
  priceSpecial: row.price_special ?? row.price ?? 0,
  stock: row.stock,
  category: row.category,
  sku: row.sku,
  image: row.image ?? undefined,
});

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name');

  if (error) throw error;
  return (data ?? []).map(toProduct);
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: product.name,
      description: product.description,
      price_retail: product.priceRetail,
      price_wholesale: product.priceWholesale,
      price_special: product.priceSpecial,
      stock: product.stock,
      category: product.category,
      sku: product.sku,
      image: product.image ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return toProduct(data);
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update({
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.priceRetail !== undefined && { price_retail: updates.priceRetail }),
      ...(updates.priceWholesale !== undefined && { price_wholesale: updates.priceWholesale }),
      ...(updates.priceSpecial !== undefined && { price_special: updates.priceSpecial }),
      ...(updates.stock !== undefined && { stock: updates.stock }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.sku !== undefined && { sku: updates.sku }),
      ...(updates.image !== undefined && { image: updates.image ?? null }),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return toProduct(data);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
