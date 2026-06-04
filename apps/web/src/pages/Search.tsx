import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import BookCard from "@/components/BookCard";
import { apiGet } from "@/lib/api-client";

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (!query.trim()) {
      navigate('/dashboard');
      return;
    }

    const performSearch = async () => {
      try {
        const data = await apiGet(`/books/search/${encodeURIComponent(query)}`);
        if (Array.isArray(data)) {
          setResults(data);
        } else if (data.books) {
          setResults(data.books);
        }
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Searching...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div style={{ marginLeft: "var(--sidebar-width, 272px)" }}>
        <TopSearchBar />
        <main className="p-6">
          <h1 className="text-2xl font-bold mb-2">Search Results</h1>
          <p className="text-gray-600 mb-6">
            {results.length} results for "{query}"
          </p>

          {results.length === 0 ? (
            <p className="text-gray-500">No books found</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
              {results.map((book: any) => (
                <BookCard key={book.id} {...book} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
