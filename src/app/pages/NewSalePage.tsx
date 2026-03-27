import { useOutletContext } from 'react-router';
import { NewSale } from '../components/sales/NewSale';
import { Product, Sale, Client } from '../types';

interface OutletContext {
  products: Product[];
  sales: Sale[];
  clients: Client[];
  setProducts: (products: Product[]) => void;
  setSales: (sales: Sale[]) => void;
  refreshData: () => Promise<void>;
}

export function NewSalePage() {
  const { products, sales, clients, setProducts, setSales, refreshData } = useOutletContext<OutletContext>();

  return (
    <NewSale
      products={products}
      sales={sales}
      clients={clients}
      onUpdateSales={setSales}
      onUpdateProducts={setProducts}
      refreshData={refreshData}
    />
  );
}
