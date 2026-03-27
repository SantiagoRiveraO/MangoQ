import { useOutletContext } from 'react-router';
import { Dashboard } from '../components/Dashboard';
import { Product, Sale, Client } from '../types';

interface OutletContext {
  products: Product[];
  sales: Sale[];
  clients: Client[];
}

export function HomePage() {
  const { products, sales, clients } = useOutletContext<OutletContext>();
  
  return <Dashboard products={products} sales={sales} clients={clients} />;
}
