import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  Clock,
  Zap,
  Fuel,
  Activity,
  TrendingUp,
  TrendingDown,
  Layers,
  Puzzle,
  BarChart2,
  PieChartIcon,
  Timer,
  Gauge,
} from "lucide-react";

const chainDisplayNames: Record<string, string> = {
  "solana": "Solana",
  "solana-devnet": "Solana Devnet",
  "eclipse": "Eclipse",
  "ethereum": "Ethereum",
  "polygon": "Polygon",
  "base": "Base",
  "arbitrum": "Arbitrum",
  "optimism": "Optimism",
  "avalanche": "Avalanche",
};

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#ef4444",
];

type PerformanceMetrics = {
  proofTimeAnalytics: {
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    trend: { timestamp: string; value: number }[];
  };
  gasAnalytics: {
    totalGasUsed: number;
    avgGasPerProof: number;
    byChain: { chain: string; totalGas: number; avgGas: number; count: number }[];
  };
  circuitComplexity: {
    totalCircuits: number;
    avgModulesPerCircuit: number;
    complexityDistribution: { range: string; count: number }[];
    byType: { type: string; count: number }[];
  };
  proofsByChain: { chain: string; verified: number; pending: number; failed: number }[];
  proofsByType: { type: string; count: number; avgTime: number }[];
  recentActivity: { date: string; proofs: number; gas: number }[];
};

function formatGas(gas: number): string {
  if (gas >= 1000000) return `${(gas / 1000000).toFixed(2)}M`;
  if (gas >= 1000) return `${(gas / 1000).toFixed(1)}K`;
  return gas.toString();
}

