import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as HotToast } from "react-hot-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Map from "./pages/Map";
import Allocation from "./pages/Allocation";
import Predictive from "./pages/Predictive";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  console.log('App component rendering...');
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HotToast 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

// Separate component to ensure it's definitely inside Router context
const AppContent = () => {
  console.log('AppContent rendering inside Router...');
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-surface">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Top Header Bar */}
          <header className="h-14 flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm border-b border-border">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="hover:bg-accent rounded-md p-2" />
              <div className="text-sm text-muted-foreground">
                Emergency Operations Center
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-success">Online</span>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/map" element={<Map />} />
              <Route path="/allocation" element={<Allocation />} />
              <Route path="/predictive" element={<Predictive />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default App;
