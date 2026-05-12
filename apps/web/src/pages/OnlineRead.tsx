import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import { apiGet } from "@/lib/api-client";

export default function OnlineRead() {
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
          <h1 className="text-3xl font-bold mb-6">Online Library - Your Books</h1>

          {issuedBooks.length === 0 ? (
            <p className="text-gray-500">No books in your library</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {issuedBooks.map((book: any) => (
                <div key={book.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 h-32 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{book.title}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{book.title}</h3>
                    {book.authors && book.authors.length > 0 && (
                      <p className="text-gray-600 text-sm mb-2">
                        By {book.authors.map((a: any) => a.name).join(', ')}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm mb-3">
                      ISBN: {book.isbn}
                    </p>
                    <a
                      href={`/book-reader/${book.id}`}
                      className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                      Read Online
                    </a>
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
