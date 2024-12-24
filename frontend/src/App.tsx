import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import BusinessDetails from "@/pages/BusinessDetails";
import CreateBusiness from "@/pages/CreateBusiness";
import EditBusiness from "@/pages/EditBusiness";
import Profile from "@/pages/Profile";
import AdminBusinessList from "@/pages/admin/BusinessList";
import AdminReviewList from "@/pages/admin/ReviewList";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/businesses/create" element={<CreateBusiness />} />
                <Route path="/businesses/:id" element={<BusinessDetails />} />
                <Route path="/businesses/:id/edit" element={<EditBusiness />} />
                <Route
                  path="/admin/businesses"
                  element={<AdminBusinessList />}
                />
                <Route path="/admin/reviews" element={<AdminReviewList />} />
              </Routes>
              <Toaster />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
