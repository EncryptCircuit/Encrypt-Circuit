import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronRight,
  Zap,
  Activity,
  TrendingUp,
  Layers,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Proof, ChainStatus, Blockchain } from "@shared/schema";
import { chainDisplayNames, primaryChains } from "@shared/schema";
import { ChainIcon } from "@/components/chain-icons";

const chainColors: Record<Blockchain, string> = {
  solana: "bg-gradient-to-r from-[#9945FF] to-[#14F195]",
  "solana-devnet": "bg-gradient-to-r from-[#9945FF]/70 to-[#14F195]/70",
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

export default function ProofDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [chainFilter, setChainFilter] = useState<string>("all");
  const [expandedProof, setExpandedProof] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: proofs = [], isLoading: proofsLoading, refetch: refetchProofs } = useQuery<Proof[]>({
    queryKey: ["/api/proofs"],
    refetchInterval: 5000,
  });

  const { data: chainStatus = [], isLoading: chainsLoading } = useQuery<ChainStatus[]>({
    queryKey: ["/api/chains"],
    refetchInterval: 15000,
  });

  const filteredProofs = proofs.filter((proof) => {
    const matchesSearch = proof.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proof.proofHash.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || proof.status === statusFilter;
    const matchesChain = chainFilter === "all" || proof.chain === chainFilter;
    return matchesSearch && matchesStatus && matchesChain;
  });

  const stats = {
    total: proofs.length,
    verified: proofs.filter((p) => p.status === "verified").length,
    pending: proofs.filter((p) => p.status === "pending").length,
    failed: proofs.filter((p) => p.status === "failed").length,
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchProofs();
    await queryClient.invalidateQueries({ queryKey: ["/api/chains"] });
    setIsRefreshing(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-proof-dashboard-title">Proof Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and verify zero-knowledge proofs across multiple chains
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing} data-testid="button-refresh-proofs">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-stat-total">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Proofs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500" data-testid="text-stat-verified">{stats.verified}</p>
              <p className="text-sm text-muted-foreground">Verified</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-yellow-500/10">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-500" data-testid="text-stat-pending">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-red-500/10">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500" data-testid="text-stat-failed">{stats.failed}</p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="proofs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="proofs" data-testid="tab-proofs">Proofs</TabsTrigger>
          <TabsTrigger value="chains" data-testid="tab-chains">Chain Status</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="proofs" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search proofs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-proofs"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={chainFilter} onValueChange={setChainFilter}>
              <SelectTrigger className="w-44" data-testid="select-chain-filter">
                <SelectValue placeholder="Chain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chains</SelectItem>
                <SelectItem value="solana">Solana (Primary)</SelectItem>
                <SelectItem value="solana-devnet">Solana Devnet</SelectItem>
                <SelectItem value="eclipse">Eclipse</SelectItem>
                <SelectItem value="ethereum">Ethereum</SelectItem>
                <SelectItem value="polygon">Polygon</SelectItem>
                <SelectItem value="base">Base</SelectItem>
                <SelectItem value="arbitrum">Arbitrum</SelectItem>
                <SelectItem value="optimism">Optimism</SelectItem>
                <SelectItem value="avalanche">Avalanche</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Proofs Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Proof ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Chain</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProofs.map((proof) => (
                    <>
                      <TableRow
                        key={proof.id}
                        className="cursor-pointer hover-elevate"
                        onClick={() => setExpandedProof(expandedProof === proof.id ? null : proof.id)}
                        data-testid={`row-proof-${proof.id}`}
                      >
                        <TableCell>
                          {expandedProof === proof.id ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{proof.proofHash}</TableCell>
                        <TableCell>{proof.type}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              proof.status === "verified" ? "default" :
                              proof.status === "pending" ? "secondary" : "destructive"
                            }
                            className="gap-1"
                          >
                            {proof.status === "verified" && <CheckCircle2 className="h-3 w-3" />}
                            {proof.status === "pending" && <Clock className="h-3 w-3" />}
                            {proof.status === "failed" && <XCircle className="h-3 w-3" />}
                            {proof.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ChainIcon chain={proof.chain} size={16} />
                            <span>{chainDisplayNames[proof.chain]}</span>
                            {primaryChains.includes(proof.chain as typeof primaryChains[number]) && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 ml-1">Primary</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatTimeAgo(proof.timestamp)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(proof.proofHash);
                              }}
                              data-testid={`button-copy-${proof.id}`}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" data-testid={`button-view-${proof.id}`}>
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedProof === proof.id && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/50">
                            <div className="p-4 space-y-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase">Verification Time</p>
                                  <p className="font-medium">{proof.verificationTime ? `${proof.verificationTime}s` : "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase">Gas Used</p>
                                  <p className="font-medium">{proof.gasUsed ? proof.gasUsed.toLocaleString() : "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase">Inputs</p>
                                  <p className="font-medium">{proof.details?.inputs || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase">Constraints</p>
                                  <p className="font-medium">{proof.details?.constraints?.toLocaleString() || "N/A"}</p>
                                </div>
                              </div>
                              {proof.details?.error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                  <p className="text-sm text-red-500">{proof.details.error}</p>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chains" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chainStatus.map((chain) => {
              const isPrimary = primaryChains.includes(chain.chain as typeof primaryChains[number]);
              return (
                <Card key={chain.chain} className={isPrimary ? 'border-primary/30' : ''} data-testid={`card-chain-${chain.chain}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <ChainIcon chain={chain.chain} size={24} />
                        <h3 className="font-semibold">{chainDisplayNames[chain.chain]}</h3>
                        {isPrimary && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">Primary</Badge>}
                      </div>
                      <Badge
                        variant={chain.status === "online" ? "default" : chain.status === "degraded" ? "secondary" : "destructive"}
                        className="gap-1"
                      >
                        <div className={`h-1.5 w-1.5 rounded-full ${
                          chain.status === "online" ? "bg-green-500 animate-pulse" :
                          chain.status === "degraded" ? "bg-yellow-500" : "bg-red-500"
                        }`} />
                        {chain.status}
                      </Badge>
                    </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Verifications</p>
                      <p className="text-xl font-bold">{chain.verificationCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Latency</p>
                      <p className="text-xl font-bold">{chain.avgLatency}ms</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">Latest Block</p>
                    <p className="font-mono text-sm">{chain.lastBlock.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Verification Trend
                </CardTitle>
                <CardDescription>Proofs verified over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Verification trend chart</p>
                    <p className="text-xs">Real-time analytics coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Chain Distribution
                </CardTitle>
                <CardDescription>Proofs by blockchain network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chainStatus.map((chain) => {
                    const totalVerifications = chainStatus.reduce((sum, c) => sum + c.verificationCount, 0);
                    const percentage = totalVerifications > 0 ? (chain.verificationCount / totalVerifications) * 100 : 0;
                    const isPrimary = primaryChains.includes(chain.chain as typeof primaryChains[number]);
                    return (
                      <div key={chain.chain} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <ChainIcon chain={chain.chain} size={16} />
                            <span>{chainDisplayNames[chain.chain]}</span>
                            {isPrimary && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">Primary</Badge>}
                          </div>
                          <span className="text-muted-foreground">{chain.verificationCount} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${chainColors[chain.chain]} transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
