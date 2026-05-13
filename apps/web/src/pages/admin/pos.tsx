import { useState } from "react";
import { usePosSearchBooks, usePosCheckout, useListCustomers } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, Smartphone, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "@/components/AdminSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";

type CartItem = {
  bookId: number;
  title: string;
  price: number;
  quantity: number;
};

const PAYMENT_METHODS = [
  { value: "card", label: "Card", icon: CreditCard },
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "upi", label: "UPI", icon: Smartphone },
] as const;

type PaymentMethod = "card" | "cash" | "upi";

export default function AdminPOS() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [discount, setDiscount] = useState(0);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const { data: searchResults, isLoading: searching } = usePosSearchBooks(
    search.length >= 1 ? { q: search } : undefined
  );
  const { data: customersRes } = useListCustomers();
  const customers = customersRes?.data ?? [];
  const checkout = usePosCheckout();
  const queryClient = useQueryClient();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = 0.085;
  const taxAmount = (subtotal - discount) * taxRate;
  const total = subtotal - discount + taxAmount;

  function addToCart(book: { id: number; title: string; price: number; stock: number }) {
    if (book.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.bookId === book.id);
      if (existing) {
        if (existing.quantity >= book.stock) return prev;
        return prev.map(i => i.bookId === book.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { bookId: book.id, title: book.title, price: book.price, quantity: 1 }];
    });
  }

  function updateQty(bookId: number, delta: number) {
    setCart(prev =>
      prev.map(i => i.bookId === bookId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)
    );
  }

  function removeItem(bookId: number) {
    setCart(prev => prev.filter(i => i.bookId !== bookId));
  }

  function clearCart() {
    setCart([]);
    setDiscount(0);
    setSelectedCustomerId(null);
    setCheckoutSuccess(false);
    setCheckoutError(null);
  }

  async function handleCheckout() {
    if (cart.length === 0) return;
    setCheckoutError(null);
    try {
      await checkout.mutateAsync({
        data: {
          items: cart.map(i => ({ bookId: i.bookId, quantity: i.quantity, unitPrice: i.price })),
          paymentMethod,
          customerId: selectedCustomerId ?? undefined,
          discount,
          tax: Math.round(taxAmount * 100) / 100,
          total: Math.round(total * 100) / 100,
        },
      });
      await queryClient.invalidateQueries();
      setCheckoutSuccess(true);
      setTimeout(() => {
        clearCart();
        setCheckoutSuccess(false);
      }, 2500);
    } catch {
      setCheckoutError("Checkout failed. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
        <p className="text-muted-foreground">Process walk-in sales and transactions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Search Books</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by title, author, or ISBN..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {search.length > 0 && (
                <div className="border rounded-md divide-y max-h-80 overflow-y-auto">
                  {searching ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">Searching...</div>
                  ) : !searchResults?.length ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">No books found.</div>
                  ) : (
                    searchResults.map((book) => (
                      <div key={book.id} className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{book.title}</p>
                          <p className="text-xs text-muted-foreground">{book.author} · {book.category}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-4 shrink-0">
                          <div className="text-right">
                            <p className="font-semibold text-sm">${book.price.toFixed(2)}</p>
                            <p className={`text-xs ${book.stock > 0 ? "text-muted-foreground" : "text-destructive"}`}>
                              {book.stock > 0 ? `${book.stock} in stock` : "Out of stock"}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            disabled={book.stock <= 0}
                            onClick={() => addToCart(book)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Cart {cart.length > 0 && <Badge variant="secondary">{cart.length}</Badge>}
                </CardTitle>
                {cart.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCart} className="text-muted-foreground">
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                  <ShoppingCart className="h-10 w-10 opacity-20" />
                  <p className="text-sm">Cart is empty. Search for books to add.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {cart.map(item => (
                    <div key={item.bookId} className="flex items-center gap-3 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.bookId, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.bookId, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="w-16 text-right text-sm font-semibold shrink-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeItem(item.bookId)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer (optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={selectedCustomerId ?? ""}
                onChange={e => setSelectedCustomerId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Walk-in Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} — {c.tier}</option>
                ))}
              </select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setPaymentMethod(value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-sm font-medium transition-all ${paymentMethod === value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/50"
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Discount ($)</span>
                <Input
                  type="number"
                  min={0}
                  max={subtotal}
                  step={0.01}
                  value={discount}
                  onChange={e => setDiscount(Math.max(0, Math.min(subtotal, Number(e.target.value))))}
                  className="w-24 h-7 text-right text-sm"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (8.5%)</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {checkoutSuccess && (
                <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-400 text-center font-medium">
                  Sale completed successfully!
                </div>
              )}
              {checkoutError && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive text-center">
                  {checkoutError}
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                disabled={cart.length === 0 || checkout.isPending || checkoutSuccess}
                onClick={handleCheckout}
              >
                {checkout.isPending ? "Processing..." : `Charge $${total.toFixed(2)}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
