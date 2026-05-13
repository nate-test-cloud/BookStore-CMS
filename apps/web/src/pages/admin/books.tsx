import { useListBooks, useCreateBook, getListBooksQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AdminSidebar from "@/components/AdminSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";

export default function AdminBooks() {
  const { data: booksResponse, isLoading } = useListBooks();
  const sidebarCollapsed = useSidebarCollapsed();

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="relative" style={{ marginLeft: "var(--sidebar-width, 272px)" }}>
        <TopSearchBar />
        <main className="p-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Books Management</h1>
              <p className="text-muted-foreground">Manage your bookstore inventory and catalog.</p>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [1, 2, 3, 4, 5].map((i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                        </TableRow>
                      ))
                    ) : booksResponse?.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                          No books found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      booksResponse?.data.map((book) => (
                        <TableRow key={book.id}>
                          <TableCell className="font-medium">{book.title}</TableCell>
                          <TableCell>{book.author}</TableCell>
                          <TableCell>{book.category}</TableCell>
                          <TableCell>${book.price.toFixed(2)}</TableCell>
                          <TableCell>{book.stock}</TableCell>
                          <TableCell>
                            <Badge variant={book.stock > 10 ? "default" : book.stock > 0 ? "secondary" : "destructive"}>
                              {book.stock > 10 ? "In Stock" : book.stock > 0 ? "Low Stock" : "Out of Stock"}
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