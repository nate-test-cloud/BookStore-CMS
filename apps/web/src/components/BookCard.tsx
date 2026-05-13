import { Star, BookmarkPlus, BookOpen, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "@/lib/api-client";

interface BookCardProps {
  id: string;
  isbn: string;
  coverImage?: string;
  title: string;
  authors?: Array<{ id: string; name: string }>;
  rating?: number;
  currentPrice?: number;
  basePrice?: number;
  stock?: number;
}

const BookCard = ({ id, isbn, coverImage, title, authors, rating = 0, currentPrice, basePrice, stock = 0 }: BookCardProps) => {
  const navigate = useNavigate();
  const price = currentPrice || basePrice || 0;
  const author = authors?.[0]?.name || 'Unknown Author';

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/book-details/${id}`);
  };

  const handleCardClick = () => {
    navigate(`/book-details/${id}`);
  };

  const handleIssue = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiPost(`/books/${id}/issue`);
      alert("Book issued successfully!");
      window.location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error issuing book");
    }
  };

  const handlePurchase = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiPost(`/books/${id}/purchase`);
      alert("Book purchased successfully!");
      window.location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error purchasing book");
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-card rounded-2xl overflow-hidden border border-border/40 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-primary/8 hover:border-primary/20 hover:-translate-y-2"
    >
      <div className="aspect-[2/3] overflow-hidden relative">
        <img
          src={coverImage || '/placeholder-book.png'}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-108"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-400">
          {stock > 0 ? (
            <button
              onClick={handleIssue}
              className="h-8 w-8 rounded-lg bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-primary-foreground text-muted-foreground shadow-lg"
              title="Issue Book"
            >
              <BookOpen className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handlePurchase}
              className="h-8 w-8 rounded-lg bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-primary-foreground text-muted-foreground shadow-lg"
              title="Purchase Book"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* View details label */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75">
          <button
            onClick={handleDetailsClick}
            className="w-full inline-block px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/30 tracking-wide hover:bg-primary/90 transition"
          >
            View Details
          </button>
        </div>
      </div>
      <div className="p-4 space-y-1.5 transition-all duration-300 group-hover:bg-primary/[0.03]">
        <h3 className="font-semibold text-card-foreground text-[13px] leading-tight line-clamp-1 transition-colors duration-300 group-hover:text-primary">
          {title}
        </h3>
        <p className="text-muted-foreground text-xs tracking-wide">{author}</p>
        <div className="flex items-center gap-0.5 pt-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 transition-all duration-300 ${i < Math.floor(rating || 0)
                ? "fill-star text-star group-hover:scale-110"
                : "fill-muted text-muted"
                }`}
              style={{ transitionDelay: `${i * 40}ms` }}
            />
          ))}
          <span className="text-[11px] text-muted-foreground ml-1.5 font-medium">{(rating || 0).toFixed(1)}</span>
        </div>
        <p className="text-sm font-medium text-primary">₹{price || 0}</p>
        <p className="text-xs text-muted-foreground">
          {stock > 0 ? `${stock} available` : "Out of stock"}
        </p>
      </div>
    </div>
  );
};

export default BookCard;
