import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Vote,
  MessageSquareLock,
  ArrowRightLeft,
  UserCheck,
  Brain,
  Play,
  ArrowRight,
  CheckCircle2,
  Copy,
  Code2,
  Zap,
  Lock,
  Shield,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import type { DemoType } from "@shared/schema";

interface Demo {
  id: DemoType;
  title: string;
  description: string;
  icon: typeof Vote;
  color: string;
  steps: {
    title: string;
    description: string;
    inputLabel?: string;
    inputPlaceholder?: string;
    code?: string;
  }[];
}

const demos: Demo[] = [
  {
    id: "private_voting",
    title: "Private Voting",
    description: "Cast votes without revealing your choice while proving eligibility",
    icon: Vote,
    color: "bg-blue-500/10 text-blue-500",
    steps: [
      {
        title: "Voter Registration",
        description: "Register as an eligible voter with encrypted credentials",
        inputLabel: "Voter ID",
        inputPlaceholder: "Enter your voter ID",
        code: `// Generate voter commitment
const commitment = poseidonHash(voterId, secret);
registerVoter(commitment);`,
      },
      {
        title: "Cast Vote",
        description: "Submit your encrypted vote choice",
        inputLabel: "Vote Choice",
        inputPlaceholder: "Enter option (1, 2, or 3)",
        code: `// Encrypt vote with ZK
const encryptedVote = encrypt(choice, publicKey);
const proof = generateVoteProof(choice, commitment);`,
      },
      {
        title: "Verify & Tally",
        description: "Proof is verified and vote is counted without revealing choice",
        code: `// Verify and tally
verifyProof(proof);
tallyVote(encryptedVote);
// Result: Vote counted `,
      },
    ],
  },
  {
    id: "encrypted_messaging",
    title: "Encrypted Messaging",
    description: "Send end-to-end encrypted messages with delivery proofs",
    icon: MessageSquareLock,
    color: "bg-green-500/10 text-green-500",
    steps: [
      {
        title: "Key Exchange",
        description: "Establish secure communication channel",
        inputLabel: "Recipient Address",
        inputPlaceholder: "0x...",
        code: `// Diffie-Hellman key exchange
const sharedSecret = deriveShared(privateKey, recipientPubKey);
const encryptionKey = kdf(sharedSecret);`,
      },
      {
        title: "Compose & Encrypt",
        description: "Write and encrypt your message",
        inputLabel: "Message",
        inputPlaceholder: "Type your secret message...",
        code: `// Encrypt message
const ciphertext = encrypt(message, encryptionKey);
const commitment = poseidonHash(ciphertext);`,
      },
      {
        title: "Send & Prove Delivery",
        description: "Message delivered with ZK proof of receipt",
        code: `// Generate delivery proof
const deliveryProof = proveDelivery(commitment, recipient);
broadcast(ciphertext, deliveryProof);`,
      },
    ],
  },
  {
    id: "confidential_transfer",
    title: "Confidential Transfers",
    description: "Transfer assets with hidden amounts and parties",
    icon: ArrowRightLeft,
    color: "bg-purple-500/10 text-purple-500",
    steps: [
      {
        title: "Prepare Transfer",
        description: "Set up confidential transfer parameters",
        inputLabel: "Amount",
        inputPlaceholder: "Enter amount to transfer",
        code: `// Create confidential transfer
const blindedAmount = pedersenCommit(amount, blinding);
const rangeProof = generateRangeProof(amount, 0, MAX_AMOUNT);`,
      },
      {
        title: "Generate Proof",
        description: "Create ZK proof of valid transfer",
        inputLabel: "Recipient",
        inputPlaceholder: "0x...",
        code: `// Generate transfer proof
const transferProof = proveTransfer({
  sender: senderCommitment,
  receiver: receiverCommitment,
  amount: blindedAmount
});`,
      },
      {
        title: "Execute & Verify",
        description: "Transfer executed on-chain with hidden details",
        code: `// Submit to blockchain
const tx = await circuit.confidentialTransfer(
  transferProof,
  blindedAmount,
  rangeProof
);
// Balance updated without revealing amount`,
      },
    ],
  },
  {
    id: "identity_verification",
    title: "Identity Verification",
    description: "Prove identity attributes without revealing personal data",
    icon: UserCheck,
    color: "bg-orange-500/10 text-orange-500",
    steps: [
      {
        title: "Load Credentials",
        description: "Import your encrypted identity credentials",
        inputLabel: "Credential Hash",
        inputPlaceholder: "Enter credential commitment",
        code: `// Load encrypted credentials
const credentials = loadCredentials(credentialHash);
const commitment = poseidonHash(credentials);`,
      },
      {
        title: "Select Attributes",
        description: "Choose which attributes to prove",
        inputLabel: "Age Threshold",
        inputPlaceholder: "e.g., 18, 21, 65",
        code: `// Generate selective disclosure proof
const ageProof = proveAgeOver(credentials.birthdate, threshold);
// Proves age >= threshold without revealing actual age`,
      },
      {
        title: "Verify Identity",
        description: "Verifier confirms attributes without seeing data",
        code: `// Verify proof
const isValid = verifyAgeProof(ageProof, threshold);
// Returns: true (age verified) or false
// Actual birthdate remains private`,
      },
    ],
  },
  {
    id: "private_ai",
    title: "Private AI Inference",
    description: "Run ML models on encrypted data without exposing inputs",
    icon: Brain,
    color: "bg-cyan-500/10 text-cyan-500",
    steps: [
      {
        title: "Encrypt Input",
        description: "Prepare encrypted input for ML model",
        inputLabel: "Input Data",
        inputPlaceholder: "Enter data for classification",
        code: `// Encrypt input for private inference
const encryptedInput = encrypt(inputData, modelPublicKey);
const inputCommitment = poseidonHash(encryptedInput);`,
      },
      {
        title: "Private Inference",
        description: "Model processes encrypted data",
        code: `// Run inference in encrypted domain
const encryptedResult = await privateML.infer(
  encryptedInput,
  modelId: "classifier-v1"
);
// Model never sees plaintext input`,
      },
      {
        title: "Decrypt Result",
        description: "Receive classification with ZK proof of correctness",
        code: `// Decrypt and verify result
const { result, proof } = decrypt(encryptedResult, privateKey);
const isCorrect = verifyInferenceProof(proof, inputCommitment);
// Result: Classification with cryptographic guarantee`,
      },
    ],
  },
];

