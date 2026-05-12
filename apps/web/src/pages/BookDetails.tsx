import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import { Star, ArrowLeft, ShoppingCart } from "lucide-react";

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [purchaseMode, setPurchaseMode] = useState("offline");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/v1/verify", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          navigate("/login");
          return;
        }

        const booksRes = await fetch("http://localhost:5000/api/v1/books", {
          method: "GET",
          credentials: "include",
        });

        if (booksRes.ok) {
          const books = await booksRes.json();
          const foundBook = books.find((b) => b.id === parseInt(id));
          if (foundBook) {
            setBook(foundBook);
          }
        }

        setLoading(false);
      } catch {
        navigate("/login");
      }
    };

    fetchBook();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!book) return;

    // Check if purchase option is valid for the book type
    if (book.type === "ebook" && purchaseMode === "offline") {
      alert("This is an eBook and can only be purchased for online reading");
      return;
    }
    if (book.type === "offline" && purchaseMode === "online") {
      alert("This offline book cannot be purchased for online reading");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/v1/cart", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          book_id: book.id,
          quantity,
          purchase_type: purchaseMode,
        }),
      });

      if (res.ok) {
        alert(`${quantity} copy(ies) added to cart!`);
        navigate("/purchase");
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (error) {
      alert("Error adding to cart");
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

  return (
    <div className="min-h-screen bg-background relative">
      <DashboardSidebar />

      <div className="lg:ml-[272px] relative z-10">
        <TopSearchBar />

        <main className="p-6">
          <button
            onClick={() => navigate("/index")}
            className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Books
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white rounded-xl p-8 shadow">
            {/* Book Cover */}
            <div className="md:col-span-1">
              <img
                src={book.cover}
                alt={book.title}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>

            {/* Book Details */}
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">by {book.author}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < book.rating
                        ? "fill-star text-star"
                        : "fill-muted text-muted"
                      }`}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-2">
                  {book.rating}.0 ({book.rating * 100 + Math.random() * 50} reviews)
                </span>
              </div>

              {/* Genre and Category */}
              <div className="flex gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Genre</p>
                  <p className="font-semibold">{book.genre}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Copies</p>
                  <p className="font-semibold">{book.total_copies}</p>
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-muted-foreground">Available for Purchase</p>
                <p className="text-2xl font-bold text-blue-600">
                  {book.available_copies} copies available
                </p>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-3">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{book.description}</p>
              </div>

              {/* Price and Cart Section */}
              <div className="border-t pt-6">
                {/* Purchase Mode Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Purchase Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {book.type === "offline" && (
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${purchaseMode === "offline"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                          }`}
                        onClick={() => setPurchaseMode("offline")}
                      >
                        <h4 className="font-semibold mb-2">Physical Book</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Buy the physical book for offline reading
                        </p>
                        <p className="text-xl font-bold text-primary">
                          ₹{book.offline_price}
                        </p>
                      </div>
                    )}
                    {book.type === "ebook" && (
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${purchaseMode === "online"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                          }`}
                        onClick={() => setPurchaseMode("online")}
                      >
                        <h4 className="font-semibold mb-2">Online Reading</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Borrow for online reading (14 days return deadline)
                        </p>
                        <p className="text-xl font-bold text-primary">
                          ₹{book.online_price}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-end gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Price per copy</p>
                    <p className="text-4xl font-bold text-primary">
                      ₹{purchaseMode === "online" ? book.online_price : book.offline_price}
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
                        max={book.available_copies}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.min(
                              book.available_copies,
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          )
                        }
                        className="w-16 px-2 py-2 border rounded text-center"
                      />
                      <button
                        onClick={() =>
                          setQuantity(
                            Math.min(book.available_copies, quantity + 1)
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
                      ₹{(purchaseMode === "online" ? book.online_price : book.offline_price) * quantity}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={book.available_copies === 0}
                  className="mt-6 w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
