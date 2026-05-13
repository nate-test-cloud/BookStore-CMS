import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing.tsx";
import Login from "./pages/Login.tsx";
import SignUp from "./pages/SignUp.tsx";
import ForgotPass from "./pages/ForgotPass.tsx";
import Index from "./pages/customer/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import OnlineRead from "./pages/customer/OnlineRead.tsx";
import Purchase from "./pages/customer/Purchase.tsx";
import Issued from "./pages/customer/Issued.tsx";
import Settings from "./pages/customer/Settings.tsx";
import ReturnDeadline from "./pages/customer/ReturnDeadline.tsx";
import Notifications from "./pages/customer/Notifications.tsx";
import Search from "./pages/Search.tsx";
import BookDetails from "./pages/customer/BookDetails.tsx";
import AdminDashboard from "./pages/admin/dashboard.tsx";
import AdminBooks from "./pages/admin/books.tsx";
import AdminAnalytics from "./pages/admin/analytics.tsx";
import AdminSuppliers from "./pages/admin/suppliers.tsx";
import AdminCustomers from "./pages/admin/customers.tsx";
import AdminPOS from "./pages/admin/pos.tsx";
import AdminOrders from "./pages/admin/orders.tsx";
import AdminInventory from "./pages/admin/inventory.tsx";
import AdminSettings from "./pages/admin/settings.tsx";

//Start here
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* ALL ROUTES TO APPLICATION */}
          <Route path="/" element={<Landing />} />
          <Route path="/index" element={<Index />} />
          <Route path="/search" element={<Search />} />
          <Route path="/book-details/:id" element={<BookDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPass />} />
          <Route path="/return-deadline" element={<ReturnDeadline />} />
          <Route path="/online-read" element={<OnlineRead />} />
          <Route path="/purchase" element={<Purchase />} />
          <Route path="/issued" element={<Issued />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/books" element={<AdminBooks />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/pos" element={<AdminPOS />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/suppliers" element={<AdminSuppliers />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
