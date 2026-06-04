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
        if (data.issuedBooks) {
          setIssuedBooks(data.issuedBooks);
        } else {
          setIssuedBooks([]);
        }
      } catch (error) {
        console.error("Error fetching issued books:", error);
        // Clear localStorage to prevent infinite redirect loop
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {issuedBooks.map((book: any) => (
                <div key={book.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition max-w-[380px]">
                  <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden" style={{ aspectRatio: '2/3' }}>
                    {book.book?.coverImage ? (
                      <img
                        src={book.book.coverImage}
                        alt={book.book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-book.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-3">
                        <span className="text-white text-xs font-medium text-center">
                          {book.book?.title || "Book"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-lg mb-2">{book.book?.title || "Book"}</h3>
                    {book.book?.authors && book.book.authors.length > 0 && (
                      <p className="text-gray-600 text-xs mb-2">
                        By {book.book.authors.map((a: any) => a.name).join(', ')}
                      </p>
                    )}
                    <p className="text-gray-600 text-xs mb-2">
                      ISBN: {book.book?.isbn || 'N/A'}
                    </p>
                    <p className="text-gray-600 text-xs mb-2">
                      Reading Progress: Page {book.currentPage} of {book.totalPages}
                    </p>
                    <a
                      href={`/book-reader/${book.bookId}`}
                      className="block text-center bg-primary text-white py-1.5 text-sm rounded hover:bg-primary/50 transition"
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
