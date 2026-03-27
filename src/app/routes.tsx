import { createBrowserRouter } from 'react-router';
import { Root } from './pages/Root';
import { HomePage } from './pages/HomePage';
import { InventoryPage } from './pages/InventoryPage';
import { SalesPage } from './pages/SalesPage';
import { NewSalePage } from './pages/NewSalePage';
import { ClientsPage } from './pages/ClientsPage';
import { ReportsPage } from './pages/ReportsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: 'inventario', Component: InventoryPage },
      { path: 'ventas', Component: SalesPage },
      { path: 'ventas/nueva', Component: NewSalePage },
      { path: 'clientes', Component: ClientsPage },
      { path: 'reportes', Component: ReportsPage },
    ],
  },
]);
