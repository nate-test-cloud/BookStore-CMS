import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import { apiGet } from "@/lib/api-client";

export default function Issued() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const data = await apiGet('/purchases');
        if (data.purchases) {
          setPurchases(data.purchases);
        } else if (Array.isArray(data)) {
          setPurchases(data);
        }
      } catch (error) {
        console.error("Error fetching purchases:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading purchases...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div style={{ marginLeft: "var(--sidebar-width, 272px)" }}>
        <TopSearchBar />
        <main className="p-6">
          <h1 className="text-3xl font-bold mb-6">Purchase History</h1>

          {purchases.length === 0 ? (
            <p className="text-gray-500">No purchases yet</p>
          ) : (
            <div className="space-y-4">
              {purchases.map((purchase: any) => (
                <div key={purchase.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">Order #{purchase.orderNumber}</h3>
                      <p className="text-gray-600">
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded text-sm font-medium ${
                        purchase.status === 'DELIVERED' 
                          ? 'bg-green-100 text-green-800'
                          : purchase.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {purchase.status}
                      </span>
                      <p className="text-lg font-semibold mt-2">${purchase.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Items:</h4>
                    <div className="space-y-1">
                      {purchase.items?.map((item: any, idx: number) => (
                        <p key={idx} className="text-sm text-gray-600">
                          • {item.book?.title || 'Book'} (x{item.quantity})
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
