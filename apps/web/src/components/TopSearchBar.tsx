import { Search, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const TopSearchBar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, navigate]);

  return (
    <header className="sticky top-0 z-20 bg-primary/5 backdrop-blur-xl border-b border-primary/10 px-6 py-3.5 flex items-center gap-4">
      <div className="relative flex-1 max-w-xl group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50 transition-colors duration-200 group-focus-within:text-primary" />
        <input
          type="text"
          placeholder="Search books by name, author, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:shadow-lg focus:shadow-primary/10 transition-all duration-300 shadow-sm"
        />
      </div>
      <button onClick={() => navigate("/notifications")} className="relative h-10 w-10 rounded-xl bg-primary/[0.06] border border-primary/15 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-md hover:shadow-primary/20 active:scale-95 transition-all duration-300 group">
        <Bell className="h-[18px] w-[18px] text-muted-foreground group-hover:text-primary-foreground transition-colors duration-300" />
        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
      </button>
    </header>
  );
};

export default TopSearchBar;
