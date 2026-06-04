import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetSalesOverTime,
  useGetRevenueByCategory,
  useGetTopBooks,
  useGetCustomerGrowth,
  useGetDashboardStats,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import { DollarSign, Users, BookOpen, TrendingUp } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import { useAuth } from "@/hooks/useAuth";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { data: stats } = useGetDashboardStats();
  const { data: salesData } = useGetSalesOverTime();
  const { data: categoryData } = useGetRevenueByCategory();
  const sidebarCollapsed = useSidebarCollapsed();
  const { data: topBooks } = useGetTopBooks();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/unauthorized", { replace: true });
    }
  }, [isAdmin, navigate]);
  const { data: customerGrowth } = useGetCustomerGrowth();

  const sales = salesData ?? [];
  const categories = categoryData ?? [];
  const books = topBooks ?? [];
  const growth = customerGrowth ?? [];

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="relative" style={{ marginLeft: "var(--sidebar-width, 272px)" }}>
        <TopSearchBar />
        <main className="p-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
              <p className="text-muted-foreground">Deep insights into your bookstore performance.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: "Total Revenue", value: stats ? `$${(stats.totalRevenue ?? 0).toFixed(2)}` : null, desc: "All-time revenue", icon: DollarSign },
                { label: "Total Customers", value: stats?.totalCustomers?.toString() ?? null, desc: "Registered customers", icon: Users },
                { label: "Books in Catalog", value: stats?.totalBooks?.toString() ?? null, desc: "Unique titles", icon: BookOpen },
              ].map(({ label, value, desc, icon: Icon }) => (
                <Card key={label}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{label}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {value == null ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{value}</div>
                        <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Over Time</CardTitle>
                  <CardDescription>Daily revenue for the past 30 days</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {sales.length === 0 ? (
                    <Skeleton className="h-[240px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sales} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <defs>
                          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: string) => v.slice(5)} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v}`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                          itemStyle={{ color: "hsl(var(--foreground))" }}
                          formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revenueGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Growth</CardTitle>
                  <CardDescription>New customers per month</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {growth.length === 0 ? (
                    <Skeleton className="h-[240px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={growth} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                          itemStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Line type="monotone" dataKey="newCustomers" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="New Customers" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Category</CardTitle>
                  <CardDescription>Which genres generate the most revenue</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {categories.length === 0 ? (
                    <Skeleton className="h-[240px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <Pie data={categories} dataKey="revenue" nameKey="category" cx="50%" cy="50%" outerRadius={90} label={({ category }: { category: string }) => category}>
                          {categories.map((_: unknown, idx: number) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                          itemStyle={{ color: "hsl(var(--foreground))" }}
                          formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Books</CardTitle>
                  <CardDescription>Best performers by units sold</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {books.length === 0 ? (
                    <Skeleton className="h-[240px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={books} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis dataKey="title" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                          itemStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Bar dataKey="unitsSold" fill="hsl(var(--primary))" name="Units Sold" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
