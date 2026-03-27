import { useMemo, useState } from 'react';
import { Sale } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Search, ReceiptText, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog';
import { paymentLabels } from './paymentLabels';
import { DateRangeFilter } from './DateRangeFilter';

interface SalesHistoryProps {
  sales: Sale[];
}

export function SalesHistory({ sales }: SalesHistoryProps) {
  const [historySearch, setHistorySearch] = useState('');
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchesSearch =
        sale.clientName?.toLowerCase().includes(historySearch.toLowerCase()) ||
        sale.id.includes(historySearch);

      const saleDate = new Date(sale.date);
      const matchesFrom = dateFrom ? saleDate >= new Date(dateFrom + 'T00:00:00') : true;
      const matchesTo = dateTo ? saleDate <= new Date(dateTo + 'T23:59:59') : true;

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [sales, historySearch, dateFrom, dateTo]);

  const clearDates = () => {
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="space-y-6">
      <Dialog open={!!viewingSale} onOpenChange={(open) => { if (!open) setViewingSale(null); }}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center gap-2 pb-2">
            <ReceiptText className="h-5 w-5 text-primary" />
            <h2 className="text-base" style={{ fontWeight: 600 }}>Detalle de Venta</h2>
          </div>

          {viewingSale && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-muted-foreground">Nº de Venta</p>
                  <p className="font-mono">#{viewingSale.id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p>{new Date(viewingSale.date).toLocaleString('es')}</p>
                </div>
              </div>

              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p>{viewingSale.clientName || 'Cliente General'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Método de Pago</p>
                  <p>{paymentLabels[viewingSale.paymentMethod]}</p>
                </div>
              </div>

              <div className="border-t border-dashed border-border pt-3">
                <p className="text-xs text-muted-foreground mb-2">Productos</p>
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-muted-foreground">
                      <th className="text-left pb-1">Producto</th>
                      <th className="text-center pb-1">Cant.</th>
                      <th className="text-right pb-1">Precio</th>
                      <th className="text-right pb-1">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingSale.items.map((item, i) => (
                      <tr key={i} className="border-t border-border/50">
                        <td className="py-1 pr-2 text-xs">{item.productName}</td>
                        <td className="py-1 text-center text-xs">{item.quantity}</td>
                        <td className="py-1 text-right text-xs">${item.price.toFixed(2)}</td>
                        <td className="py-1 text-right text-xs">${item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-dashed border-border pt-3 flex justify-between items-center">
                <span style={{ fontWeight: 700, fontSize: '15px' }}>TOTAL</span>
                <span style={{ fontWeight: 700, fontSize: '18px' }} className="text-primary">
                  ${viewingSale.total.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <Button variant="outline" onClick={() => setViewingSale(null)}>Cerrar</Button>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Ventas</CardTitle>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente o ID..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <DateRangeFilter
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              onClear={clearDates}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table className="min-w-[750px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Venta</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No se encontraron ventas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono text-xs">
                        #{sale.id.slice(-6).toUpperCase()}
                      </TableCell>
                      <TableCell>{sale.clientName || 'Cliente General'}</TableCell>
                      <TableCell>
                        {new Date(sale.date).toLocaleDateString('es')}{' '}
                        <span className="text-muted-foreground text-xs">
                          {new Date(sale.date).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </TableCell>
                      <TableCell>{sale.items.length} producto{sale.items.length !== 1 ? 's' : ''}</TableCell>
                      <TableCell>{paymentLabels[sale.paymentMethod]}</TableCell>
                      <TableCell className="text-right">${sale.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={sale.status === 'completed' ? 'default' : 'destructive'}
                          className={sale.status === 'completed' ? 'bg-green-500 hover:bg-green-500' : ''}
                        >
                          {sale.status === 'completed' ? 'Completada' : 'Pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingSale(sale)}
                          title="Ver comprobante"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
