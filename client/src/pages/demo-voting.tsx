import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowLeft,
  Vote,
  CheckCircle2,
  Clock,
  Users,
  BarChart3,
  Lock,
  Shield,
  Zap,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";

interface VoteOption {
  id: string;
  label: string;
  votes: number;
  color: string;
}

const initialOptions: VoteOption[] = [
  { id: "option-a", label: "Proposal A: Increase Development Fund", votes: 423, color: "bg-blue-500" },
  { id: "option-b", label: "Proposal B: Expand Validator Set", votes: 312, color: "bg-purple-500" },
  { id: "option-c", label: "Proposal C: Reduce Transaction Fees", votes: 265, color: "bg-green-500" },
];

export default function DemoVoting() {
  const [voterId, setVoterId] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [options, setOptions] = useState(initialOptions);
  const [proofHash, setProofHash] = useState("");

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

  const handleRegister = async () => {
    if (!voterId.trim()) return;
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsRegistered(true);
    setIsProcessing(false);
  };

  const handleVote = async () => {
    if (!selectedOption) return;
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));

    const hash = "0x" + Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    setProofHash(hash);

    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === selectedOption ? { ...opt, votes: opt.votes + 1 } : opt
      )
    );

    setHasVoted(true);
    setIsProcessing(false);
  };

  const resetDemo = () => {
    setVoterId("");
    setIsRegistered(false);
    setSelectedOption("");
    setHasVoted(false);
    setShowResults(false);
    setProofHash("");
    setOptions(initialOptions);
  };

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
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Vote className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-demo-title">Private Voting Demo</h1>
            <p className="text-muted-foreground">Cast votes without revealing your choice</p>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{totalVotes.toLocaleString()} total votes</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Voting ends in 2 days</span>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Shield className="h-3 w-3" />
            ZK Protected
          </Badge>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResults(!showResults)}
            data-testid="button-toggle-results"
          >
            {showResults ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showResults ? "Hide Results" : "Show Results"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voting Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cast Your Vote</CardTitle>
            <CardDescription>
              Your vote is encrypted and verified using zero-knowledge proofs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Register */}
            {!isRegistered ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                    1
                  </div>
                  Voter Registration
                </div>
                <div className="space-y-2">
                  <Label htmlFor="voter-id">Voter ID</Label>
                  <Input
                    id="voter-id"
                    placeholder="Enter your voter ID"
                    value={voterId}
                    onChange={(e) => setVoterId(e.target.value)}
                    disabled={isProcessing}
                    data-testid="input-voter-id"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your ID will be hashed to create an anonymous credential
                  </p>
                </div>
                <Button
                  onClick={handleRegister}
                  disabled={!voterId.trim() || isProcessing}
                  className="w-full"
                  data-testid="button-register"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating Commitment...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Register to Vote
                    </>
                  )}
                </Button>
              </div>
            ) : !hasVoted ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  Registered Successfully
                </div>

                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                    2
                  </div>
                  Select Your Choice
                </div>

                <RadioGroup
                  value={selectedOption}
                  onValueChange={setSelectedOption}
                  className="space-y-3"
                >
                  {options.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedOption === option.id
                          ? "border-primary bg-primary/5"
                          : "hover-elevate"
                      }`}
                      onClick={() => setSelectedOption(option.id)}
                      data-testid={`option-${option.id}`}
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <Button
                  onClick={handleVote}
                  disabled={!selectedOption || isProcessing}
                  className="w-full"
                  data-testid="button-cast-vote"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating ZK Proof...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Cast Encrypted Vote
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-1">Vote Submitted!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your vote has been encrypted and verified
                  </p>
                  <div className="p-3 rounded bg-muted/50 text-left">
                    <p className="text-xs text-muted-foreground mb-1">Proof Hash</p>
                    <p className="font-mono text-xs break-all" data-testid="text-proof-hash">{proofHash}</p>
                  </div>
                </div>
                <Button variant="outline" onClick={resetDemo} className="w-full" data-testid="button-reset-demo">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Live Results
            </CardTitle>
            <CardDescription>
              Aggregated results updated in real-time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {showResults ? (
              <div className="space-y-4">
                {options.map((option) => {
                  const percentage = (option.votes / totalVotes) * 100;
                  return (
                    <div key={option.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-muted-foreground">
                          {option.votes.toLocaleString()} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${option.color} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Total Votes</span>
                    <span className="font-bold">{totalVotes.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <EyeOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium mb-1">Results Hidden</p>
                <p className="text-sm">Click "Show Results" to view current standings</p>
              </div>
            )}

            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Privacy Guarantees
              </h4>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5" />
                  Your vote choice is never revealed
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5" />
                  Double voting is cryptographically prevented
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5" />
                  Results are verifiable without compromising privacy
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
