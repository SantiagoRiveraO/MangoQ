import { Outlet } from 'react-router';
import { useState, useEffect, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { Product, Sale, Client } from '../types';
import { fetchProducts } from '../services/productService';
import { fetchClients } from '../services/clientService';
import { fetchSales } from '../services/saleService';

export function Root() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsData, clientsData, salesData] = await Promise.all([
        fetchProducts(),
        fetchClients(),
        fetchSales(),
      ]);
      setProducts(productsData);
      setClients(clientsData);
      setSales(salesData);
    } catch (err) {
      console.error('Error cargando datos de Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Outlet context={{ products, sales, clients, setProducts, setSales, setClients, refreshData: loadData }} />
    </Layout>
  );
}
