import DashboardSidebar from "@/components/DashboardSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart } from "lucide-react";
import { apiGet, apiDelete, apiPost } from "@/lib/api-client";

export default function Purchase() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const data = await apiGet('/cart');
      if (data.items) {
        setCartItems(data.items);
      } else if (Array.isArray(data)) {
        setCartItems(data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await apiGet('/verify');
        await fetchCart();
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/login");
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      await apiDelete(`/cart/${cartItemId}`);
      setCartItems(cartItems.filter((item: any) => item.id !== cartItemId));
    } catch (error) {
      alert("Error removing item from cart");
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      const checkoutData = {
        items: cartItems.map((item: any) => ({
          bookId: item.bookId,
          quantity: item.quantity,
        })),
        paymentMethod: "CARD",
      };

      const response = await apiPost('/cart/checkout', checkoutData);
      alert("Order placed successfully!");
      navigate("/issued");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Checkout failed";
      alert(errorMsg);
    }
  };

  if (checking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const total = cartItems.reduce((sum: number, item: any) => sum + item.totalPrice, 0);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div style={{ marginLeft: "var(--sidebar-width, 272px)" }}>
        <TopSearchBar />
        <main className="p-6">
          <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {cartItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-white p-4 rounded-lg shadow"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.book.title}</h3>
                      <p className="text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${item.totalPrice.toFixed(2)}</p>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 mt-2 flex items-center gap-1"
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between mb-4 text-lg">
                  <span>Subtotal:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-4 text-lg font-semibold border-t pt-4">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
