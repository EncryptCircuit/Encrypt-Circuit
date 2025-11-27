import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  GitBranch,
  ShieldCheck,
  Lock,
  Code2,
  ArrowRight,
  Zap,
  CheckCircle2,
  Clock,
  TrendingUp,
  Layers,
  AlertCircle,
} from "lucide-react";
import type { Proof, ChainStatus, Blockchain } from "@shared/schema";
import { chainDisplayNames, primaryChains } from "@shared/schema";
import { ChainIcon } from "@/components/chain-icons";

const chainColors: Record<Blockchain, string> = {
  solana: "bg-gradient-to-r from-[#9945FF] to-[#14F195]",
  "solana-devnet": "bg-[#9945FF]/50",
  eclipse: "bg-orange-500",
  ethereum: "bg-blue-500",
  polygon: "bg-purple-500",
  base: "bg-blue-600",
  arbitrum: "bg-blue-400",
  optimism: "bg-red-500",
  avalanche: "bg-red-400",
};

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
  return `${Math.floor(diff / 86400000)} days ago`;
}

const quickActions = [
  {
    title: "Build Circuit",
    description: "Create private logic circuits with drag-and-drop modules",
    icon: GitBranch,
    href: "/circuit-builder",
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Verify Proofs",
    description: "Monitor proof verification across multiple chains",
    icon: ShieldCheck,
    href: "/proof-dashboard",
    color: "bg-green-500/10 text-green-500",
  },
  {
    title: "Encrypt Data",
    description: "Submit encrypted data and verify computations",
    icon: Lock,
    href: "/data-portal",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "Try Demos",
    description: "Interactive examples of encrypted execution",
    icon: Code2,
    href: "/playground",
    color: "bg-purple-500/10 text-purple-500",
  },
];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<{
    activeCircuits: number;
    proofsVerified: number;
    encryptedOperations: number;
    avgProofTime: number;
  }>({
    queryKey: ["/api/stats"],
    refetchInterval: 10000,
  });

  const { data: proofs, isLoading: proofsLoading } = useQuery<Proof[]>({
    queryKey: ["/api/proofs"],
    refetchInterval: 5000,
  });

  const { data: chains, isLoading: chainsLoading } = useQuery<ChainStatus[]>({
    queryKey: ["/api/chains"],
    refetchInterval: 15000,
  });

  const recentActivity = proofs?.slice(0, 4) || [];

  const statItems = [
    {
      title: "Active Circuits",
      value: stats?.activeCircuits || 0,
      change: "+3 this week",
      icon: GitBranch,
      color: "text-primary",
    },
    {
      title: "Proofs Verified",
      value: stats?.proofsVerified?.toLocaleString() || 0,
      change: "+156 today",
      icon: ShieldCheck,
      color: "text-green-500",
    },
    {
      title: "Encrypted Operations",
      value: stats?.encryptedOperations?.toLocaleString() || 0,
      change: "99.8% success",
      icon: Lock,
      color: "text-blue-500",
    },
    {
      title: "Avg. Proof Time",
      value: `${stats?.avgProofTime || 0}s`,
      change: "-12% faster",
      icon: Clock,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your zero-knowledge infrastructure and proof verification status
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          statItems.map((stat) => (
            <Card key={stat.title} className="hover-elevate">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold" data-testid={`text-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-card ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link key={action.title} href={action.href}>
            <Card className="h-full hover-elevate cursor-pointer group" data-testid={`card-action-${action.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardContent className="p-6 flex flex-col gap-4">
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold flex items-center gap-2">
                    {action.title}
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Latest operations across your circuits</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/proof-dashboard" data-testid="link-view-all-activity">
                View All
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {proofsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))
            ) : recentActivity.length > 0 ? (
              recentActivity.map((proof) => (
                <div
                  key={proof.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover-elevate"
                  data-testid={`row-activity-${proof.id}`}
                >
                  <div className="p-2 rounded-lg bg-card">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{proof.type}</p>
                    <p className="text-xs text-muted-foreground capitalize">{proof.chain}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={proof.status === "verified" ? "default" : proof.status === "pending" ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {proof.status === "verified" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {proof.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                      {proof.status === "failed" && <AlertCircle className="h-3 w-3 mr-1" />}
                      {proof.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(proof.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Network Status
            </CardTitle>
            <CardDescription>Solana-first multi-chain verification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {chainsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-4 w-20 flex-1" />
                  <div className="text-right space-y-1">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </div>
              ))
            ) : (
              chains?.map((chain) => {
                const isPrimary = primaryChains.includes(chain.chain as typeof primaryChains[number]);
                return (
                  <div
                    key={chain.chain}
                    className={`flex items-center gap-3 p-3 rounded-lg ${isPrimary ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50'}`}
                    data-testid={`row-chain-${chain.chain.toLowerCase()}`}
                  >
                    <div className="relative">
                      <ChainIcon chain={chain.chain} size={20} />
                      <div className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background ${
                        chain.status === "online" ? "bg-green-500" : 
                        chain.status === "degraded" ? "bg-yellow-500" : "bg-red-500"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <p className="font-medium text-sm">{chainDisplayNames[chain.chain as Blockchain] || chain.chain}</p>
                      {isPrimary && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">Primary</Badge>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{chain.verificationCount}</p>
                      <p className="text-xs text-muted-foreground">{chain.avgLatency}ms</p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-[#9945FF]/10 via-[#14F195]/5 to-transparent border-[#9945FF]/20">
        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Ready to build on Solana?</h3>
              <p className="text-muted-foreground">
                Compose private logic with drag-and-drop modules and generate ZK proofs for Solana
              </p>
            </div>
          </div>
          <Button asChild data-testid="button-start-building" className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white border-0">
            <Link href="/circuit-builder">
              Start Building
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
