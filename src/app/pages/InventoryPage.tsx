import { useOutletContext } from 'react-router';
import { Inventory } from '../components/Inventory';
import { Product } from '../types';

interface OutletContext {
  products: Product[];
  setProducts: (products: Product[]) => void;
}

export function InventoryPage() {
  const { products, setProducts } = useOutletContext<OutletContext>();
  
  return <Inventory products={products} onUpdateProducts={setProducts} />;
}
