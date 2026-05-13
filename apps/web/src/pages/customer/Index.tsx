import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import BookCard from "@/components/BookCard";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import { apiGet } from "@/lib/api-client";
import bookstoreBanner from "@/assets/bookstore-banner.jpg";

const Index = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const sidebarCollapsed = useSidebarCollapsed();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verify user is authenticated
        await apiGet('/verify');
        
        // Fetch books
        const booksResponse = await apiGet('/books');
        if (booksResponse.books) {
          setBooks(booksResponse.books);
        } else if (Array.isArray(booksResponse)) {
          setBooks(booksResponse);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate("/login");
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
    <div className="min-h-screen bg-background relative">
      <img
        src={bookstoreBanner}
        alt=""
        className="fixed inset-0 w-full h-full object-cover opacity-[0.07] pointer-events-none z-0"
      />
      <DashboardSidebar />
      <div className="relative z-10" style={{ marginLeft: "var(--sidebar-width, 272px)" }}>
        <TopSearchBar />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground font-serif">For You</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Recommended based on your reading history
            </p>
          </div>
          <div className={`grid ${sidebarCollapsed ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"} gap-5`}>
            {books.map((book: any) => (
              <BookCard key={book.id} {...book} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
