import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import { apiGet } from "@/lib/api-client";

export default function ReturnDeadline() {
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIssuedBooks = async () => {
      try {
        const data = await apiGet('/issued');
        setIssuedBooks(data.issuedBooks || []);
      } catch (error) {
        console.error("Error fetching issued books:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchIssuedBooks();
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
          <h1 className="text-3xl font-bold mb-6">Books - Return Deadline</h1>

          {issuedBooks.length === 0 ? (
            <p className="text-gray-500">No issued books</p>
          ) : (
            <div className="space-y-4">
              {issuedBooks.map((book: any) => {
                const daysLeft = Math.ceil(
                  (new Date(book.returnDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                const isOverdue = daysLeft < 0;
                
                return (
                  <div key={book.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{book.title}</h3>
                        <p className="text-gray-600 text-sm">ISBN: {book.isbn}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded text-sm font-medium ${
                          isOverdue 
                            ? 'bg-red-100 text-red-800'
                            : daysLeft <= 3
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {isOverdue ? 'OVERDUE' : `${daysLeft} days left`}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600">
                        Issue Date: {new Date(book.orderDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Return By: {new Date(book.returnDeadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
