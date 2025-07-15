
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "@/components/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index, { NewTripPageWrapper } from "./pages/Index";
import AddTransactionPageWrapper from "./pages/AddTransactionPageWrapper";
import AddRefuelPageWrapper from "./pages/AddRefuelPageWrapper";
import BackupPage from "./pages/BackupPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/new-trip" element={
              <ProtectedRoute>
                <NewTripPageWrapper />
              </ProtectedRoute>
            } />
            <Route path="/add-transaction" element={
              <ProtectedRoute>
                <AddTransactionPageWrapper />
              </ProtectedRoute>
            } />
            <Route path="/add-refuel" element={
              <ProtectedRoute>
                <AddRefuelPageWrapper />
              </ProtectedRoute>
            } />
            <Route path="/backup" element={
              <ProtectedRoute>
                <BackupPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
