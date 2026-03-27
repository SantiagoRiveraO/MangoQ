import { useOutletContext } from 'react-router';
import { Reports } from '../components/Reports';
import { Product, Sale } from '../types';

interface OutletContext {
  products: Product[];
  sales: Sale[];
}

export function ReportsPage() {
  const { products, sales } = useOutletContext<OutletContext>();
  
  return <Reports sales={sales} products={products} />;
}