function formatTime(seconds: number): string {
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
  return `${seconds.toFixed(2)}s`;
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  loading,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | null;
  loading?: boolean;
}) {
  return (
    <Card data-testid={`metric-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{value}</span>
            {trend && (
              <Badge
                variant={trend === "up" ? "default" : "secondary"}
                className="text-xs"
              >
                {trend === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {trend === "up" ? "+12%" : "-5%"}
              </Badge>
            )}
          </div>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function MetricsPage() {
  const { data: metrics, isLoading } = useQuery<PerformanceMetrics>({
    queryKey: ["/api/metrics"],
    refetchInterval: 30000,
  });

  const proofTimeData = metrics?.proofTimeAnalytics.trend.map((t, i) => ({
    name: `P${i + 1}`,
    time: t.value,
  })) || [];

  const gasChainData = metrics?.gasAnalytics.byChain.map((c) => ({
    name: chainDisplayNames[c.chain] || c.chain,
    gas: Math.round(c.avgGas),
    count: c.count,
  })) || [];

  const complexityData = metrics?.circuitComplexity.complexityDistribution || [];

  const moduleTypeData = metrics?.circuitComplexity.byType.map((t) => ({
    name: t.type.replace("_", " "),
    value: t.count,
  })) || [];

  const proofChainData = metrics?.proofsByChain.map((c) => ({
    name: chainDisplayNames[c.chain] || c.chain,
    verified: c.verified,
    pending: c.pending,
    failed: c.failed,
  })) || [];

  const activityData = metrics?.recentActivity.map((a) => ({
    date: new Date(a.date).toLocaleDateString("en-US", { weekday: "short" }),
    proofs: a.proofs,
    gas: a.gas / 1000,
  })) || [];

  const hasData = metrics && (
    metrics.proofTimeAnalytics.trend.length > 0 ||
    metrics.gasAnalytics.byChain.length > 0 ||
    metrics.circuitComplexity.totalCircuits > 0
  );

  return (
    <div className="flex-1 overflow-auto p-6" data-testid="metrics-page">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            Performance Metrics
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor proof generation, gas costs, and circuit complexity analytics
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Avg Proof Time"
            value={metrics ? formatTime(metrics.proofTimeAnalytics.avg) : "–"}
            subtitle={metrics ? `P95: ${formatTime(metrics.proofTimeAnalytics.p95)}` : undefined}
            icon={Timer}
            trend={hasData ? "down" : null}
            loading={isLoading}
          />
          <MetricCard
            title="Total Gas Used"
            value={metrics ? formatGas(metrics.gasAnalytics.totalGasUsed) : "–"}
            subtitle={metrics ? `Avg: ${formatGas(metrics.gasAnalytics.avgGasPerProof)}/proof` : undefined}
            icon={Fuel}
            loading={isLoading}
          />
          <MetricCard
            title="Active Circuits"
            value={metrics?.circuitComplexity.totalCircuits || 0}
            subtitle={metrics ? `Avg ${metrics.circuitComplexity.avgModulesPerCircuit} modules` : undefined}
            icon={Layers}
            loading={isLoading}
          />
          <MetricCard
            title="Proof P50"
            value={metrics ? formatTime(metrics.proofTimeAnalytics.p50) : "–"}
            subtitle={metrics ? `Min: ${formatTime(metrics.proofTimeAnalytics.min)}` : undefined}
            icon={Gauge}
            loading={isLoading}
          />
        </div>

        <Tabs defaultValue="timing" className="space-y-4">
          <TabsList data-testid="metrics-tabs">
            <TabsTrigger value="timing" className="gap-1" data-testid="tab-timing">
              <Clock className="h-3 w-3" />
              Proof Timing
            </TabsTrigger>
            <TabsTrigger value="gas" className="gap-1" data-testid="tab-gas">
              <Fuel className="h-3 w-3" />
              Gas Analytics
            </TabsTrigger>
            <TabsTrigger value="circuits" className="gap-1" data-testid="tab-circuits">
              <Puzzle className="h-3 w-3" />
              Circuit Complexity
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-1" data-testid="tab-activity">
              <Activity className="h-3 w-3" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timing" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Proof Time Trend
                  </CardTitle>
                  <CardDescription>
                    Verification time for recent proofs (seconds)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : proofTimeData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No proof timing data yet</p>
                        <p className="text-xs">Generate proofs to see timing trends</p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={proofTimeData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`${value.toFixed(2)}s`, "Time"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="time"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary) / 0.2)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5" />
                    Time by Proof Type
                  </CardTitle>
                  <CardDescription>
                    Average verification time by circuit type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : !metrics?.proofsByType.length ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No proof type data yet</p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={metrics.proofsByType.slice(0, 6)}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="type" className="text-xs" angle={-45} textAnchor="end" height={80} />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`${value.toFixed(2)}s`, "Avg Time"]}
                        />
                        <Bar dataKey="avgTime" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Timing Statistics</CardTitle>
                <CardDescription>Detailed proof timing breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: "Average", value: metrics?.proofTimeAnalytics.avg || 0 },
                    { label: "Minimum", value: metrics?.proofTimeAnalytics.min || 0 },
                    { label: "Maximum", value: metrics?.proofTimeAnalytics.max || 0 },
                    { label: "P50 (Median)", value: metrics?.proofTimeAnalytics.p50 || 0 },
                    { label: "P95", value: metrics?.proofTimeAnalytics.p95 || 0 },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-lg font-semibold">{formatTime(stat.value)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gas" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fuel className="h-5 w-5" />
                    Gas by Chain
                  </CardTitle>
                  <CardDescription>
                    Average gas consumption per chain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : gasChainData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Fuel className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No gas data yet</p>
                        <p className="text-xs">Submit proofs to see gas analytics</p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={gasChainData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" className="text-xs" />
                        <YAxis dataKey="name" type="category" className="text-xs" width={100} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [formatGas(value), "Avg Gas"]}
                        />
                        <Bar dataKey="gas" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Proofs by Chain
                  </CardTitle>
                  <CardDescription>
                    Distribution of proofs across networks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : proofChainData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <PieChartIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No chain distribution data</p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={proofChainData.map((c) => ({
                            name: c.name,
                            value: c.verified + c.pending + c.failed,
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {proofChainData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Chain Gas Breakdown</CardTitle>
                <CardDescription>Detailed gas consumption by network</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : gasChainData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No chain data available</p>
                ) : (
                  <div className="space-y-3">
                    {metrics?.gasAnalytics.byChain.map((chain) => (
                      <div
                        key={chain.chain}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        data-testid={`gas-chain-${chain.chain}`}
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">
                            {chainDisplayNames[chain.chain] || chain.chain}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {chain.count} proofs
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatGas(chain.totalGas)}</p>
                          <p className="text-xs text-muted-foreground">
                            ~{formatGas(chain.avgGas)}/proof
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="circuits" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Complexity Distribution
                  </CardTitle>
                  <CardDescription>
                    Circuit size by module count
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : complexityData.every((d) => d.count === 0) ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No circuit complexity data</p>
                        <p className="text-xs">Create circuits to see distribution</p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={complexityData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="range" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Puzzle className="h-5 w-5" />
                    Module Types Used
                  </CardTitle>
                  <CardDescription>
                    Distribution of module types across circuits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : moduleTypeData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Puzzle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No module data</p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={moduleTypeData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {moduleTypeData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Circuit Statistics</CardTitle>
                <CardDescription>Overview of circuit complexity metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Total Circuits</p>
                    <p className="text-2xl font-bold">
                      {metrics?.circuitComplexity.totalCircuits || 0}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Avg Modules</p>
                    <p className="text-2xl font-bold">
                      {metrics?.circuitComplexity.avgModulesPerCircuit || 0}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Module Types</p>
                    <p className="text-2xl font-bold">
                      {metrics?.circuitComplexity.byType.length || 0}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Complex Circuits</p>
                    <p className="text-2xl font-bold">
                      {complexityData
                        .filter((d) => d.range === "6-10 modules" || d.range === "10+ modules")
                        .reduce((a, b) => a + b.count, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  7-Day Activity
                </CardTitle>
                <CardDescription>
                  Proof generation and gas usage over the past week
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80 w-full" />
                ) : activityData.every((d) => d.proofs === 0) ? (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No recent activity</p>
                      <p className="text-xs">Generate proofs to see activity trends</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis yAxisId="left" className="text-xs" />
                      <YAxis yAxisId="right" orientation="right" className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number, name: string) => [
                          name === "proofs" ? value : `${value.toFixed(1)}K`,
                          name === "proofs" ? "Proofs" : "Gas (K)",
                        ]}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="proofs"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                        name="Proofs"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="gas"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--chart-2))" }}
                        name="Gas (K)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-3">
              {activityData.slice(-3).reverse().map((day) => (
                <Card key={day.date} data-testid={`activity-${day.date}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{day.date}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold">{day.proofs}</p>
                        <p className="text-xs text-muted-foreground">Proofs</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {formatGas(day.gas * 1000)}
                        </p>
                        <p className="text-xs text-muted-foreground">Gas Used</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
