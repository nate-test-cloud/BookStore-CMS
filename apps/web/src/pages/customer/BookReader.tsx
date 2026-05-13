import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api-client";

export default function BookReader() {
    const { bookId } = useParams();
    const navigate = useNavigate();
    const [bookInfo, setBookInfo] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageContent, setPageContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);

    // Fetch book info on mount
    useEffect(() => {
        const fetchBookInfo = async () => {
            try {
                if (!bookId) return;

                const data = await apiGet(`/book-reader/${bookId}`);
                setBookInfo(data);
                setCurrentPage(data.currentPage || 1);
                setTotalPages(data.totalPages || 100);
                setLoading(false);

                // Fetch first page content
                await fetchPageContent(data.currentPage || 1);
            } catch (error) {
                console.error("Error fetching book:", error);
                navigate("/online-read");
            }
        };

        fetchBookInfo();
    }, [bookId, navigate]);

    // Fetch page content
    const fetchPageContent = async (pageNum: number) => {
        try {
            if (!bookId) return;
            const data = await apiGet(`/book-content/${bookId}/page/${pageNum}`);
            setPageContent(data.content);
            setCurrentPage(pageNum);
        } catch (error) {
            console.error("Error fetching page:", error);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            fetchPageContent(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            fetchPageContent(currentPage - 1);
        }
    };

    const handlePageJump = (e: React.ChangeEvent<HTMLInputElement>) => {
        const pageNum = parseInt(e.target.value);
        if (pageNum >= 1 && pageNum <= totalPages) {
            fetchPageContent(pageNum);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Loading book...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <DashboardSidebar />
            <div style={{ marginLeft: "var(--sidebar-width, 272px)" }} className="flex flex-col h-screen">
                <TopSearchBar />

                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-white border-b p-6">
                        <div className="flex items-start justify-between mb-4">
                            <button
                                onClick={() => navigate("/online-read")}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                            >
                                <Home className="h-5 w-5" />
                                Back to Library
                            </button>
                            <div className="text-right text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </div>
                        </div>
                        <p>{bookInfo?.title}</p>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-auto bg-gray-50 p-8">
                        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
                            <div className="prose prose-lg max-w-none">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {pageContent}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Navigation */}
                    <div className="bg-white border-t p-4 flex items-center justify-between">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-5 w-5" />
                            Previous
                        </button>

                        <div className="flex items-center gap-4">
                            <span className="text-gray-600">Go to page:</span>
                            <input
                                type="number"
                                min="1"
                                max={totalPages}
                                value={currentPage}
                                onChange={handlePageJump}
                                className="w-20 px-2 py-1 border rounded text-center"
                            />
                            <span className="text-gray-600">of {totalPages}</span>
                        </div>

                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Next
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}
