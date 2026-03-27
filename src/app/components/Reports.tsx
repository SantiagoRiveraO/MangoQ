import { useMemo, useState } from 'react';
import { Sale, Product } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package } from 'lucide-react';
import { DateRangeFilter } from './sales/DateRangeFilter';

interface ReportsProps {
  sales: Sale[];
  products: Product[];
}

export function Reports({ sales, products }: ReportsProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const analytics = useMemo(() => {
    let completedSales = sales.filter(s => s.status === 'completed');

    if (dateFrom) {
      const from = new Date(dateFrom + 'T00:00:00');
      completedSales = completedSales.filter(s => new Date(s.date) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo + 'T23:59:59');
      completedSales = completedSales.filter(s => new Date(s.date) <= to);
    }
    
    // Total revenue
    const totalRevenue = completedSales.reduce((sum, sale) => sum + sale.total, 0);
    
    // Revenue by month
    const revenueByMonth = completedSales.reduce((acc, sale) => {
      const month = new Date(sale.date).toLocaleDateString('es', { month: 'short' });
      acc[month] = (acc[month] || 0) + sale.total;
      return acc;
    }, {} as Record<string, number>);
    
    const monthlyData = Object.entries(revenueByMonth).map(([month, revenue]) => ({
      month,
      revenue
    }));
    
    // Sales by payment method
    const paymentMethods = completedSales.reduce((acc, sale) => {
      acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const paymentData = Object.entries(paymentMethods).map(([method, count]) => ({
      name: method === 'cash' ? 'Efectivo' : method === 'card' ? 'Tarjeta' : 'Transferencia',
      value: count
    }));
    
    // Top selling products
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
    completedSales.forEach(sale => {
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
    
    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    // Sales by category
    const categoryRevenue = new Map<string, number>();
    completedSales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const current = categoryRevenue.get(product.category) || 0;
          categoryRevenue.set(product.category, current + item.subtotal);
        }
      });
    });
    
    const categoryData = Array.from(categoryRevenue.entries()).map(([category, revenue]) => ({
      category,
      revenue
    }));
    
    // Average sale value
    const averageSale = completedSales.length > 0 
      ? totalRevenue / completedSales.length 
      : 0;
    
    return {
      totalRevenue,
      monthlyData,
      paymentData,
      topProducts,
      categoryData,
      averageSale,
      totalSales: completedSales.length
    };
  }, [sales, products, dateFrom, dateTo]);

  const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <CardTitle>Reportes</CardTitle>
            <DateRangeFilter
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              onClear={() => { setDateFrom(''); setDateTo(''); }}
            />
          </div>
          {(dateFrom || dateTo) && (
            <p className="text-xs text-muted-foreground">
              Mostrando datos {dateFrom ? `desde ${dateFrom}` : ''} {dateTo ? `hasta ${dateTo}` : ''}
            </p>
          )}
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${analytics.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              De {analytics.totalSales} ventas completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Ticket Promedio</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${analytics.averageSale.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              Por transacción
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Productos Vendidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {analytics.topProducts.reduce((sum, p) => sum + p.quantity, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Unidades totales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.categoryData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="category" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name="Ingresos"
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.paymentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {analytics.paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Productos Más Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Posición</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Unidades Vendidas</TableHead>
                  <TableHead className="text-right">Ingresos Generados</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No hay datos de ventas
                    </TableCell>
                  </TableRow>
                ) : (
                  analytics.topProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {index === 0 && <TrendingUp className="h-4 w-4 text-yellow-500" />}
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="text-right">{product.quantity}</TableCell>
                      <TableCell className="text-right">${product.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Revenue */}
      {analytics.monthlyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name="Ingresos"
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}