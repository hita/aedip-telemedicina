import { Switch, Route } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import NewCase from "@/pages/new-case";
import CaseDetail from "@/pages/case-detail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/nuevo-caso" component={NewCase} />
      <Route path="/caso/:id" component={CaseDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { data: user } = useQuery<{user: {id: number, email: string, rol: string, nombre: string}}>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const isExpert = user?.user?.rol === "experto";
  
  return (
    <div className={`min-h-screen bg-white ${isExpert ? 'w-full' : 'max-w-md mx-auto shadow-lg'}`}>
      <Toaster />
      <Router />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
