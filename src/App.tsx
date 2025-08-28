import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Portfolio from "./pages/Portfolio";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import ProjectTemplate from "./pages/ProjectTemplate";
import Profile from "./pages/Profile";
import ProcessCardDemo from "./pages/PinnedNoteDemo";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/portfolio" replace />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/project/:id" element={<ProjectTemplate />} />
          <Route path="/process-card-demo" element={<ProcessCardDemo />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
