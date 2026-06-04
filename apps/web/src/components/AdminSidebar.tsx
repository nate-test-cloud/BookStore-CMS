import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    BookOpen,
    BookMarked,
    ShoppingCart,
    Users,
    Boxes,
    TrendingUp,
    Settings,
    LogOut,
    ChevronRight,
    Bell,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { setSidebarCollapsed } from "@/hooks/useSidebarCollapsed";

const mainItems = [
    { icon: LayoutDashboard, label: "Dashboard", to: "/admin/dashboard" },
    { icon: BookMarked, label: "Books", to: "/admin/books" },
    { icon: ShoppingCart, label: "Orders", to: "/admin/orders" },
    { icon: Users, label: "Customers", to: "/admin/customers" },
    { icon: Boxes, label: "Inventory", to: "/admin/inventory" },
    { icon: Users, label: "Suppliers", to: "/admin/suppliers" },
];

const toolItems = [
    { icon: TrendingUp, label: "Analytics", to: "/admin/analytics" },
    { icon: Settings, label: "Settings", to: "/admin/settings" },
];

const AdminSidebar = () => {
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(true);

    useEffect(() => {
        document.documentElement.style.setProperty(
            "--sidebar-width",
            isCollapsed ? "80px" : "272px"
        );
        setSidebarCollapsed(isCollapsed);
    }, [isCollapsed]);

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:5000/api/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // Clear localStorage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            navigate("/login");
        }
    };

    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-card border-r border-border/60 flex flex-col z-30 max-lg:hidden transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-[272px]"
                }`}
            onMouseEnter={() => setIsCollapsed(false)}
            onMouseLeave={() => setIsCollapsed(true)}
        >
            {/* Logo */}
            <div className="px-6 pt-7 pb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 flex-shrink-0">
                        <BookOpen className="h-5 w-5 text-primary-foreground" />
                    </div>
                    {!isCollapsed && (
                        <div>
                            <span className="font-bold text-lg text-foreground tracking-tight leading-none">
                                Admin
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {!isCollapsed && <Separator className="mx-5 w-auto" />}

            {/* Main Nav */}
            <nav className="flex-1 px-4 pt-5 space-y-0.5 overflow-y-auto">
                {!isCollapsed && (
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-3">
                        Menu
                    </p>
                )}
                {mainItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.to}
                        title={isCollapsed ? item.label : ""}
                        className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative text-muted-foreground hover:bg-secondary hover:text-foreground"
                        activeClassName="bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    >
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200 group-hover:bg-primary/10 flex-shrink-0">
                            <item.icon className="h-[18px] w-[18px]" />
                        </div>

                        {!isCollapsed && (
                            <>
                                <span className="flex-1 text-left">{item.label}</span>

                                <ChevronRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-50 group-hover:translate-x-0 transition-all duration-200" />
                            </>
                        )}
                    </NavLink>
                ))}

                {!isCollapsed && (
                    <>
                        <div className="pt-6" />
                        <Separator className="mx-2 w-auto mb-4" />
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-3">
                            Tools
                        </p>
                    </>
                )}

                {toolItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.to}
                        title={isCollapsed ? item.label : ""}
                        className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative text-muted-foreground hover:bg-secondary hover:text-foreground"
                        activeClassName="bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    >
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200 group-hover:bg-primary/10 flex-shrink-0">
                            <item.icon className="h-[18px] w-[18px]" />
                        </div>

                        {!isCollapsed && (
                            <>
                                <span className="flex-1 text-left">{item.label}</span>

                                <ChevronRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-50 group-hover:translate-x-0 transition-all duration-200" />
                            </>
                        )}
                    </NavLink>
                ))}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    title={isCollapsed ? "Logout" : ""}
                    className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative text-muted-foreground hover:bg-secondary hover:text-foreground mt-2"
                >
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200 group-hover:bg-primary/10 flex-shrink-0">
                        <LogOut className="h-[18px] w-[18px]" />
                    </div>

                    {!isCollapsed && (
                        <>
                            <span className="flex-1 text-left">Logout</span>

                            <ChevronRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-50 group-hover:translate-x-0 transition-all duration-200" />
                        </>
                    )}
                </button>
            </nav>
        </aside>
    );
};

export default AdminSidebar;
