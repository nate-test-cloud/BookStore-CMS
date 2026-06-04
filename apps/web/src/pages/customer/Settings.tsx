import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import { apiGet, apiPut } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Moon, Sun, Shield, User } from "lucide-react";
import { useTheme } from "next-themes";


export default function Settings() {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    zipCode: '',
  });
  const [notifications, setNotifications] = useState({
    lowStock: true,
    newOrder: true,
    dailyReport: false,
    weeklyReport: true,
  });
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiGet('/profile');
        setProfile(data || {});
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Clear localStorage to prevent infinite redirect loop
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
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
    // TODO: Implement password change logic
    alert('Password change functionality to be implemented');
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
      <DashboardSidebar />
      <div className="relative" style={{ marginLeft: "var(--sidebar-width, 272px)" }}>
        <TopSearchBar />
        <main className="p-6">
          <div className="space-y-6 max-w-3xl">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">Manage your profile and preferences.</p>
            </div>

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
                    onChange={handleChange}
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
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={profile.city}
                      onChange={handleChange}
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
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="zip-code">ZIP Code</Label>
                    <Input
                      id="zip-code"
                      name="zipCode"
                      value={profile.zipCode}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                  />
                </div>
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
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
                  { key: "dailyReport" as const, label: "Daily Report", desc: "Receive a daily summary of your activity." },
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
                <form onSubmit={handlePasswordChange} className="space-y-4">
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
                  <Button type="submit">Update Password</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

