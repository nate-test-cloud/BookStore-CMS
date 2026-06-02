import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useListOrders } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AdminSidebar from "@/components/AdminSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import { useAuth } from "@/hooks/useAuth";

export default function AdminOrders() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { data: response, isLoading } = useListOrders();
  const sidebarCollapsed = useSidebarCollapsed();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/unauthorized", { replace: true });
    }
  }, [isAdmin, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="relative" style={{ marginLeft: "var(--sidebar-width, 272px)" }}>
        <TopSearchBar />
        <main className="p-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
              <p className="text-muted-foreground">Manage and track customer orders.</p>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [1, 2, 3, 4, 5].map((i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                        </TableRow>
                      ))
                    ) : !response?.data || response.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                          No orders found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      response.data.map((order, index) => (
                        <TableRow key={`${order.id}-${index}-${order.createdAt}`}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>{order.customerName || "Walk-in"}</TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{order.items?.length || 0}</TableCell>
                          <TableCell>${order.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                order.status === 'delivered' ? 'default' :
                                  order.status === 'shipped' ? 'secondary' :
                                    order.status === 'returned' ? 'destructive' : 'outline'
                              }
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}