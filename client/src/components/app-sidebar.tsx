import { useLocation, Link } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  GitBranch,
  ShieldCheck,
  Lock,
  Code2,
  Zap,
  ExternalLink,
  CircuitBoard,
  BarChart2,
} from "lucide-react";
import { SiX } from "react-icons/si";
import { WalletStatus } from "@/components/wallet-provider";
import logoUrl from "@assets/ChatGPT Image 27 Nov 2025, 03.43.10_1764218550927.png";

const mainNavItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Circuit Builder",
    url: "/circuit-builder",
    icon: GitBranch,
  },
  {
    title: "Proof Dashboard",
    url: "/proof-dashboard",
    icon: ShieldCheck,
  },
  {
    title: "Metrics",
    url: "/metrics",
    icon: BarChart2,
  },
  {
    title: "Data Portal",
    url: "/data-portal",
    icon: Lock,
  },
  {
    title: "Playground",
    url: "/playground",
    icon: Code2,
  },
];

const demoItems = [
  {
    title: "Private Voting",
    url: "/demo/voting",
    icon: Zap,
  },
  {
    title: "Encrypted Messaging",
    url: "/demo/messaging",
    icon: Zap,
  },
  {
    title: "Confidential Transfers",
    url: "/demo/transfers",
    icon: Zap,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-3" data-testid="link-home-logo">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-primary flex items-center justify-center">
            <img src={logoUrl} alt="Encrypt Circuit" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-sidebar-foreground">Encrypt Circuit</span>
            <span className="text-xs text-muted-foreground">ZK Compute Layer</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-medium px-4">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    className="gap-3"
                  >
                    <Link href={item.url} data-testid={`link-nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-medium px-4">
            Demos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {demoItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    className="gap-3"
                  >
                    <Link href={item.url} data-testid={`link-demo-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-3">
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-sidebar-accent/50">
          <CircuitBoard className="h-4 w-4 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">Wallet Status</p>
            <WalletStatus />
          </div>
        </div>
        <a
          href="https://x.com/EncryptCircuit"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground hover:text-sidebar-foreground transition-colors rounded-lg hover:bg-sidebar-accent/30"
          data-testid="link-social-x"
        >
          <SiX className="h-4 w-4" />
          <span>Follow @EncryptCircuit</span>
          <ExternalLink className="h-3 w-3 ml-auto" />
        </a>
      </SidebarFooter>
    </Sidebar>
  );
}
