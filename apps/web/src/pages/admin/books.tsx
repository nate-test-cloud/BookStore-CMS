import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useListBooks, useUpdateBook, useDeleteBook, useCreateBook, Book } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AdminSidebar from "@/components/AdminSidebar";
import TopSearchBar from "@/components/TopSearchBar";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import { useAuth } from "@/hooks/useAuth";
import { Check, X, Plus, Minus, Upload } from "lucide-react";

type EditingBook = Book & { isEditing?: boolean };

interface NewBookForm {
  title: string;
  categoryId: string;
  authorIds: string[];
  isbn: string;
  basePrice: number;
  discountPercent: number;
  stock: number;
  description: string;
  publisherId?: string;
  subtitle?: string;
  coverImage: string;
}

export default function AdminBooks() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { data, isLoading, refetch } = useListBooks();
  const books = data?.data || [];
  const sidebarCollapsed = useSidebarCollapsed();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/unauthorized", { replace: true });
    }
  }, [isAdmin, navigate]);

  const [editingBooks, setEditingBooks] = useState<Record<number, EditingBook>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBook, setNewBook] = useState<NewBookForm>({
    title: '',
    categoryId: '',
    authorIds: [],
    isbn: '',
    basePrice: 0,
    discountPercent: 0,
    stock: 0,
    description: '',
    publisherId: '',
    subtitle: '',
    coverImage: '',
  });
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateMutation = useUpdateBook();
  const deleteMutation = useDeleteBook();
  const createMutation = useCreateBook();

  const startEditing = (book: Book) => {
    setEditingBooks(prev => ({
      ...prev,
      [book.id]: { ...book, isEditing: true }
    }));
  };

  const cancelEditing = (bookId: number) => {
    setEditingBooks(prev => {
      const newState = { ...prev };
      delete newState[bookId];
      return newState;
    });
  };

  const updateField = (bookId: number, field: string, value: any) => {
    setEditingBooks(prev => ({
      ...prev,
      [bookId]: { ...prev[bookId], [field]: value }
    }));
  };

  const handleSave = async (book: EditingBook) => {
    try {
      const originalBook = books.find(b => b.id === book.id);
      if (!originalBook) return;

      const updates: any = {};
      if (book.title !== originalBook.title) updates.title = book.title;
      // Map display fields to backend fields
      if (book.author !== originalBook.author) updates.author = book.author;
      if (book.category !== originalBook.category) updates.category = book.category;
      if (book.price !== originalBook.price) updates.basePrice = book.price;
      if (book.stock !== originalBook.stock) updates.stock = book.stock;

      if (Object.keys(updates).length === 0) {
        cancelEditing(book.id);
        return;
      }

      await updateMutation.mutateAsync({ id: book.id, data: updates });
      cancelEditing(book.id);
      refetch();
    } catch (error) {
      console.error('Error saving book:', error);
    }
  };

  const handleDelete = async (bookId: number) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteMutation.mutateAsync(bookId);
        refetch();
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  const toggleStatus = (bookId: number) => {
    const book = editingBooks[bookId] || books.find(b => b.id === bookId);
    if (!book) return;

    const statusOrder = ['In Stock', 'Low Stock', 'Out of Stock'];
    const currentIndex = statusOrder.indexOf(book.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

    updateField(bookId, 'status', nextStatus);
  };

  const getDisplayedBooks = () => {
    return books.map(book => editingBooks[book.id] || book);
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCoverImagePreview(base64);
        setNewBook(prev => ({ ...prev, coverImage: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBook = async () => {
    if (!newBook.title || !newBook.categoryId || newBook.authorIds.length === 0 || newBook.basePrice <= 0 || !newBook.isbn) {
      alert('Please fill in all required fields (title, category, author, ISBN, price)');
      return;
    }

    try {
      await createMutation.mutateAsync({
        data: {
          title: newBook.title,
          categoryId: newBook.categoryId,
          authorIds: newBook.authorIds,
          isbn: newBook.isbn,
          basePrice: newBook.basePrice,
          discountPercent: newBook.discountPercent || 0,
          stock: newBook.stock,
          description: newBook.description,
          publisherId: newBook.publisherId,
          subtitle: newBook.subtitle,
        }
      });

      // Reset form
      setNewBook({
        title: '',
        categoryId: '',
        authorIds: [],
        isbn: '',
        basePrice: 0,
        discountPercent: 0,
        stock: 0,
        description: '',
        publisherId: '',
        subtitle: '',
        coverImage: '',
      });
      setCoverImagePreview('');
      setShowAddModal(false);
      refetch();
    } catch (error) {
      console.error('Error creating book:', error);
      alert('Failed to create book');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="relative" style={{ marginLeft: "var(--sidebar-width, 272px)" }}>
        <TopSearchBar />
        <main className="p-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Books Management</h1>
                  <p className="text-muted-foreground">Manage your bookstore inventory and catalog.</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#926d24] text-white rounded-lg hover:opacity-90 transition"
                >
                  <Plus size={18} />
                  Add Book
                </button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
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
                            <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                          </TableRow>
                        ))
                      ) : books.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                            No books found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        getDisplayedBooks().map((book) => {
                          const isEditing = editingBooks[book.id]?.isEditing;
                          return (
                            <TableRow key={book.id} className={isEditing ? 'bg-muted/50' : ''}>
                              {/* Title */}
                              <TableCell className="font-medium">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={book.title}
                                    onChange={(e) => updateField(book.id, 'title', e.target.value)}
                                    className="w-full px-2 py-1 border rounded bg-white text-sm"
                                  />
                                ) : (
                                  <div
                                    onClick={() => startEditing(book)}
                                    className="cursor-pointer hover:text-blue-600 transition"
                                  >
                                    {book.title}
                                  </div>
                                )}
                              </TableCell>

                              {/* Author */}
                              <TableCell>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={book.author}
                                    onChange={(e) => updateField(book.id, 'author', e.target.value)}
                                    className="w-full px-2 py-1 border rounded bg-white text-sm"
                                  />
                                ) : (
                                  <div
                                    onClick={() => startEditing(book)}
                                    className="cursor-pointer hover:text-blue-600 transition"
                                  >
                                    {book.author}
                                  </div>
                                )}
                              </TableCell>

                              {/* Category */}
                              <TableCell>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={book.category}
                                    onChange={(e) => updateField(book.id, 'category', e.target.value)}
                                    className="w-full px-2 py-1 border rounded bg-white text-sm"
                                  />
                                ) : (
                                  <div
                                    onClick={() => startEditing(book)}
                                    className="cursor-pointer hover:text-blue-600 transition"
                                  >
                                    {book.category}
                                  </div>
                                )}
                              </TableCell>

                              {/* Price */}
                              <TableCell>
                                {isEditing ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => updateField(book.id, 'price', Math.max(0, book.price - 1))}
                                      className="p-1 hover:bg-gray-200 rounded"
                                      title="Decrease price"
                                    >
                                      <Minus size={16} />
                                    </button>
                                    <input
                                      type="number"
                                      value={book.price}
                                      onChange={(e) => updateField(book.id, 'price', parseFloat(e.target.value) || 0)}
                                      className="w-20 px-2 py-1 border rounded bg-white text-sm text-center"
                                    />
                                    <button
                                      onClick={() => updateField(book.id, 'price', book.price + 1)}
                                      className="p-1 hover:bg-gray-200 rounded"
                                      title="Increase price"
                                    >
                                      <Plus size={16} />
                                    </button>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => startEditing(book)}
                                    className="cursor-pointer hover:text-blue-600 transition group relative"
                                  >
                                    ${book.price.toFixed(2)}
                                    <div className="hidden group-hover:flex absolute left-0 top-6 gap-1 bg-white border rounded shadow-sm p-1 z-10">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          startEditing(book);
                                          setTimeout(() => {
                                            updateField(book.id, 'price', Math.max(0, book.price - 1));
                                          }, 0);
                                        }}
                                        className="p-1 hover:bg-gray-200 rounded"
                                        title="Decrease price"
                                      >
                                        <Minus size={16} />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          startEditing(book);
                                          setTimeout(() => {
                                            updateField(book.id, 'price', book.price + 1);
                                          }, 0);
                                        }}
                                        className="p-1 hover:bg-gray-200 rounded"
                                        title="Increase price"
                                      >
                                        <Plus size={16} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </TableCell>

                              {/* Stock */}
                              <TableCell>
                                {isEditing ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => updateField(book.id, 'stock', Math.max(0, book.stock - 1))}
                                      className="p-1 hover:bg-gray-200 rounded"
                                      title="Decrease stock"
                                    >
                                      <Minus size={16} />
                                    </button>
                                    <input
                                      type="number"
                                      value={book.stock}
                                      onChange={(e) => updateField(book.id, 'stock', parseInt(e.target.value) || 0)}
                                      className="w-16 px-2 py-1 border rounded bg-white text-sm text-center"
                                    />
                                    <button
                                      onClick={() => updateField(book.id, 'stock', book.stock + 1)}
                                      className="p-1 hover:bg-gray-200 rounded"
                                      title="Increase stock"
                                    >
                                      <Plus size={16} />
                                    </button>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => startEditing(book)}
                                    className="cursor-pointer hover:text-blue-600 transition group relative"
                                  >
                                    {book.stock}
                                    <div className="hidden group-hover:flex absolute left-0 top-6 gap-1 bg-white border rounded shadow-sm p-1 z-10">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          startEditing(book);
                                          setTimeout(() => {
                                            updateField(book.id, 'stock', Math.max(0, book.stock - 1));
                                          }, 0);
                                        }}
                                        className="p-1 hover:bg-gray-200 rounded"
                                        title="Decrease stock"
                                      >
                                        <Minus size={16} />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          startEditing(book);
                                          setTimeout(() => {
                                            updateField(book.id, 'stock', book.stock + 1);
                                          }, 0);
                                        }}
                                        className="p-1 hover:bg-gray-200 rounded"
                                        title="Increase stock"
                                      >
                                        <Plus size={16} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </TableCell>

                              {/* Status */}
                              <TableCell>
                                {isEditing ? (
                                  <button
                                    onClick={() => toggleStatus(book.id)}
                                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition"
                                  >
                                    {book.status}
                                  </button>
                                ) : (
                                  <Badge
                                    variant={book.stock > 10 ? "default" : book.stock > 0 ? "secondary" : "destructive"}
                                    className="cursor-pointer hover:opacity-80 transition"
                                    onClick={() => startEditing(book)}
                                  >
                                    {book.stock > 10 ? "In Stock" : book.stock > 0 ? "Low Stock" : "Out of Stock"}
                                  </Badge>
                                )}
                              </TableCell>

                              {/* Action */}
                              <TableCell>
                                {isEditing ? (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleSave(book)}
                                      disabled={updateMutation.isPending}
                                      className="p-1 hover:bg-green-100 rounded text-green-600 disabled:opacity-50"
                                      title="Save changes"
                                    >
                                      <Check size={18} />
                                    </button>
                                    <button
                                      onClick={() => cancelEditing(book.id)}
                                      className="p-1 hover:bg-gray-200 rounded"
                                      title="Cancel"
                                    >
                                      <X size={18} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleDelete(book.id)}
                                    disabled={deleteMutation.isPending}
                                    className="p-1 hover:bg-red-100 rounded text-red-600 disabled:opacity-50"
                                    title="Delete book"
                                  >
                                    <X size={18} />
                                  </button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add New Book</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    value={newBook.title}
                    onChange={(e) => setNewBook(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter book title"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Author IDs */}
                <div>
                  <label className="block text-sm font-medium mb-1">Author(s) *</label>
                  <input
                    type="text"
                    placeholder="Enter author ID (or create new author via API)"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      if (e.target.value) {
                        setNewBook(prev => ({ ...prev, authorIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean) }));
                      } else {
                        setNewBook(prev => ({ ...prev, authorIds: [] }));
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma-separated author IDs</p>
                </div>

                {/* Category ID */}
                <div>
                  <label className="block text-sm font-medium mb-1">Category ID *</label>
                  <input
                    type="text"
                    value={newBook.categoryId}
                    onChange={(e) => setNewBook(prev => ({ ...prev, categoryId: e.target.value }))}
                    placeholder="Enter category ID"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* ISBN */}
                <div>
                  <label className="block text-sm font-medium mb-1">ISBN</label>
                  <input
                    type="text"
                    value={newBook.isbn}
                    onChange={(e) => setNewBook(prev => ({ ...prev, isbn: e.target.value }))}
                    placeholder="Enter ISBN"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Base Price and Discount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Base Price *</label>
                    <input
                      type="number"
                      value={newBook.basePrice}
                      onChange={(e) => setNewBook(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Discount %</label>
                    <input
                      type="number"
                      value={newBook.discountPercent}
                      onChange={(e) => setNewBook(prev => ({ ...prev, discountPercent: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                      step="0.1"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium mb-1">Stock *</label>
                  <input
                    type="number"
                    value={newBook.stock}
                    onChange={(e) => setNewBook(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Publisher ID */}
                <div>
                  <label className="block text-sm font-medium mb-1">Publisher ID</label>
                  <input
                    type="text"
                    value={newBook.publisherId || ''}
                    onChange={(e) => setNewBook(prev => ({ ...prev, publisherId: e.target.value }))}
                    placeholder="Enter publisher ID (optional)"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-sm font-medium mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={newBook.subtitle || ''}
                    onChange={(e) => setNewBook(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Enter book subtitle (optional)"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={newBook.description}
                    onChange={(e) => setNewBook(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter book description"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium mb-1">Cover Image</label>
                  <div className="flex gap-3 items-start">
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg hover:bg-gray-50 transition"
                      >
                        <Upload size={18} />
                        Upload Cover Image
                      </button>
                    </div>
                    {coverImagePreview && (
                      <div className="w-24 h-32 rounded border overflow-hidden">
                        <img
                          src={coverImagePreview}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Or paste image URL:</p>
                  <input
                    type="text"
                    placeholder="Enter image URL"
                    value={newBook.coverImage && !coverImagePreview ? newBook.coverImage : ''}
                    onChange={(e) => {
                      if (!coverImagePreview) {
                        setNewBook(prev => ({ ...prev, coverImage: e.target.value }));
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t">
                  <button
                    onClick={handleAddBook}
                    disabled={createMutation.isPending}
                    className="flex-1 px-4 py-2 bg-[#926d24] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Check size={18} />
                    {createMutation.isPending ? 'Creating...' : 'Create Book'}
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center justify-center gap-2"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}