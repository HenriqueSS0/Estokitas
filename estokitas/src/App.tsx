import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { UTMProvider } from "@/hooks/useUTM";
import Index from "./pages/Index";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { ProdutosPage } from "./pages/dashboard/ProdutosPage";
import { CreateProdutoPage } from "./pages/dashboard/CreateProdutoPage";
import { EditProdutoPage } from "./pages/dashboard/EditProdutoPage";
import MovimentacoesPage from "./pages/dashboard/MovimentacoesPage";
import { ApiPage } from "./pages/dashboard/ApiPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <UTMProvider>
        <BrowserRouter>
          <TooltipProvider>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="produtos" element={<ProdutosPage />} />
                  <Route path="produtos/criar" element={<CreateProdutoPage />} />
                  <Route path="produtos/editar/:id" element={<EditProdutoPage />} />
                  <Route path="movimentacoes" element={<MovimentacoesPage />} />
                  <Route path="api" element={<ApiPage />} />
                </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </TooltipProvider>
        </BrowserRouter>
      </UTMProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
