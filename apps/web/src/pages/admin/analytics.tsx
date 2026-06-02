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
import AdminSidebar from "@/components/AdminSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import { useAuth } from "@/hooks/useAuth";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#f97316", "#14b8a6", "#a855f7"];

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
                { label: "Total Revenue", value: stats ? `$${(stats.totalRevenue ?? 0).toFixed(2)}` : null, desc: "All-time revenue" },
                { label: "Total Customers", value: stats?.totalCustomers?.toString() ?? null, desc: "Registered customers" },
                { label: "Books in Catalog", value: stats?.totalBooks?.toString() ?? null, desc: "Unique titles" },
              ].map(({ label, value, desc }) => (
                <Card key={label}>
                  <CardHeader className="pb-2">
                    <CardDescription>{label}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {value == null ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <>
                        <div className="text-3xl font-bold">{value}</div>
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
                <CardContent>
                  {sales.length === 0 ? (
                    <Skeleton className="h-[240px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart data={sales}>
                        <defs>
                          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${v}`} />
                        <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]} />
                        <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revenueGrad)" strokeWidth={2} />
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
                <CardContent>
                  {growth.length === 0 ? (
                    <Skeleton className="h-[240px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={growth}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="newCustomers" stroke="#10b981" strokeWidth={2} dot={false} name="New Customers" />
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
                <CardContent>
                  {categories.length === 0 ? (
                    <Skeleton className="h-[240px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={categories} dataKey="revenue" nameKey="category" cx="50%" cy="50%" outerRadius={90} label={({ category }: { category: string }) => category}>
                          {categories.map((_: unknown, idx: number) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]} />
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
                <CardContent>
                  {books.length === 0 ? (
                    <Skeleton className="h-[240px] w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={books} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis dataKey="title" type="category" tick={{ fontSize: 10 }} width={120} />
                        <Tooltip />
                        <Bar dataKey="unitsSold" fill="#6366f1" name="Units Sold" radius={[0, 4, 4, 0]} />
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
