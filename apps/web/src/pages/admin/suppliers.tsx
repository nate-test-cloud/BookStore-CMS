import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useListSuppliers } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Mail, Phone, User } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import { useAuth } from "@/hooks/useAuth";

export default function AdminSuppliers() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { data, isLoading } = useListSuppliers();
  const suppliers = data?.data || [];
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
              <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
              <p className="text-muted-foreground">Manage your book suppliers and publisher relationships.</p>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 6 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : suppliers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          No suppliers found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      suppliers.map((supplier: { id: number; name: string; contactPerson?: string | null; email?: string | null; phone?: string | null; address?: string | null; notes?: string | null }) => (
                        <TableRow key={supplier.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-4 w-4 text-primary" />
                              </div>
                              <span className="font-medium">{supplier.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              {supplier.contactPerson ?? <span className="text-muted-foreground">—</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            {supplier.email ? (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                <a href={`mailto:${supplier.email}`} className="hover:underline text-primary">
                                  {supplier.email}
                                </a>
                              </div>
                            ) : <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell>
                            {supplier.phone ? (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                {supplier.phone}
                              </div>
                            ) : <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {supplier.address ?? "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">
                            {supplier.notes ?? "—"}
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
