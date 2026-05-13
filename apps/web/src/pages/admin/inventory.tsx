import { useGetLowStockBooks } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AdminSidebar from "@/components/AdminSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";

export default function AdminInventory() {
  const { data: books, isLoading } = useGetLowStockBooks();
  const sidebarCollapsed = useSidebarCollapsed();

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="relative" style={{ marginLeft: "var(--sidebar-width, 272px)" }}>
        <TopSearchBar />
        <main className="p-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Low Stock Inventory</h1>
              <p className="text-muted-foreground">Items that need to be restocked soon.</p>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Cost Price</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [1, 2, 3].map((i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                        </TableRow>
                      ))
                    ) : !books || books.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                          All items are well stocked!
                        </TableCell>
                      </TableRow>
                    ) : (
                      books.map((book) => (
                        <TableRow key={book.id}>
                          <TableCell className="font-medium">{book.title}</TableCell>
                          <TableCell>{book.category}</TableCell>
                          <TableCell>{book.supplierId ? `Supplier #${book.supplierId}` : "N/A"}</TableCell>
                          <TableCell>${book.costPrice?.toFixed(2) || "N/A"}</TableCell>
                          <TableCell className="font-bold text-destructive">{book.stock}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">
                              Needs Restock
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