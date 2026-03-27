export interface Product {
  id: string;
  name: string;
  description: string;
  priceRetail: number;
  priceWholesale: number;
  priceSpecial: number;
  stock: number;
  category: string;
  sku: string;
  image?: string;
}

export type PriceType = 'retail' | 'wholesale' | 'special';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  priceType?: PriceType;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  clientId?: string;
  clientName?: string;
  items: SaleItem[];
  total: number;
  date: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
  status: 'completed' | 'pending' | 'cancelled';
}

// Initial mock data
export const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Laptop HP Pavilion',
    description: 'Laptop con procesador Intel Core i5, 8GB RAM, 256GB SSD',
    priceRetail: 799.99,
    priceWholesale: 759.99,
    priceSpecial: 729.99,
    stock: 15,
    category: 'Electrónica',
    sku: 'LAP-HP-001'
  },
  {
    id: '2',
    name: 'Mouse Logitech MX',
    description: 'Mouse inalámbrico ergonómico de alta precisión',
    priceRetail: 49.99,
    priceWholesale: 44.99,
    priceSpecial: 39.99,
    stock: 45,
    category: 'Accesorios',
    sku: 'MOU-LOG-001'
  },
  {
    id: '3',
    name: 'Teclado Mecánico RGB',
    description: 'Teclado gaming con switches mecánicos y retroiluminación RGB',
    priceRetail: 89.99,
    priceWholesale: 82.99,
    priceSpecial: 76.99,
    stock: 30,
    category: 'Accesorios',
    sku: 'KEY-RGB-001'
  },
  {
    id: '4',
    name: 'Monitor Samsung 27"',
    description: 'Monitor Full HD 27 pulgadas con panel IPS',
    priceRetail: 299.99,
    priceWholesale: 284.99,
    priceSpecial: 269.99,
    stock: 20,
    category: 'Electrónica',
    sku: 'MON-SAM-001'
  },
  {
    id: '5',
    name: 'Silla Ergonómica',
    description: 'Silla de oficina con soporte lumbar ajustable',
    priceRetail: 249.99,
    priceWholesale: 234.99,
    priceSpecial: 219.99,
    stock: 12,
    category: 'Muebles',
    sku: 'CHA-ERG-001'
  }
];

export const initialClients: Client[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    phone: '+34 600 123 456',
    address: 'Calle Mayor 123, Madrid',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria.garcia@email.com',
    phone: '+34 600 234 567',
    address: 'Avenida Principal 45, Barcelona',
    createdAt: '2024-02-20'
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@email.com',
    phone: '+34 600 345 678',
    address: 'Plaza España 7, Valencia',
    createdAt: '2024-03-10'
  }
];

export const initialSales: Sale[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Juan Pérez',
    items: [
      {
        productId: '1',
        productName: 'Laptop HP Pavilion',
        quantity: 1,
        price: 799.99,
        subtotal: 799.99
      },
      {
        productId: '2',
        productName: 'Mouse Logitech MX',
        quantity: 2,
        price: 49.99,
        subtotal: 99.98
      }
    ],
    total: 899.97,
    date: '2024-03-20T10:30:00',
    paymentMethod: 'card',
    status: 'completed'
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'María García',
    items: [
      {
        productId: '4',
        productName: 'Monitor Samsung 27"',
        quantity: 1,
        price: 299.99,
        subtotal: 299.99
      }
    ],
    total: 299.99,
    date: '2024-03-21T14:15:00',
    paymentMethod: 'cash',
    status: 'completed'
  }
];
