import { Sale } from '../types';
import { SalesHistory } from './sales/SalesHistory';

interface SalesProps {
  sales: Sale[];
}

export function Sales({ sales }: SalesProps) {
  return <SalesHistory sales={sales} />;
}
