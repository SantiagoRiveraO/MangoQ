import { useOutletContext } from 'react-router';
import { Sales } from '../components/Sales';
import { Sale } from '../types';

interface OutletContext {
  sales: Sale[];
}

export function SalesPage() {
  const { sales } = useOutletContext<OutletContext>();
  
  return <Sales sales={sales} />;
}
