import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import { Star, ArrowLeft, ShoppingCart } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api-client";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sidebarCollapsed = useSidebarCollapsed();
  const [book, setBook] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        await apiGet("/auth/me");

        // Fetch the specific book by ID instead of fetching all books
        const bookData = await apiGet(`/books/${id}`);
        setBook(bookData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching book:", error);
        setLoading(false);
        // Don't redirect to login on 404, stay on page with "Book not found"
      }
    };

    fetchBook();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!book) return;

    try {
      await apiPost("/cart", {
        bookId: book.id,
        quantity,
      });

      alert(`${quantity} copy(ies) added to cart!`);
      navigate("/cart");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error adding to cart");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Book not found</p>
      </div>
    );
  }

  // Use rating from backend (already calculated)
  const avgRating = book.rating || 0;

  return (
    <div className="min-h-screen bg-background relative">
      <DashboardSidebar />

      <div style={{ marginLeft: "var(--sidebar-width, 272px)" }} className="relative z-10">
        <TopSearchBar />

        <main className="p-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Books
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white rounded-xl p-8 shadow">
            {/* Book Cover */}
            <div className="md:col-span-1">
              <img
                src={book.coverImage || '/placeholder-book.png'}
                alt={book.title}
                className="w-full h-auto rounded-lg shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-book.png';
                }}
              />
            </div>

            {/* Book Details */}
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">by {book.author || 'Unknown Author'}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(avgRating)
                      ? "fill-star text-star"
                      : "fill-muted text-muted"
                      }`}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-2">
                  {avgRating.toFixed(1)}
                </span>
              </div>

              {/* Genre and Category */}
              <div className="flex gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Genre</p>
                  <p className="font-semibold">{book.category || 'Fiction'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Copies</p>
                  <p className="font-semibold">{book.stock || 0}</p>
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6 p-4 rounded-lg border border-primaryrimar">
                <p className="text-sm text-muted-foreground">Available for Purchase</p>
                <p className="text-2xl font-bold text-primary">
                  {book.stock || 0} copies available
                </p>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-3">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{book.description}</p>
              </div>

              {/* Price and Cart Section */}
              <div className="border-t pt-6">
                <div className="flex items-end gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Price per copy</p>
                    <p className="text-4xl font-bold text-primary">
                      ₹{book.price || 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Quantity</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setQuantity(Math.max(1, quantity - 1))
                        }
                        className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={book.stock || 1}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.min(
                              book.stock || 1,
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          )
                        }
                        className="w-16 px-2 py-2 border rounded text-center"
                      />
                      <button
                        onClick={() =>
                          setQuantity(
                            Math.min(book.stock || 1, quantity + 1)
                          )
                        }
                        className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Total</p>
                    <p className="text-2xl font-bold">
                      ₹{(book.price || 0) * quantity}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!book.stock || book.stock === 0}
                  className="mt-6 w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-primary/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
