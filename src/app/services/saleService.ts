import { supabase } from '../../lib/supabase';
import { Sale, SaleItem } from '../types';

interface SaleRow {
  id: string;
  client_id: string | null;
  total: number;
  payment_method: 'cash' | 'card' | 'transfer';
  status: 'completed' | 'pending' | 'cancelled';
  created_at: string;
  clients: { name: string } | null;
  sale_items: SaleItemRow[];
}

interface SaleItemRow {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  subtotal: number;
  products: { name: string } | null;
}

const toSaleItem = (row: SaleItemRow): SaleItem => ({
  productId: row.product_id,
  productName: row.products?.name ?? '',
  quantity: row.quantity,
  price: row.price,
  subtotal: row.subtotal,
});

const toSale = (row: SaleRow): Sale => ({
  id: row.id,
  clientId: row.client_id ?? undefined,
  clientName: row.clients?.name,
  items: (row.sale_items ?? []).map(toSaleItem),
  total: row.total,
  date: row.created_at,
  paymentMethod: row.payment_method,
  status: row.status,
});

export async function fetchSales(): Promise<Sale[]> {
  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      clients ( name ),
      sale_items (
        id,
        product_id,
        quantity,
        price,
        subtotal,
        products ( name )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toSale);
}

export interface RegisterSaleParams {
  clientId?: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}

export async function registerSale(params: RegisterSaleParams): Promise<string> {
  const { data, error } = await supabase.rpc('register_sale', {
    p_client_id: params.clientId ?? null,
    p_payment_method: params.paymentMethod,
    p_items: params.items,
  });

  if (error) throw error;
  return data as string;
}
