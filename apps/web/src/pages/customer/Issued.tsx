import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import { apiGet } from "@/lib/api-client";
import { BookOpen } from "lucide-react";

export default function Issued() {
  const [purchases, setPurchases] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [activeTab, setActiveTab] = useState<"purchases" | "reading">("purchases");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [purchasesData, issuedBooksData] = await Promise.all([
          apiGet('/purchases'),
          apiGet('/issued'),
        ]);

        if (purchasesData.purchases) {
          setPurchases(purchasesData.purchases);
        }

        if (issuedBooksData.issuedBooks) {
          setIssuedBooks(issuedBooksData.issuedBooks);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div style={{ marginLeft: "var(--sidebar-width, 272px)" }}>
        <TopSearchBar />
        <main className="p-6">
          <h1 className="text-3xl font-bold mb-6">My Library</h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b">
            <button
              onClick={() => setActiveTab("purchases")}
              className={`px-6 py-3 font-semibold transition-colors ${activeTab === "purchases"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
                }`}
            >
              Purchase History
            </button>
            <button
              onClick={() => setActiveTab("reading")}
              className={`px-6 py-3 font-semibold transition-colors ${activeTab === "reading"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
                }`}
            >
              My Reading Library
            </button>
          </div>

          {/* Purchases Tab */}
          {activeTab === "purchases" && (
            <>
              {purchases.length === 0 ? (
                <p className="text-gray-500">No purchases yet</p>
              ) : (
                <div className="space-y-4">
                  {purchases.map((purchase: any) => (
                    <div key={purchase.id} className="bg-white p-4 rounded-lg shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">
                            Order #{purchase.orderNumber}
                          </h3>
                          <p className="text-gray-600">
                            {new Date(purchase.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 rounded text-sm font-medium ${purchase.status === "DELIVERED"
                              ? "bg-green-100 text-green-800"
                              : purchase.status === "PAID"
                                ? "bg-blue-100 text-blue-800"
                                : purchase.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                          >
                            {purchase.status}
                          </span>
                          <p className="text-lg font-semibold mt-2">
                            ₹{purchase.totalAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-2">Items:</h4>
                        <div className="space-y-1">
                          {purchase.items?.map((item: any, idx: number) => (
                            <p key={idx} className="text-sm text-gray-600">
                              • {item.book?.title || "Book"} (x{item.quantity})
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Reading Library Tab */}
          {activeTab === "reading" && (
            <>
              {issuedBooks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">No books in your library yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {issuedBooks.map((issued: any) => (
                    <div
                      key={issued.id}
                      className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition max-w-[280px] mx-auto"
                    >
                      <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden" style={{ aspectRatio: '2/3' }}>
                        {issued.book.coverImage ? (
                          <img
                            src={issued.book.coverImage}
                            alt={issued.book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center p-4">
                            <span className="text-white text-xs font-medium text-center">
                              {issued.book.title}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm mb-1">
                          {issued.book.title}
                        </h3>
                        {issued.book.authors && issued.book.authors.length > 0 && (
                          <p className="text-gray-600 text-xs mb-2">
                            By {issued.book.authors.map((a: any) => a.name).join(", ")}
                          </p>
                        )}
                        <p className="text-gray-600 text-xs mb-2">
                          ISBN: {issued.book.isbn}
                        </p>
                        <div className="mb-2 text-xs text-gray-600">
                          Reading Progress: Page {issued.currentPage} of{" "}
                          {issued.totalPages}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(issued.currentPage / issued.totalPages) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <a
                          href={`/book-reader/${issued.bookId}`}
                          className="block text-center bg-blue-600 text-white py-1.5 text-sm rounded hover:bg-blue-300"
                        >
                          Continue Reading
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
