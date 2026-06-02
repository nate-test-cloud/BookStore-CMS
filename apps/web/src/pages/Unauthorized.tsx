import { useNavigate } from "react-router-dom";
import { AlertCircle, Home, LogIn } from "lucide-react";

export default function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-6 flex justify-center">
                    <div className="bg-red-100 p-4 rounded-full">
                        <AlertCircle className="text-red-600" size={48} />
                    </div>
                </div>

                <h1 className="text-4xl font-bold mb-2 text-gray-900">403</h1>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Access Denied</h2>

                <p className="text-gray-600 mb-8">
                    You don't have permission to access the admin area. Admin access is required to view this page.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => navigate("/")}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Home size={20} />
                        Go to Home
                    </button>

                    <button
                        onClick={() => navigate("/login")}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                        <LogIn size={20} />
                        Login with Admin Account
                    </button>
                </div>
            </div>
        </div>
    );
}
