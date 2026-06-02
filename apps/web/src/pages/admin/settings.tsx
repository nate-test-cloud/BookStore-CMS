import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { Moon, Sun, Store, Bell, Shield, CreditCard } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";

export default function AdminSettings() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const sidebarCollapsed = useSidebarCollapsed();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/unauthorized", { replace: true });
    }
  }, [isAdmin, navigate]);
  const { theme, setTheme } = useTheme();
  const [storeName, setStoreName] = useState("BookCMS");
  const [email, setEmail] = useState("admin@bookcms.com");
  const [taxRate, setTaxRate] = useState("8.5");
  const [currency, setCurrency] = useState("USD");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [notifications, setNotifications] = useState({
    lowStock: true,
    newOrder: true,
    dailyReport: false,
    weeklyReport: true,
  });

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="relative" style={{ marginLeft: "var(--sidebar-width, 272px)" }}>
        <TopSearchBar />
        <main className="p-6">
          <div className="space-y-6 max-w-3xl">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">Manage your bookstore configuration and preferences.</p>
            </div>

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
                  <Input id="admin-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
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
                <Button>Save Store Settings</Button>
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
                <Button>Save POS Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle>Notifications</CardTitle>
                </div>
                <CardDescription>Choose what alerts you want to receive.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "lowStock" as const, label: "Low Stock Alerts", desc: "Get notified when books fall below the stock threshold." },
                  { key: "newOrder" as const, label: "New Order Alerts", desc: "Get notified when a new order is placed." },
                  { key: "dailyReport" as const, label: "Daily Report", desc: "Receive a daily summary of sales and activity." },
                  { key: "weeklyReport" as const, label: "Weekly Report", desc: "Receive a weekly performance digest." },
                ].map(({ key, label, desc }, i, arr) => (
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
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" placeholder="••••••••" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" placeholder="••••••••" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" placeholder="••••••••" />
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
