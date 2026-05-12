import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing.tsx";
import Login from "./pages/Login.tsx";
import SignUp from "./pages/SignUp.tsx";
import ForgotPass from "./pages/ForgotPass.tsx";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import OnlineRead from "./pages/OnlineRead.tsx";
import Purchase from "./pages/Purchase.tsx";
import Issued from "./pages/Issued.tsx";
import Settings from "./pages/Settings.tsx";
import ReturnDeadline from "./pages/ReturnDeadline.tsx";
import Notifications from "./pages/Notifications.tsx";
import Search from "./pages/Search.tsx";
import BookDetails from "./pages/BookDetails.tsx";

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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
