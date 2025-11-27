import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Lock,
  Unlock,
  ArrowRight,
  Copy,
  Download,
  CheckCircle2,
  Clock,
  Zap,
  Shield,
  FileText,
  Hash,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { EncryptedData } from "@shared/schema";

const algorithms = [
  { id: "poseidon", name: "Poseidon Hash", description: "ZK-friendly hash function" },
  { id: "pedersen", name: "Pedersen Commitment", description: "Homomorphic commitment" },
  { id: "mimc", name: "MiMC Hash", description: "Minimal multiplicative complexity" },
  { id: "rescue", name: "Rescue Hash", description: "Algebraic hash function" },
];

interface VerificationStep {
  id: string;
  name: string;
  description: string;
  status: "pending" | "active" | "completed" | "failed";
  timestamp?: string;
  hash?: string;
}

export default function DataPortal() {
  const [plainData, setPlainData] = useState("");
  const [encryptedData, setEncryptedData] = useState("");
  const [encryptedId, setEncryptedId] = useState<string | null>(null);
  const [algorithm, setAlgorithm] = useState("poseidon");
  const [showPlainData, setShowPlainData] = useState(true);
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    { id: "submit", name: "Submit", description: "Data submitted to network", status: "pending" },
    { id: "compute", name: "Compute", description: "ZK computation in progress", status: "pending" },
    { id: "verify", name: "Verify", description: "Proof verification complete", status: "pending" },
  ]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [computationResult, setComputationResult] = useState<{
    inputHash: string;
    outputHash: string;
    proofHash: string;
  } | null>(null);
  const { toast } = useToast();

  const encryptMutation = useMutation({
    mutationFn: async (data: { plainData: string; algorithm: string }) => {
      const res = await apiRequest("POST", "/api/encrypt", data);
      return res.json() as Promise<EncryptedData>;
    },
    onSuccess: (data) => {
      setEncryptedData(data.encryptedData);
      setEncryptedId(data.id);
      toast({
        title: "Data Encrypted",
        description: "Your data has been encrypted with ZK-friendly hash.",
      });
    },
    onError: () => {
      toast({
        title: "Encryption Failed",
        description: "Failed to encrypt data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/encrypted/${id}/verify`, {});
      return res.json();
    },
    onSuccess: (data) => {
      setComputationResult(data);
      toast({
        title: "Verification Complete",
        description: "Computation has been verified successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Verification Failed",
        description: "Failed to verify computation.",
        variant: "destructive",
      });
    },
  });

  const generateHash = (input: string): string => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return "0x" + Math.abs(hash).toString(16).padStart(64, "0").slice(0, 64);
  };

  const handleEncrypt = async () => {
    if (!plainData.trim()) return;
    encryptMutation.mutate({ plainData, algorithm });
  };

  const handleVerifyComputation = async () => {
    if (!encryptedData || !encryptedId) {
      toast({
        title: "Cannot Verify",
        description: "Please encrypt data first before verifying.",
        variant: "destructive",
      });
      return;
    }
    setIsVerifying(true);
    setComputationResult(null);

    const steps = [...verificationSteps];

    steps[0].status = "active";
    setVerificationSteps([...steps]);
    await new Promise((r) => setTimeout(r, 600));
    steps[0].status = "completed";
    steps[0].timestamp = new Date().toISOString();
    steps[0].hash = generateHash(plainData);

    steps[1].status = "active";
    setVerificationSteps([...steps]);
    await new Promise((r) => setTimeout(r, 800));
    steps[1].status = "completed";
    steps[1].timestamp = new Date().toISOString();
    steps[1].hash = generateHash(encryptedData);

    steps[2].status = "active";
    setVerificationSteps([...steps]);

    try {
      const result = await verifyMutation.mutateAsync(encryptedId);
      steps[2].status = "completed";
      steps[2].timestamp = new Date().toISOString();
      steps[2].hash = result.proofHash;
      setVerificationSteps([...steps]);
      setComputationResult(result);
    } catch {
      steps[2].status = "failed";
      setVerificationSteps([...steps]);
    }

    setIsVerifying(false);
  };

  const resetVerification = () => {
    setVerificationSteps([
      { id: "submit", name: "Submit", description: "Data submitted to network", status: "pending" },
      { id: "compute", name: "Compute", description: "ZK computation in progress", status: "pending" },
      { id: "verify", name: "Verify", description: "Proof verification complete", status: "pending" },
    ]);
    setComputationResult(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-data-portal-title">Data Portal</h1>
        <p className="text-muted-foreground">
          Encrypt data, submit computations, and verify results without revealing inputs
        </p>
      </div>

      <Tabs defaultValue="encrypt" className="space-y-6">
        <TabsList>
          <TabsTrigger value="encrypt" data-testid="tab-encrypt">
            <Lock className="h-4 w-4 mr-2" />
            Encrypt Data
          </TabsTrigger>
          <TabsTrigger value="verify" data-testid="tab-verify">
            <Shield className="h-4 w-4 mr-2" />
            Verify Computation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="encrypt" className="space-y-6">
          {/* Algorithm Selection */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Encryption Algorithm</CardTitle>
              <CardDescription>Select a ZK-friendly cryptographic algorithm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {algorithms.map((alg) => (
                  <div
                    key={alg.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      algorithm === alg.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover-elevate"
                    }`}
                    onClick={() => setAlgorithm(alg.id)}
                    data-testid={`algorithm-${alg.id}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{alg.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{alg.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Encryption Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Panel */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Plain Data</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPlainData(!showPlainData)}
                    data-testid="button-toggle-visibility"
                  >
                    {showPlainData ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </div>
                <CardDescription>Enter data to be encrypted and submitted</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter your sensitive data here..."
                  value={plainData}
                  onChange={(e) => setPlainData(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                  style={{ WebkitTextSecurity: showPlainData ? "none" : "disc" } as any}
                  data-testid="input-plain-data"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {plainData.length} characters
                  </p>
                  <Button
                    onClick={handleEncrypt}
                    disabled={!plainData.trim() || encryptMutation.isPending}
                    data-testid="button-encrypt"
                  >
                    {encryptMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Encrypting...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Encrypt
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Output Panel */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-lg">Encrypted Output</CardTitle>
                </div>
                <CardDescription>Cryptographically sealed data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Textarea
                    value={encryptedData}
                    readOnly
                    className="min-h-[200px] font-mono text-sm bg-muted/50"
                    placeholder="Encrypted data will appear here..."
                    data-testid="output-encrypted-data"
                  />
                  {encryptedData && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(encryptedData)}
                        data-testid="button-copy-encrypted"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                {encryptedData && (
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      {algorithm.toUpperCase()}
                    </Badge>
                    <Button variant="outline" size="sm" data-testid="button-download-encrypted">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="verify" className="space-y-6">
          {/* Verification Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Computation Verification</CardTitle>
              <CardDescription>
                Submit encrypted data and verify computations without revealing inputs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step Visualization */}
              <div className="flex items-center justify-between">
                {verificationSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                          step.status === "completed"
                            ? "bg-green-500 border-green-500 text-white"
                            : step.status === "active"
                            ? "bg-primary border-primary text-white animate-pulse"
                            : step.status === "failed"
                            ? "bg-red-500 border-red-500 text-white"
                            : "bg-muted border-muted-foreground/20"
                        }`}
                      >
                        {step.status === "completed" ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : step.status === "active" ? (
                          <Zap className="h-6 w-6" />
                        ) : step.status === "failed" ? (
                          <AlertCircle className="h-6 w-6" />
                        ) : (
                          <Clock className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="mt-3 text-center">
                        <p className="font-medium text-sm">{step.name}</p>
                        <p className="text-xs text-muted-foreground max-w-[120px]">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    {index < verificationSteps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-4 transition-all ${
                          verificationSteps[index + 1].status !== "pending"
                            ? "bg-green-500"
                            : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 pt-4">
                {!computationResult ? (
                  <Button
                    size="lg"
                    onClick={handleVerifyComputation}
                    disabled={!encryptedData || isVerifying}
                    data-testid="button-verify-computation"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Verify Computation
                      </>
                    )}
                  </Button>
                ) : (
                  <Button variant="outline" size="lg" onClick={resetVerification} data-testid="button-reset-verification">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Start New Verification
                  </Button>
                )}
              </div>

              {/* Results */}
              {computationResult && (
                <div className="mt-6 p-6 rounded-lg bg-green-500/5 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">Verification Complete</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-card">
                      <p className="text-xs text-muted-foreground uppercase mb-1">Input Hash</p>
                      <p className="font-mono text-xs truncate" data-testid="text-input-hash">
                        {computationResult.inputHash}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-card">
                      <p className="text-xs text-muted-foreground uppercase mb-1">Output Hash</p>
                      <p className="font-mono text-xs truncate" data-testid="text-output-hash">
                        {computationResult.outputHash}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-card">
                      <p className="text-xs text-muted-foreground uppercase mb-1">Proof Hash</p>
                      <p className="font-mono text-xs truncate" data-testid="text-proof-hash">
                        {computationResult.proofHash}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm" data-testid="button-download-proof">
                      <Download className="h-4 w-4 mr-2" />
                      Download Proof
                    </Button>
                  </div>
                </div>
              )}

              {!encryptedData && (
                <div className="text-center py-8 text-muted-foreground">
                  <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Encrypt data first to verify computations</p>
                  <p className="text-sm">Go to the Encrypt Data tab to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
