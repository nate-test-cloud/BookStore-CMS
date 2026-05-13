import { useListCustomers } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AdminSidebar from "@/components/AdminSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";

export default function AdminCustomers() {
  const { data: response, isLoading } = useListCustomers();
  const sidebarCollapsed = useSidebarCollapsed();

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="relative" style={{ marginLeft: "var(--sidebar-width, 272px)" }}>
        <TopSearchBar />
        <main className="p-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
              <p className="text-muted-foreground">Manage your customer relationships and loyalty programs.</p>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Total Orders</TableHead>
                      <TableHead className="text-right">Total Spent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [1, 2, 3, 4, 5].map((i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-[150px]" />
                                <Skeleton className="h-3 w-[100px]" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-4 w-[80px] ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : !response?.data || response.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                          No customers found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      response.data.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={customer.avatarUrl || ""} />
                                <AvatarFallback>{customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium">{customer.name}</span>
                                <span className="text-xs text-muted-foreground">{customer.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{customer.phone || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {customer.tier}
                            </Badge>
                          </TableCell>
                          <TableCell>{customer.totalOrders || 0}</TableCell>
                          <TableCell className="text-right font-medium">
                            ${customer.totalSpent?.toFixed(2) || "0.00"}
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