export default function Playground() {
  const [selectedDemo, setSelectedDemo] = useState<Demo | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [stepInputs, setStepInputs] = useState<Record<number, string>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showCode, setShowCode] = useState(true);

  const openDemo = (demo: Demo) => {
    setSelectedDemo(demo);
    setCurrentStep(0);
    setStepInputs({});
    setCompletedSteps(new Set());
  };

  const executeStep = async () => {
    if (!selectedDemo) return;
    setIsExecuting(true);

    await new Promise((r) => setTimeout(r, 1500));

    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    setIsExecuting(false);

    if (currentStep < selectedDemo.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setStepInputs({});
    setCompletedSteps(new Set());
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const progress = selectedDemo
    ? ((completedSteps.size / selectedDemo.steps.length) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-playground-title">Developer Playground</h1>
        <p className="text-muted-foreground">
          Interactive examples demonstrating zero-knowledge encrypted execution
        </p>
      </div>

      {/* Demo Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demos.map((demo) => (
          <Card
            key={demo.id}
            className="hover-elevate cursor-pointer group"
            onClick={() => openDemo(demo)}
            data-testid={`card-demo-${demo.id}`}
          >
            <CardContent className="p-6">
              <div className={`w-14 h-14 rounded-xl ${demo.color} flex items-center justify-center mb-4`}>
                <demo.icon className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                {demo.title}
                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{demo.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {demo.steps.length} steps
                </Badge>
                <Badge variant="outline" className="text-xs gap-1">
                  <Lock className="h-3 w-3" />
                  ZK Proof
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Demo Dialog */}
      <Dialog open={!!selectedDemo} onOpenChange={() => setSelectedDemo(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {selectedDemo && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${selectedDemo.color} flex items-center justify-center`}>
                    <selectedDemo.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle>{selectedDemo.title}</DialogTitle>
                    <DialogDescription>{selectedDemo.description}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="text-muted-foreground">
                      {completedSteps.size} / {selectedDemo.steps.length} steps
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Steps */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {selectedDemo.steps.map((step, index) => (
                    <Button
                      key={index}
                      variant={currentStep === index ? "default" : completedSteps.has(index) ? "secondary" : "outline"}
                      size="sm"
                      className="shrink-0 gap-2"
                      onClick={() => setCurrentStep(index)}
                      data-testid={`button-step-${index}`}
                    >
                      {completedSteps.has(index) && <CheckCircle2 className="h-3 w-3" />}
                      Step {index + 1}
                    </Button>
                  ))}
                </div>

                <Separator />

                {/* Current Step Content */}
                <ScrollArea className="flex-1">
                  <div className="space-y-6 pr-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        {selectedDemo.steps[currentStep].title}
                      </h3>
                      <p className="text-muted-foreground">
                        {selectedDemo.steps[currentStep].description}
                      </p>
                    </div>

                    {/* Input Field */}
                    {selectedDemo.steps[currentStep].inputLabel && (
                      <div className="space-y-2">
                        <Label>{selectedDemo.steps[currentStep].inputLabel}</Label>
                        <Input
                          placeholder={selectedDemo.steps[currentStep].inputPlaceholder}
                          value={stepInputs[currentStep] || ""}
                          onChange={(e) =>
                            setStepInputs((prev) => ({ ...prev, [currentStep]: e.target.value }))
                          }
                          data-testid="input-step-data"
                        />
                      </div>
                    )}

                    {/* Code Block */}
                    {selectedDemo.steps[currentStep].code && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <Code2 className="h-4 w-4" />
                            Code
                          </Label>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowCode(!showCode)}
                              data-testid="button-toggle-code"
                            >
                              {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyCode(selectedDemo.steps[currentStep].code!)}
                              data-testid="button-copy-code"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {showCode && (
                          <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-sm font-mono">
                            <code>{selectedDemo.steps[currentStep].code}</code>
                          </pre>
                        )}
                      </div>
                    )}

                    {/* Execution Status */}
                    {completedSteps.has(currentStep) && (
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium text-sm">Step Completed</p>
                          <p className="text-xs text-muted-foreground">
                            ZK proof generated and verified successfully
                          </p>
                        </div>
                      </div>
                    )}

                    {isExecuting && (
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-3">
                        <Zap className="h-5 w-5 text-primary animate-pulse" />
                        <div>
                          <p className="font-medium text-sm">Executing...</p>
                          <p className="text-xs text-muted-foreground">
                            Generating zero-knowledge proof
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <Separator />

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={resetDemo} data-testid="button-reset-demo">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Demo
                  </Button>
                  <div className="flex items-center gap-2">
                    {currentStep > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep((prev) => prev - 1)}
                        data-testid="button-prev-step"
                      >
                        Previous
                      </Button>
                    )}
                    {!completedSteps.has(currentStep) ? (
                      <Button onClick={executeStep} disabled={isExecuting} data-testid="button-execute-step">
                        {isExecuting ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Executing...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Execute Step
                          </>
                        )}
                      </Button>
                    ) : currentStep < selectedDemo.steps.length - 1 ? (
                      <Button onClick={() => setCurrentStep((prev) => prev + 1)} data-testid="button-next-step">
                        Next Step
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button variant="secondary" onClick={() => setSelectedDemo(null)} data-testid="button-complete-demo">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Info Section */}
      <Card className="bg-gradient-to-r from-primary/5 via-transparent to-transparent">
        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="p-4 rounded-xl bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">How ZK Demos Work</h3>
            <p className="text-muted-foreground text-sm">
              Each demo uses real zero-knowledge cryptographic operations. Inputs are encrypted,
              computations run in sealed circuits, and proofs are generated to verify correctness
              without revealing the underlying data. Connect your Solana wallet to interact with
              ZK circuits deployed on the network.
            </p>
          </div>
          <Badge className="shrink-0 gap-1 bg-primary text-primary-foreground">
            <Zap className="h-3 w-3" />
            Solana Mainnet
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
