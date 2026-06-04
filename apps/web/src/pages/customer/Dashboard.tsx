import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import BookCard from "@/components/BookCard";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import { apiGet } from "@/lib/api-client";
import bookstoreBanner from "@/assets/bookstore-banner.jpg";

const Index = () => {
  const [forYouBooks, setForYouBooks] = useState([]);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const sidebarCollapsed = useSidebarCollapsed();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verify user is authenticated
        await apiGet('/verify');

        // Fetch "For You" recommendations
        try {
          const recommendationsResponse = await apiGet('/recommendations/for-you?limit=20');
          if (Array.isArray(recommendationsResponse)) {
            setForYouBooks(recommendationsResponse);
          }
        } catch (error) {
          console.warn('Error fetching recommendations:', error);
          // Fallback to trending if recommendations fail
          const booksResponse = await apiGet('/books');
          if (Array.isArray(booksResponse)) {
            setForYouBooks(booksResponse);
          } else if (booksResponse.data) {
            setForYouBooks(booksResponse.data);
          } else if (booksResponse.books) {
            setForYouBooks(booksResponse.books);
          }
        }

        // Also fetch trending/all books as fallback
        try {
          const booksResponse = await apiGet('/books?limit=20');
          if (Array.isArray(booksResponse)) {
            setTrendingBooks(booksResponse);
          } else if (booksResponse.data) {
            setTrendingBooks(booksResponse.data);
          } else if (booksResponse.books) {
            setTrendingBooks(booksResponse.books);
          }
        } catch (error) {
          console.warn('Error fetching trending books:', error);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Clear localStorage to prevent infinite redirect loop
        // when token is expired/invalid
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
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
        <main className="p-6 space-y-8">
          {/* For You Section */}
          {forYouBooks.length > 0 && (
            <section>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground font-serif">For You</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Recommended based on your reading history and preferences
                </p>
              </div>
              <div className={`grid ${sidebarCollapsed ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"} gap-5`}>
                {forYouBooks.map((book: any) => (
                  <BookCard key={book.id} {...book} />
                ))}
              </div>
            </section>
          )}

          {/* Trending Section - Show if "For You" has results or as primary section */}
          {trendingBooks.length > 0 && (
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground font-serif">Trending Now</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Most popular books in our store
                </p>
              </div>
              <div className={`grid ${sidebarCollapsed ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"} gap-5`}>
                {trendingBooks.map((book: any) => (
                  <BookCard key={book.id} {...book} />
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {forYouBooks.length === 0 && trendingBooks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No books available at the moment</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
