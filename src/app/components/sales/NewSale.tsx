import { useRef, useState, type KeyboardEvent } from 'react';
import { Client, Product, Sale, SaleItem } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Search, ShoppingCart, Minus, Plus, Trash2, ReceiptText, CheckCircle, Printer } from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog';
import { paymentLabels } from './paymentLabels';
import { ClientSearchSelect } from './ClientSearchSelect';
import { registerSale } from '../../services/saleService';

interface NewSaleProps {
  products: Product[];
  sales: Sale[];
  clients: Client[];
  onUpdateSales: (sales: Sale[]) => void;
  onUpdateProducts: (products: Product[]) => void;
  refreshData?: () => Promise<void>;
}

type PaymentMethod = 'cash' | 'card' | 'transfer';

export function NewSale({
  products,
  sales,
  clients,
  onUpdateSales,
  onUpdateProducts,
  refreshData,
}: NewSaleProps) {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('none');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [searchTerm, setSearchTerm] = useState('');
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [processing, setProcessing] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const firstAvailableProduct = filteredProducts.find((product) => product.stock > 0);

  const handleProductSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && firstAvailableProduct) {
      event.preventDefault();
      addToCart(firstAvailableProduct);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.productId === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        ));
      }
      return;
    }

    if (product.stock > 0) {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        subtotal: product.price,
      }]);
    }
  };

  const updateQuantity = (productId: string, change: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCart(cart
      .map((item) => {
        if (item.productId === productId) {
          const newQuantity = Math.max(0, Math.min(item.quantity + change, product.stock));
          return {
            ...item,
            quantity: newQuantity,
            subtotal: newQuantity * item.price,
          };
        }
        return item;
      })
      .filter((item) => item.quantity > 0));
  };

  const setQuantity = (productId: string, rawValue: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const parsedValue = Number(rawValue);
    const safeQuantity = Number.isFinite(parsedValue)
      ? Math.max(1, Math.min(Math.floor(parsedValue), product.stock))
      : 1;

    setCart(cart.map((item) =>
      item.productId === productId
        ? { ...item, quantity: safeQuantity, subtotal: safeQuantity * item.price }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const getProductStock = (productId: string) =>
    products.find((product) => product.id === productId)?.stock ?? 0;

  const calculateTotal = () => cart.reduce((sum, item) => sum + item.subtotal, 0);

  const completeSale = async () => {
    if (cart.length === 0 || processing) return;

    setProcessing(true);
    try {
      const saleId = await registerSale({
        clientId: selectedClient !== 'none' ? selectedClient : undefined,
        paymentMethod,
        items: cart.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        })),
      });

      const registeredSale: Sale = {
        id: saleId,
        clientId: selectedClient !== 'none' ? selectedClient : undefined,
        clientName: clients.find((c) => c.id === selectedClient)?.name,
        items: cart,
        total: calculateTotal(),
        date: new Date().toISOString(),
        paymentMethod,
        status: 'completed',
      };

      setCompletedSale(registeredSale);
      setCart([]);
      setSelectedClient('none');
      setPaymentMethod('cash');

      if (refreshData) {
        await refreshData();
      }
    } catch (err) {
      console.error('Error registrando venta:', err);
      alert('Error al registrar la venta. Revisa la consola.');
    } finally {
      setProcessing(false);
    }
  };

  const handleQuickCompleteSale = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && cart.length > 0) {
      event.preventDefault();
      completeSale();
    }
  };

  const handlePrint = () => {
    if (!receiptRef.current) return;
    const printContents = receiptRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Comprobante de Venta</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; font-size: 13px; color: #000; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 4px 0; text-align: left; }
            td.right, th.right { text-align: right; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const ReceiptContent = ({ sale }: { sale: Sale }) => (
    <div ref={receiptRef} style={{ fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6' }}>
      <div className="center bold" style={{ textAlign: 'center', marginBottom: 4 }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>COMPROBANTE DE VENTA</div>
      </div>
      <div className="divider" style={{ borderTop: '1px dashed #aaa', margin: '8px 0' }} />
      <div>Nº: #{sale.id.slice(-6).toUpperCase()}</div>
      <div>Fecha: {new Date(sale.date).toLocaleString('es')}</div>
      <div>Cliente: {sale.clientName || 'Cliente General'}</div>
      <div>Pago: {paymentLabels[sale.paymentMethod]}</div>
      <div className="divider" style={{ borderTop: '1px dashed #aaa', margin: '8px 0' }} />
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', paddingBottom: 4 }}>Producto</th>
            <th style={{ textAlign: 'center' }}>Cant.</th>
            <th style={{ textAlign: 'right' }}>Precio</th>
            <th style={{ textAlign: 'right' }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item, i) => (
            <tr key={i}>
              <td style={{ paddingRight: 8 }}>{item.productName}</td>
              <td style={{ textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right' }}>${item.price.toFixed(2)}</td>
              <td style={{ textAlign: 'right' }}>${item.subtotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="divider" style={{ borderTop: '1px dashed #aaa', margin: '8px 0' }} />
      <table style={{ width: '100%' }}>
        <tbody>
          <tr>
            <td style={{ fontWeight: 'bold', fontSize: '15px' }}>TOTAL</td>
            <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '15px' }}>${sale.total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <div className="divider" style={{ borderTop: '1px dashed #aaa', margin: '8px 0' }} />
      <div style={{ textAlign: 'center', color: '#555', fontSize: '12px' }}>¡Gracias por su compra!</div>
    </div>
  );

  return (
    <div className="space-y-6" onKeyDown={handleQuickCompleteSale}>
      <Dialog open={!!completedSale} onOpenChange={(open) => { if (!open) setCompletedSale(null); }}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center gap-2 pb-2 pt-1">
            <CheckCircle className="h-10 w-10 text-green-500" />
            <h2 className="text-lg" style={{ fontWeight: 600 }}>Venta Registrada</h2>
            <p className="text-sm text-muted-foreground">La venta se completó exitosamente</p>
          </div>

          {completedSale && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-muted-foreground">Nº de Venta</p>
                  <p className="font-mono">#{completedSale.id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p>{new Date(completedSale.date).toLocaleString('es')}</p>
                </div>
              </div>

              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p>{completedSale.clientName || 'Cliente General'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Método de Pago</p>
                  <p>{paymentLabels[completedSale.paymentMethod]}</p>
                </div>
              </div>

              <div className="border-t border-dashed border-border pt-3">
                <p className="text-xs text-muted-foreground mb-2">Productos vendidos</p>
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
                    {completedSale.items.map((item, i) => (
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
                  ${completedSale.total.toFixed(2)}
                </span>
              </div>

              <div style={{ display: 'none' }}>
                <ReceiptContent sale={completedSale} />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button className="flex-1" onClick={() => setCompletedSale(null)}>
              Nueva Venta
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2 min-w-0">
          <CardHeader>
            <CardTitle>Productos</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar productos por nombre o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleProductSearchKeyDown}
                className="pl-10"
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Presiona Enter para agregar el primer resultado disponible.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 max-h-[228px] overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">
                  No se encontraron productos
                </p>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between rounded-lg border border-border p-3 transition-colors ${
                      product.stock === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-accent cursor-pointer'
                    }`}
                    onClick={() => product.stock > 0 && addToCart(product)}
                  >
                    <div>
                      <p>{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p>${product.price.toFixed(2)}</p>
                      <p className={`text-xs ${product.stock === 0 ? 'text-red-500' : product.stock < 10 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                        Stock: {product.stock}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Carrito
              {cart.length > 0 && (
                <Badge className="ml-auto bg-primary text-primary-foreground">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cliente (Opcional)</Label>
              <ClientSearchSelect
                clients={clients}
                value={selectedClient}
                onChange={setSelectedClient}
              />
              <p className="text-xs text-muted-foreground">
                Escribe para filtrar clientes por nombre, correo o telefono.
              </p>
            </div>

            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                  <ShoppingCart className="h-8 w-8 opacity-30" />
                  <p className="text-sm">Carrito vacío</p>
                </div>
              ) : (
                cart.map((item) => {
                  const itemStock = getProductStock(item.productId);
                  const isAtMin = item.quantity <= 1;
                  const isAtMax = item.quantity >= itemStock;

                  return (
                    <div key={item.productId} className="flex items-center gap-2 border border-border rounded-lg p-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          ${item.price.toFixed(2)} × {item.quantity} = <span className="text-foreground">${item.subtotal.toFixed(2)}</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Max: {itemStock}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.productId, -1)}
                          disabled={isAtMin}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          max={itemStock}
                          value={item.quantity}
                          onChange={(e) => setQuantity(item.productId, e.target.value)}
                          className="h-7 w-16 text-center px-2"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.productId, 1)}
                          disabled={isAtMax}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="space-y-2">
              <Label>Método de Pago</Label>
              <Select value={paymentMethod} onValueChange={(v: PaymentMethod) => setPaymentMethod(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="card">Tarjeta</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {cart.length > 0 && (
              <div className="rounded-lg bg-muted/40 p-3 space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span style={{ fontWeight: 600 }}>Total a cobrar</span>
                  <span style={{ fontWeight: 700 }} className="text-primary text-base">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              onClick={completeSale}
              disabled={cart.length === 0 || processing}
            >
              <ReceiptText className="h-4 w-4 mr-2" />
              {processing ? 'Procesando...' : 'Registrar Venta'}
            </Button>

            {cart.length > 0 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCart([]);
                  setSelectedClient('none');
                }}
              >
                Vaciar Carrito
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
