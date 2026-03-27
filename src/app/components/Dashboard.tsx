import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Product, Sale, Client } from '../types';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  clients: Client[];
}

export function Dashboard({ products, sales, clients }: DashboardProps) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalClients: 0,
    lowStock: 0,
    todaySales: 0,
    monthlyRevenue: 0,
    revenueChange: 0
  });

  useEffect(() => {
    // Calculate stats
    const totalProducts = products.length;
    const totalSales = sales.filter(s => s.status === 'completed').length;
    const totalRevenue = sales
      .filter(s => s.status === 'completed')
      .reduce((sum, sale) => sum + sale.total, 0);
    const totalClients = clients.length;
    const lowStock = products.filter(p => p.stock < 10).length;

    // Today's sales
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(s => 
      s.date.startsWith(today) && s.status === 'completed'
    ).length;

    // Monthly revenue (current month)
    const currentMonth = new Date().getMonth();
    const monthlyRevenue = sales
      .filter(s => {
        const saleMonth = new Date(s.date).getMonth();
        return saleMonth === currentMonth && s.status === 'completed';
      })
      .reduce((sum, sale) => sum + sale.total, 0);

    setStats({
      totalProducts,
      totalSales,
      totalRevenue,
      totalClients,
      lowStock,
      todaySales,
      monthlyRevenue,
      revenueChange: 12.5 // Mock percentage
    });
  }, [products, sales, clients]);

  // Sales by day (last 7 days)
  const salesByDay = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const daySales = sales.filter(s => 
      s.date.startsWith(dateStr) && s.status === 'completed'
    );
    return {
      day: date.toLocaleDateString('es', { weekday: 'short' }),
      ventas: daySales.length,
      ingresos: daySales.reduce((sum, s) => sum + s.total, 0)
    };
  });

  // Top products by sales
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
  sales.filter(s => s.status === 'completed').forEach(sale => {
    sale.items.forEach(item => {
      const existing = productSales.get(item.productId) || { 
        name: item.productName, 
        quantity: 0, 
        revenue: 0 
      };
      productSales.set(item.productId, {
        name: item.productName,
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + item.subtotal
      });
    });
  });
  const topProducts = Array.from(productSales.entries())
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(([id, data]) => ({ name: data.name, quantity: data.quantity, revenue: data.revenue }));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+{stats.revenueChange}%</span> desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Ventas Totales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.todaySales} ventas hoy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {stats.lowStock > 0 && (
                <>
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">{stats.lowStock} con stock bajo</span>
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Clientes registrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas de los últimos 7 días</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ventas" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Ventas"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos más vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="quantity" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name="Cantidad vendida"
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm">{sale.clientName || 'Cliente General'}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(sale.date).toLocaleString('es')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">${sale.total.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground capitalize">{sale.paymentMethod}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}