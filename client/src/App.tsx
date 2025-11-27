import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { SolanaProvider, WalletButton } from "@/components/wallet-provider";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import CircuitBuilder from "@/pages/circuit-builder";
import ProofDashboard from "@/pages/proof-dashboard";
import DataPortal from "@/pages/data-portal";
import Playground from "@/pages/playground";
import Metrics from "@/pages/metrics";
import DemoVoting from "@/pages/demo-voting";
import DemoMessaging from "@/pages/demo-messaging";
import DemoTransfers from "@/pages/demo-transfers";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/circuit-builder" component={CircuitBuilder} />
      <Route path="/proof-dashboard" component={ProofDashboard} />
      <Route path="/data-portal" component={DataPortal} />
      <Route path="/playground" component={Playground} />
      <Route path="/metrics" component={Metrics} />
      <Route path="/demo/voting" component={DemoVoting} />
      <Route path="/demo/messaging" component={DemoMessaging} />
      <Route path="/demo/transfers" component={DemoTransfers} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SolanaProvider>
        <TooltipProvider>
          <SidebarProvider style={sidebarStyle as React.CSSProperties}>
            <div className="flex h-screen w-full overflow-hidden">
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="h-14 flex items-center justify-between gap-4 px-4 border-b bg-background shrink-0">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <div className="flex items-center gap-3">
                    <WalletButton />
                    <ThemeToggle />
                  </div>
                </header>
                <main className="flex-1 overflow-auto">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </SolanaProvider>
    </QueryClientProvider>
  );
}

export default App;
