import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search, ShoppingCart, Book, Sparkles, ArrowRight } from "lucide-react";

const Landing = () => {
    const navigate = useNavigate();
    const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
    const [hoveredStat, setHoveredStat] = useState<number | null>(null);

    const features = [
        {
            icon: BookOpen,
            title: "Vast Collection",
            description: "Browse thousands of books across all genres and categories",
        },
        {
            icon: ShoppingCart,
            title: "Easy Shopping",
            description: "Purchase books and manage your collection with ease",
        },
        {
            icon: Book,
            title: "Online Reading",
            description: "Read books online directly from our platform",
        },
        {
            icon: Search,
            title: "Smart Search",
            description: "Find your next favorite book with our intelligent search",
        },
    ];

    const stats = [
        { value: "10K+", label: "Books in Collection" },
        { value: "5K+", label: "Active Readers" },
        { value: "50+", label: "Book Categories" },
    ];

    return (
        <div className="min-h-screen bg-background">
            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes underline {
          0% { width: 0; }
          100% { width: 100%; }
        }
        @keyframes gradientGlow {
          0%, 100% { filter: drop-shadow(0 0 0px rgba(var(--primary), 0)); }
          50% { filter: drop-shadow(0 0 20px rgba(var(--primary), 0.5)); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-slide-up {
          animation: slideInUp 0.6s ease-out;
        }
        .animate-slide-down {
          animation: slideInDown 0.6s ease-out;
        }
        .animate-gradient-glow:hover {
          animation: gradientGlow 1s ease-in-out;
        }
        .group:hover .animate-icon {
          animation: float 2s ease-in-out infinite;
        }
        .text-underline-hover {
          position: relative;
          display: inline-block;
        }
        .text-underline-hover::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: currentColor;
          transition: width 0.3s ease;
        }
        .text-underline-hover:hover::after {
          width: 100%;
        }
      `}</style>

            {/* Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-card border-b border-border/40 backdrop-blur-sm animate-slide-down">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer hover:scale-105 transition-transform duration-300">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/40 transition-all duration-300">
                            <BookOpen className="h-5 w-5 text-primary-foreground group-hover:rotate-12 transition-transform duration-300" />
                        </div>
                        <span className="font-bold text-xl text-foreground font-serif group-hover:text-primary transition-colors duration-300">BookShelf</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/login")}
                            className="px-6 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors duration-300 relative group text-underline-hover"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => navigate("/signup")}
                            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/50 hover:-translate-y-0.5 transition-all duration-300 font-semibold"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300 animate-slide-up group cursor-pointer hover:scale-105">
                                <Sparkles className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                                <span className="text-sm font-medium">Your Next Great Read Awaits</span>
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight font-serif animate-slide-up group cursor-default" style={{ animationDelay: "0.1s" }}>
                                    <span className="relative inline-block mr-2 group-hover:text-primary transition-colors duration-300">
                                        Discover Your Next
                                    </span>
                                    <span className="text-gray-500 opacity-50">
                                        Favorite Book
                                    </span>
                                </h1>
                            </div>
                            <p className="text-lg text-muted-foreground max-w-md animate-slide-up hover:text-foreground transition-colors duration-300" style={{ animationDelay: "0.2s" }}>
                                Welcome to BookShelf, your ultimate destination for discovering, purchasing, and reading amazing books. Explore our curated collection and find your next literary adventure.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                                <button
                                    onClick={() => navigate("/signup")}
                                    className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold shadow-lg flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary/50 hover:-translate-y-1 hover:bg-primary/95 active:translate-y-0 transition-all duration-300 group"
                                >
                                    Get Started
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                                </button>
                                <button
                                    onClick={() => navigate("/login")}
                                    className="px-8 py-3 rounded-lg border border-border bg-background text-foreground font-semibold hover:bg-secondary/30 hover:border-primary/50 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 group"
                                >
                                    Already a Member?
                                    <span className="inline-block ml-1 group-hover:translate-x-0.5 transition-transform duration-300">Login</span>
                                </button>
                            </div>
                        </div>
                        <div className="relative animate-slide-up" style={{ animationDelay: "0.2s" }}>
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/5 rounded-2xl blur-3xl group-hover:blur-2xl transition-all duration-500" />
                            <div className="relative bg-card border border-border rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all duration-500 group hover:scale-105 cursor-pointer">
                                <div className="space-y-4">
                                    <div className="h-48 bg-gradient-to-br from-primary/30 to-primary/10 rounded-lg flex items-center justify-center group-hover:from-primary/40 group-hover:to-primary/20 transition-all duration-300">
                                        <BookOpen className="h-16 w-16 text-primary/40 group-hover:text-primary/60 group-hover:scale-110 transition-all duration-300 animate-float" />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-4 bg-muted rounded w-3/4 group-hover:bg-muted/80 transition-colors duration-300" />
                                        <div className="h-4 bg-muted rounded w-full group-hover:bg-muted/80 transition-colors duration-300" />
                                        <div className="h-4 bg-muted rounded w-2/3"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 bg-card/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-foreground font-serif mb-4 hover:text-primary transition-colors duration-300 cursor-default">
                            Why Choose <span className="text-primary">BookShelf</span>?
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto hover:text-foreground transition-colors duration-300">
                            Everything you need to manage, purchase, and enjoy books in one place
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={feature.title}
                                    onMouseEnter={() => setHoveredFeature(index)}
                                    onMouseLeave={() => setHoveredFeature(null)}
                                    className="bg-background rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 group cursor-pointer hover:shadow-lg hover:-translate-y-2 hover:bg-card/80"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className={`mb-4 inline-flex p-3 rounded-lg bg-primary/10 transition-all duration-300 ${hoveredFeature === index ? "bg-primary/30 scale-110" : ""}`}>
                                        <Icon className={`h-6 w-6 text-primary transition-all duration-300 ${hoveredFeature === index ? "scale-125 animate-float" : ""}`} />
                                    </div>
                                    <h3 className={`text-lg font-semibold mb-2 font-serif transition-all duration-300 ${hoveredFeature === index ? "text-primary" : "text-foreground"}`}>
                                        {feature.title}
                                    </h3>
                                    <p className={`text-sm transition-all duration-300 ${hoveredFeature === index ? "text-foreground" : "text-muted-foreground"}`}>
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        {stats.map((stat, index) => (
                            <div
                                key={stat.label}
                                onMouseEnter={() => setHoveredStat(index)}
                                onMouseLeave={() => setHoveredStat(null)}
                                className="group cursor-pointer transition-all duration-300 hover:-translate-y-2"
                            >
                                <div className={`text-5xl font-bold font-serif mb-2 transition-all duration-300 ${hoveredStat === index ? "text-primary scale-110" : "text-primary"}`}>
                                    {stat.value}
                                </div>
                                <p className={`text-lg transition-all duration-300 ${hoveredStat === index ? "text-foreground" : "text-muted-foreground"}`}>
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-gradient-to-br from-primary/10 to-primary/5">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h2 className="text-4xl font-bold text-foreground font-serif hover:text-primary transition-colors duration-300">
                        Ready to Start Reading?
                    </h2>
                    <p className="text-lg text-muted-foreground hover:text-foreground transition-colors duration-300">
                        Join thousands of book lovers and discover your next favorite read today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <button
                            onClick={() => navigate("/signup")}
                            className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:shadow-xl hover:shadow-primary/50 hover:-translate-y-1 hover:bg-primary/95 active:translate-y-0 transition-all duration-300 group"
                        >
                            Create Account
                        </button>
                        <button
                            onClick={() => navigate("/login")}
                            className="px-8 py-3 rounded-lg border border-primary text-primary font-semibold hover:bg-primary/10 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 group"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-card border-t border-border/40 py-12 px-6 hover:border-border/60 transition-colors duration-300">
                <div className="max-w-7xl mx-auto text-center text-muted-foreground text-sm hover:text-foreground transition-colors duration-300">
                    <p>&copy; 2024 BookShelf. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
