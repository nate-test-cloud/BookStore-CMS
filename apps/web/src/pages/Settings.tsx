import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { apiGet, apiPut, apiPost } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { Moon, Sun, Store, Bell, Shield, CreditCard, User } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";

export default function Settings() {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const sidebarCollapsed = useSidebarCollapsed();
    const { theme, setTheme } = useTheme();

    // Customer profile state
    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        zipCode: '',
    });

    // Password change state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Admin store settings state
    const [storeName, setStoreName] = useState("BookCMS");
    const [adminEmail, setAdminEmail] = useState("admin@bookcms.com");
    const [taxRate, setTaxRate] = useState("8.5");
    const [currency, setCurrency] = useState("USD");
    const [lowStockThreshold, setLowStockThreshold] = useState("5");

    // Shared state
    const [notifications, setNotifications] = useState({
        lowStock: true,
        newOrder: true,
        dailyReport: false,
        weeklyReport: true,
        couponExpiring: false,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        if (!isAdmin) {
            // Fetch customer profile
            const fetchProfile = async () => {
                try {
                    const data = await apiGet('/profile');
                    setProfile(data || {});
                } catch (error) {
                    console.error("Error fetching profile:", error);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    navigate("/login");
                } finally {
                    setLoading(false);
                }
            };

            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [isAdmin, navigate]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleProfileSubmit = async () => {
        setSaving(true);
        try {
            const updated = await apiPut('/profile', profile);
            setProfile(updated);
            alert('Profile updated successfully!');
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Failed to update profile";
            alert(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!passwordForm.currentPassword.trim()) {
            alert('Please enter your current password');
            return;
        }

        if (!passwordForm.newPassword.trim()) {
            alert('Please enter a new password');
            return;
        }

        if (!passwordForm.confirmPassword.trim()) {
            alert('Please confirm your new password');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            alert('New password must be at least 8 characters');
            return;
        }

        // Validate password strength (at least one uppercase, one lowercase, one number)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
        if (!passwordRegex.test(passwordForm.newPassword)) {
            alert('New password must contain at least one uppercase letter, one lowercase letter, and one number');
            return;
        }

        setChangingPassword(true);
        try {
            await apiPost('/auth/change-password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
                confirmPassword: passwordForm.confirmPassword,
            });

            alert('Password changed successfully!');
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Failed to change password";
            alert(errorMsg);
        } finally {
            setChangingPassword(false);
        }
    };

    const handleStoreSettingsSave = () => {
        alert('Store settings saved! (API integration pending)');
    };

    const handlePOSSettingsSave = () => {
        alert('POS settings saved! (API integration pending)');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {isAdmin ? <AdminSidebar /> : <DashboardSidebar />}
            <div className="relative" style={{ marginLeft: "var(--sidebar-width, 272px)" }}>
                <TopSearchBar />
                <main className="p-6">
                    <div className="space-y-6 max-w-3xl">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                            <p className="text-muted-foreground">
                                {isAdmin
                                    ? "Manage your bookstore configuration and preferences."
                                    : "Manage your profile and preferences."}
                            </p>
                        </div>

                        {/* ADMIN-ONLY SECTIONS */}
                        {isAdmin && (
                            <>
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <Store className="h-5 w-5 text-primary" />
                                            <CardTitle>Store Information</CardTitle>
                                        </div>
                                        <CardDescription>Basic details about your bookstore.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="store-name">Store Name</Label>
                                            <Input id="store-name" value={storeName} onChange={e => setStoreName(e.target.value)} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="admin-email">Admin Email</Label>
                                            <Input id="admin-email" type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="currency">Currency</Label>
                                                <Input id="currency" value={currency} onChange={e => setCurrency(e.target.value)} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                                                <Input id="tax-rate" type="number" step="0.1" value={taxRate} onChange={e => setTaxRate(e.target.value)} />
                                            </div>
                                        </div>
                                        <Button onClick={handleStoreSettingsSave}>Save Store Settings</Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-primary" />
                                            <CardTitle>POS Settings</CardTitle>
                                        </div>
                                        <CardDescription>Point of sale and inventory configuration.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="low-stock">Low Stock Threshold</Label>
                                            <Input id="low-stock" type="number" min="1" value={lowStockThreshold} onChange={e => setLowStockThreshold(e.target.value)} />
                                            <p className="text-xs text-muted-foreground">Books with stock at or below this number will be flagged as low stock.</p>
                                        </div>
                                        <Button onClick={handlePOSSettingsSave}>Save POS Settings</Button>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {/* CUSTOMER-ONLY SECTIONS */}
                        {!isAdmin && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-primary" />
                                        <CardTitle>Profile Information</CardTitle>
                                    </div>
                                    <CardDescription>Update your personal details.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="full-name">Full Name</Label>
                                        <Input
                                            id="full-name"
                                            name="fullName"
                                            value={profile.fullName}
                                            onChange={handleProfileChange}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={profile.email}
                                            disabled
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                value={profile.phone}
                                                onChange={handleProfileChange}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input
                                                id="city"
                                                name="city"
                                                value={profile.city}
                                                onChange={handleProfileChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="country">Country</Label>
                                            <Input
                                                id="country"
                                                name="country"
                                                value={profile.country}
                                                onChange={handleProfileChange}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="zip-code">ZIP Code</Label>
                                            <Input
                                                id="zip-code"
                                                name="zipCode"
                                                value={profile.zipCode}
                                                onChange={handleProfileChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Input
                                            id="address"
                                            name="address"
                                            value={profile.address}
                                            onChange={handleProfileChange}
                                        />
                                    </div>
                                    <Button onClick={handleProfileSubmit} disabled={saving}>
                                        {saving ? "Saving..." : "Save Profile"}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* SHARED SECTIONS FOR BOTH ADMIN AND CUSTOMER */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-primary" />
                                    <CardTitle>Notifications</CardTitle>
                                </div>
                                <CardDescription>Choose what alerts you want to receive.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {(isAdmin
                                    ? [
                                        { key: "lowStock" as const, label: "Low Stock Alerts", desc: "Get notified when books fall below the stock threshold." },
                                        { key: "newOrder" as const, label: "New Order Alerts", desc: "Get notified when a new order is placed." },
                                        { key: "dailyReport" as const, label: "Daily Report", desc: "Receive a daily summary of sales and activity." },
                                        { key: "weeklyReport" as const, label: "Weekly Report", desc: "Receive a weekly performance digest." },
                                    ]
                                    : [
                                        { key: "lowStock" as const, label: "Low Stock Warning for Wishlist", desc: "Get notified when a wishlist item stock is running low." },
                                        { key: "newOrder" as const, label: "Order Placed Successfully", desc: "Get confirmation when your order is successfully placed." },
                                        { key: "dailyReport" as const, label: "New Edition Available", desc: "Be notified when new editions of books you follow are released." },
                                        { key: "weeklyReport" as const, label: "Wishlist Item on Sale", desc: "Get alerts when items in your wishlist go on sale." },
                                        { key: "couponExpiring" as const, label: "Coupon Expiring Soon", desc: "Receive reminders when your coupons are about to expire." },
                                    ]
                                ).map(({ key, label, desc }, i, arr) => (
                                    <div key={key}>
                                        <div className="flex items-center justify-between py-1">
                                            <div>
                                                <p className="font-medium text-sm">{label}</p>
                                                <p className="text-xs text-muted-foreground">{desc}</p>
                                            </div>
                                            <Switch
                                                checked={notifications[key]}
                                                onCheckedChange={v => setNotifications(n => ({ ...n, [key]: v }))}
                                            />
                                        </div>
                                        {i < arr.length - 1 && <Separator className="mt-3" />}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    {theme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                                    <CardTitle>Appearance</CardTitle>
                                </div>
                                <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-sm">Dark Mode</p>
                                        <p className="text-xs text-muted-foreground">Switch between light and dark themes.</p>
                                    </div>
                                    <Switch
                                        checked={theme === "dark"}
                                        onCheckedChange={v => setTheme(v ? "dark" : "light")}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    <CardTitle>Security</CardTitle>
                                </div>
                                <CardDescription>Manage access and security settings.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="current-password">Current Password</Label>
                                        <Input
                                            id="current-password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm(prev => ({
                                                ...prev,
                                                currentPassword: e.target.value
                                            }))}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="new-password">New Password</Label>
                                        <Input
                                            id="new-password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm(prev => ({
                                                ...prev,
                                                newPassword: e.target.value
                                            }))}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm(prev => ({
                                                ...prev,
                                                confirmPassword: e.target.value
                                            }))}
                                        />
                                    </div>
                                    <Button type="submit" disabled={changingPassword}>
                                        {changingPassword ? "Changing..." : "Update Password"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
