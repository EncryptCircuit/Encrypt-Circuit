import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ArrowRightLeft,
  Send,
  Lock,
  Shield,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  RefreshCw,
  Zap,
  Wallet,
  Hash,
  AlertCircle,
} from "lucide-react";

interface TransferStep {
  id: string;
  name: string;
  description: string;
  status: "pending" | "active" | "completed";
}

export default function DemoTransfers() {
  const [senderAddress, setSenderAddress] = useState("0x7a9f...3d2e");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TransferStep[]>([
    { id: "blind", name: "Blind Amount", description: "Creating Pedersen commitment", status: "pending" },
    { id: "range", name: "Range Proof", description: "Proving amount is valid", status: "pending" },
    { id: "transfer", name: "Transfer Proof", description: "Generating transfer proof", status: "pending" },
    { id: "verify", name: "Verify & Execute", description: "On-chain verification", status: "pending" },
  ]);
  const [proofData, setProofData] = useState<{
    blindedAmount: string;
    rangeProof: string;
    transferProof: string;
    txHash: string;
  } | null>(null);

  const balance = 1000;

  const generateHash = (length: number = 64): string => {
    return "0x" + Array.from({ length }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
  };

  const executeTransfer = async () => {
    if (!recipientAddress || !amount || parseFloat(amount) <= 0) return;
    
    setIsProcessing(true);
    setIsComplete(false);
    setProofData(null);

    const newSteps = [...steps];

    for (let i = 0; i < steps.length; i++) {
      newSteps[i].status = "active";
      setSteps([...newSteps]);
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, 1200));
      newSteps[i].status = "completed";
      setSteps([...newSteps]);
    }

    setProofData({
      blindedAmount: generateHash(32),
      rangeProof: generateHash(48),
      transferProof: generateHash(64),
      txHash: generateHash(64),
    });

    setIsComplete(true);
    setIsProcessing(false);
  };

  const resetTransfer = () => {
    setRecipientAddress("");
    setAmount("");
    setIsComplete(false);
    setProofData(null);
    setCurrentStep(0);
    setSteps([
      { id: "blind", name: "Blind Amount", description: "Creating Pedersen commitment", status: "pending" },
      { id: "range", name: "Range Proof", description: "Proving amount is valid", status: "pending" },
      { id: "transfer", name: "Transfer Proof", description: "Generating transfer proof", status: "pending" },
      { id: "verify", name: "Verify & Execute", description: "On-chain verification", status: "pending" },
    ]);
  };

  const progress = (steps.filter((s) => s.status === "completed").length / steps.length) * 100;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/playground" data-testid="link-back-playground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <ArrowRightLeft className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-demo-title">Confidential Transfers Demo</h1>
            <p className="text-muted-foreground">Transfer assets with hidden amounts</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transfer Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Send Confidential Transfer
            </CardTitle>
            <CardDescription>
              Amount and parties are hidden using zero-knowledge proofs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sender Info */}
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">From</span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {senderAddress}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Available Balance</span>
                <span className="font-semibold">{balance.toLocaleString()} ETH</span>
              </div>
            </div>

            {!isComplete ? (
              <>
                {/* Recipient */}
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Address</Label>
                  <Input
                    id="recipient"
                    placeholder="0x..."
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    disabled={isProcessing}
                    data-testid="input-recipient"
                  />
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={isProcessing}
                      className="pr-16"
                      data-testid="input-amount"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      ETH
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Amount will be hidden in the transaction
                  </p>
                </div>

                {/* Progress */}
                {isProcessing && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Generating Proofs</span>
                      <span className="text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="space-y-2">
                      {steps.map((step, index) => (
                        <div
                          key={step.id}
                          className={`flex items-center gap-3 p-2 rounded ${
                            step.status === "active" ? "bg-primary/10" : ""
                          }`}
                        >
                          {step.status === "completed" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : step.status === "active" ? (
                            <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{step.name}</p>
                            <p className="text-xs text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={executeTransfer}
                  disabled={!recipientAddress || !amount || parseFloat(amount) <= 0 || isProcessing}
                  className="w-full"
                  data-testid="button-send-transfer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Confidential Transfer
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-1">Transfer Complete!</h3>
                  <p className="text-sm text-muted-foreground">
                    Amount was transferred without revealing the value
                  </p>
                </div>

                <Button variant="outline" onClick={() => setShowDetails(!showDetails)} className="w-full" data-testid="button-toggle-details">
                  {showDetails ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showDetails ? "Hide Details" : "Show Details"}
                </Button>

                {showDetails && proofData && (
                  <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Blinded Amount</p>
                      <p className="font-mono text-xs break-all">{proofData.blindedAmount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Range Proof</p>
                      <p className="font-mono text-xs break-all">{proofData.rangeProof}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Transfer Proof</p>
                      <p className="font-mono text-xs break-all">{proofData.transferProof}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                      <p className="font-mono text-xs break-all text-primary" data-testid="text-tx-hash">{proofData.txHash}</p>
                    </div>
                  </div>
                )}

                <Button variant="outline" onClick={resetTransfer} className="w-full" data-testid="button-new-transfer">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Transfer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Privacy Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Hash className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Hidden Amount</p>
                    <p className="text-xs text-muted-foreground">
                      Transfer value is concealed using Pedersen commitments
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Lock className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Anonymous Parties</p>
                    <p className="text-xs text-muted-foreground">
                      Sender and receiver addresses are not linkable
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Verifiable Balance</p>
                    <p className="text-xs text-muted-foreground">
                      Range proofs ensure sufficient balance without revealing it
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="text-sm text-muted-foreground space-y-3">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-foreground">1.</span>
                  <span>Amount is encrypted using homomorphic commitment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-foreground">2.</span>
                  <span>Range proof verifies amount is positive and within balance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-foreground">3.</span>
                  <span>Transfer proof links sender and receiver commitments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-foreground">4.</span>
                  <span>On-chain verification updates balances without revealing values</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Demo Mode</p>
                <p>
                  This is a simulation. In production, proofs would be generated
                  cryptographically and verified on-chain.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
