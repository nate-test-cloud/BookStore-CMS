import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import { apiGet } from "@/lib/api-client";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await apiGet('/admin/notifications');
                setNotifications(data.notifications || []);
            } catch (error) {
                console.error("Error fetching notifications:", error);
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <AdminSidebar />
            <div style={{ marginLeft: "var(--sidebar-width, 272px)" }}>
                <TopSearchBar />
                <main className="p-6">
                    <h1 className="text-3xl font-bold mb-6">Notifications</h1>

                    {notifications.length === 0 ? (
                        <p className="text-gray-500">No notifications</p>
                    ) : (
                        <div className="space-y-4">
                            {notifications.map((notification: any) => (
                                <div key={notification.id} className="bg-white p-4 rounded-lg shadow">
                                    <h3 className="font-semibold">{notification.title}</h3>
                                    <p className="text-gray-600 mt-1">{notification.message}</p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
