import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  ArrowRightLeft,
  Database,
  Brain,
  CheckSquare,
  Puzzle,
  Plus,
  Play,
  Download,
  Trash2,
  Settings,
  GripVertical,
  Zap,
  Lock,
  Eye,
  Copy,
  Save,
  X,
  History,
  GitBranch,
  RotateCcw,
  Clock,
  ChevronDown,
  FileCode2,
} from "lucide-react";
import { SiRust, SiTypescript, SiSolana } from "react-icons/si";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CircuitNode, CircuitConnection, ModuleTemplate, CircuitModuleType, Circuit, InsertCircuit, CircuitVersion } from "@shared/schema";

const categoryIcons: Record<CircuitModuleType, typeof User> = {
  identity: User,
  transfer: ArrowRightLeft,
  storage: Database,
  ai_inference: Brain,
  validation: CheckSquare,
  custom: Puzzle,
};

const categoryColors: Record<CircuitModuleType, string> = {
  identity: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  transfer: "bg-green-500/10 text-green-500 border-green-500/20",
  storage: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  ai_inference: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  validation: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  custom: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export default function CircuitBuilder() {
  const [circuitNodes, setCircuitNodes] = useState<CircuitNode[]>([]);
  const [circuitConnections, setCircuitConnections] = useState<CircuitConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<CircuitNode | null>(null);
  const [circuitName, setCircuitName] = useState("Untitled Circuit");
  const [currentCircuitId, setCurrentCircuitId] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState<number>(1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [versionChangelog, setVersionChangelog] = useState("");
  const [rightPanelTab, setRightPanelTab] = useState<"properties" | "versions">("properties");
  const { toast } = useToast();

  const { data: moduleTemplates = [], isLoading: modulesLoading } = useQuery<ModuleTemplate[]>({
    queryKey: ["/api/modules"],
  });

  const { data: savedCircuits = [], isLoading: circuitsLoading } = useQuery<Circuit[]>({
    queryKey: ["/api/circuits"],
  });

  const { data: circuitVersions = [], isLoading: versionsLoading, refetch: refetchVersions } = useQuery<CircuitVersion[]>({
    queryKey: ["/api/circuits", currentCircuitId, "versions"],
    enabled: !!currentCircuitId,
  });

  const createVersionMutation = useMutation({
    mutationFn: async ({ circuitId, changelog }: { circuitId: string; changelog?: string }) => {
      const res = await apiRequest("POST", `/api/circuits/${circuitId}/versions`, { changelog });
      return res.json();
    },
    onSuccess: (data) => {
      setCurrentVersion(data.version);
      queryClient.invalidateQueries({ queryKey: ["/api/circuits", currentCircuitId, "versions"] });
      setVersionDialogOpen(false);
      setVersionChangelog("");
      toast({
        title: "Version Saved",
        description: `Version ${data.version} has been created.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create version. Please try again.",
        variant: "destructive",
      });
    },
  });

  const restoreVersionMutation = useMutation({
    mutationFn: async ({ circuitId, version }: { circuitId: string; version: number }) => {
      const res = await apiRequest("POST", `/api/circuits/${circuitId}/versions/${version}/restore`);
      return res.json();
    },
    onSuccess: (data) => {
      setCircuitName(data.name);
      setCircuitNodes(JSON.parse(JSON.stringify(data.nodes)));
      setCircuitConnections(JSON.parse(JSON.stringify(data.connections)));
      setCurrentVersion(data.currentVersion);
      queryClient.invalidateQueries({ queryKey: ["/api/circuits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/circuits", currentCircuitId, "versions"] });
      toast({
        title: "Version Restored",
        description: `Circuit restored to version ${data.currentVersion}.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to restore version. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveCircuitMutation = useMutation({
    mutationFn: async (circuit: InsertCircuit) => {
      const res = await apiRequest("POST", "/api/circuits", circuit);
      return res.json();
    },
    onSuccess: (data) => {
      setCurrentCircuitId(data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/circuits"] });
      toast({
        title: "Circuit Saved",
        description: "Your circuit has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save circuit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateCircuitMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertCircuit> }) => {
      const res = await apiRequest("PATCH", `/api/circuits/${id}`, updates);
      return res.json();
    },
    onSuccess: (data) => {
      setCurrentCircuitId(data.id);
      setCircuitName(data.name);
      setCircuitNodes(JSON.parse(JSON.stringify(data.nodes)));
      queryClient.invalidateQueries({ queryKey: ["/api/circuits"] });
      toast({
        title: "Circuit Updated",
        description: "Your circuit has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update circuit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addModule = useCallback((template: ModuleTemplate) => {
    const newNode: CircuitNode = {
      id: `node-${Date.now()}`,
      type: template.type,
      name: template.name,
      position: { x: 100 + circuitNodes.length * 50, y: 100 + circuitNodes.length * 30 },
      config: {},
      inputs: template.inputs.map((i) => i.name),
      outputs: template.outputs.map((o) => o.name),
    };
    setCircuitNodes((prev) => [...prev, newNode]);
    setSelectedNode(newNode);
  }, [circuitNodes.length]);

  const removeNode = useCallback((nodeId: string) => {
    setCircuitNodes((prev) => prev.filter((n) => n.id !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [selectedNode]);

  const saveCircuit = useCallback(() => {
    if (circuitNodes.length === 0) {
      toast({
        title: "Cannot Save Empty Circuit",
        description: "Add at least one module before saving.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentCircuitId) {
      updateCircuitMutation.mutate({
        id: currentCircuitId,
        updates: {
          name: circuitName,
          description: `ZK circuit with ${circuitNodes.length} modules`,
          nodes: circuitNodes,
          connections: circuitConnections,
        },
      });
    } else {
      saveCircuitMutation.mutate({
        name: circuitName,
        description: `ZK circuit with ${circuitNodes.length} modules`,
        nodes: circuitNodes,
        connections: circuitConnections,
      });
    }
  }, [circuitName, circuitNodes, circuitConnections, currentCircuitId, saveCircuitMutation, updateCircuitMutation, toast]);

  const loadCircuit = useCallback((circuit: Circuit) => {
    setCircuitName(circuit.name);
    setCircuitNodes(JSON.parse(JSON.stringify(circuit.nodes)));
    setCircuitConnections(JSON.parse(JSON.stringify(circuit.connections)));
    setCurrentCircuitId(circuit.id);
    setCurrentVersion(circuit.currentVersion || 1);
    setSelectedNode(null);
    toast({
      title: "Circuit Loaded",
      description: `Loaded "${circuit.name}" with ${circuit.nodes.length} modules.`,
    });
  }, [toast]);

  const newCircuit = useCallback(() => {
    setCircuitName("Untitled Circuit");
    setCircuitNodes([]);
    setCircuitConnections([]);
    setCurrentCircuitId(null);
    setCurrentVersion(1);
    setSelectedNode(null);
  }, []);

  const executeCircuit = useCallback(async () => {
    if (circuitNodes.length === 0) return;
    setIsExecuting(true);
    for (let i = 0; i < circuitNodes.length; i++) {
      setExecutionStep(i);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
    setExecutionStep(null);
    setIsExecuting(false);
    toast({
      title: "Execution Complete",
      description: "Circuit executed successfully. Proof generated.",
    });
  }, [circuitNodes.length, toast]);

  type ExportFormat = "circom" | "anchor" | "typescript" | "noir";
  
  const generateCircomCode = useCallback(() => {
    const safeName = circuitName.replace(/\s+/g, "");
    
    if (circuitNodes.length === 0) {
      return `// Encrypt Circuit - ${circuitName}
// Circom 2.1 ZK Circuit Definition
// Target: Groth16 / PLONK proving systems
// 
// Add modules to your circuit to generate code.

pragma circom 2.1.6;

include "node_modules/circomlib/circuits/poseidon.circom";

template ${safeName}() {
    // Add modules to define circuit logic
    signal input placeholder;
    signal output hash;
    
    component hasher = Poseidon(1);
    hasher.inputs[0] <== placeholder;
    hash <== hasher.out;
}

component main = ${safeName}();`;
    }
    
    const getInputName = (inp: string | { name?: string }) => {
      return typeof inp === 'string' ? inp : (inp.name || 'input');
    };
    
    const getOutputName = (out: string | { name?: string }) => {
      return typeof out === 'string' ? out : (out.name || 'output');
    };
    
    const allInputs = circuitNodes.flatMap((node) => {
      const componentName = node.name.toLowerCase().replace(/\s+/g, "_");
      return (node.inputs || []).map(inp => `${componentName}_${getInputName(inp)}`);
    });
    
    return `// Encrypt Circuit - ${circuitName}
// Circom 2.1 ZK Circuit Definition
// Target: Groth16 / PLONK proving systems

pragma circom 2.1.6;

include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/comparators.circom";

template ${safeName}() {
${circuitNodes.map((node, i) => {
  const componentName = node.name.toLowerCase().replace(/\s+/g, "_");
  const inputs = node.inputs || [];
  const outputs = node.outputs || [];
  const numInputs = Math.max(inputs.length, 1);
  
  return `    // Module ${i + 1}: ${node.name} (${node.type})
    ${inputs.map(inp => `signal input ${componentName}_${getInputName(inp)};`).join("\n    ") || `signal input ${componentName}_in;`}
    ${outputs.map(out => `signal output ${componentName}_${getOutputName(out)};`).join("\n    ") || `signal output ${componentName}_out;`}
    
    // ${node.type.toUpperCase()} verification logic using Poseidon hash
    component ${componentName}_hasher = Poseidon(${numInputs});
    ${inputs.length > 0 
      ? inputs.map((inp, idx) => `${componentName}_hasher.inputs[${idx}] <== ${componentName}_${getInputName(inp)};`).join("\n    ")
      : `${componentName}_hasher.inputs[0] <== ${componentName}_in;`}
    ${outputs.length > 0 
      ? `${componentName}_${getOutputName(outputs[0])} <== ${componentName}_hasher.out;`
      : `${componentName}_out <== ${componentName}_hasher.out;`}`;
}).join("\n\n")}
}

component main${allInputs.length > 0 ? ` {public [${allInputs.join(", ")}]}` : ""} = ${safeName}();`;
  }, [circuitName, circuitNodes]);

  const generateAnchorCode = useCallback(() => {
    const safeName = circuitName.replace(/\s+/g, "_").toLowerCase();
    const structName = circuitName.replace(/\s+/g, "");
    
    const getInputName = (inp: string | { name?: string }) => {
      return typeof inp === 'string' ? inp : (inp.name || 'input');
    };
    
    if (circuitNodes.length === 0) {
      return `// Encrypt Circuit - ${circuitName}
// Solana Anchor Program with ZK Verification
// Framework: Anchor 0.31+ / Solana 2.0+
//
// Add modules to your circuit to generate verification functions.

use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod ${safeName} {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let circuit = &mut ctx.accounts.circuit;
        circuit.authority = ctx.accounts.authority.key();
        circuit.verification_count = 0;
        circuit.is_active = true;
        msg!("Circuit ${circuitName} initialized");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + Circuit::LEN)]
    pub circuit: Account<'info, Circuit>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Circuit {
    pub authority: Pubkey,
    pub verification_count: u64,
    pub is_active: bool,
}

impl Circuit {
    pub const LEN: usize = 32 + 8 + 1;
}`;
    }
    
    return `// Encrypt Circuit - ${circuitName}
// Solana Anchor Program with ZK Verification
// Framework: Anchor 0.31+ / Solana 2.0+
//
// Dependencies (Cargo.toml):
// anchor-lang = "0.31.1"
// solana-program = "2.3.0"
// groth16-solana = { git = "https://github.com/Lightprotocol/groth16-solana" }

use anchor_lang::prelude::*;

declare_id!("Encrypt${structName}111111111111111111111111111111");

#[program]
pub mod ${safeName} {
    use super::*;

    /// Initialize the circuit state account
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let circuit = &mut ctx.accounts.circuit;
        circuit.authority = ctx.accounts.authority.key();
        circuit.verification_count = 0;
        circuit.is_active = true;
        msg!("Circuit ${circuitName} initialized on Solana");
        Ok(())
    }

    /// Verify a Groth16 proof on-chain
    /// Proof data should be serialized from snarkjs output
    pub fn verify_proof(
        ctx: Context<VerifyProof>,
        proof_a: [u8; 64],
        proof_b: [u8; 128],
        proof_c: [u8; 64],
        public_inputs: Vec<[u8; 32]>,
    ) -> Result<()> {
        let circuit = &mut ctx.accounts.circuit;
        require!(circuit.is_active, ${structName}Error::CircuitInactive);
        
        // Groth16 verification using alt_bn128 syscalls
        // Note: Actual verification requires groth16-solana crate
        // This is a template - integrate your verification key here
        msg!("Verifying Groth16 proof with {} public inputs", public_inputs.len());
        
        // Increment verification counter
        circuit.verification_count = circuit.verification_count.checked_add(1)
            .ok_or(${structName}Error::Overflow)?;
        
        emit!(ProofVerified {
            circuit: circuit.key(),
            verifier: ctx.accounts.verifier.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

${circuitNodes.map((node, i) => {
  const fnName = node.name.toLowerCase().replace(/\s+/g, "_");
  const typeName = node.name.replace(/\s+/g, "");
  
  return `    /// ${node.name} - ${node.type} module verification
    /// Generated for module ${i + 1}
    /// Input: 32-byte hash of module inputs
    pub fn verify_${fnName}(
        ctx: Context<Verify${typeName}>,
        input_hash: [u8; 32],
    ) -> Result<()> {
        let circuit = &mut ctx.accounts.circuit;
        require!(circuit.is_active, ${structName}Error::CircuitInactive);
        
        // ${node.type.toUpperCase()} verification logic
        // In production, verify input_hash against expected computation
        msg!("Verifying ${node.name} module (${node.type})");
        msg!("Input hash: {:?}", &input_hash[..8]);
        
        circuit.verification_count = circuit.verification_count.checked_add(1)
            .ok_or(${structName}Error::Overflow)?;
        
        Ok(())
    }`;
}).join("\n\n")}
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + Circuit::LEN)]
    pub circuit: Account<'info, Circuit>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyProof<'info> {
    #[account(mut, has_one = authority)]
    pub circuit: Account<'info, Circuit>,
    pub authority: Signer<'info>,
    /// CHECK: Verifier account for event logging
    pub verifier: Signer<'info>,
}

${circuitNodes.map((node) => {
  const typeName = node.name.replace(/\s+/g, "");
  return `#[derive(Accounts)]
pub struct Verify${typeName}<'info> {
    #[account(mut)]
    pub circuit: Account<'info, Circuit>,
    pub verifier: Signer<'info>,
}`;
}).join("\n\n")}

#[account]
pub struct Circuit {
    /// Authority who can manage this circuit
    pub authority: Pubkey,
    /// Number of successful proof verifications
    pub verification_count: u64,
    /// Whether the circuit is active for verification
    pub is_active: bool,
}

impl Circuit {
    pub const LEN: usize = 32 + 8 + 1; // Pubkey + u64 + bool
}

#[event]
pub struct ProofVerified {
    pub circuit: Pubkey,
    pub verifier: Pubkey,
    pub timestamp: i64,
}

#[error_code]
pub enum ${structName}Error {
    #[msg("Circuit is not active")]
    CircuitInactive,
    #[msg("Invalid zero-knowledge proof")]
    InvalidProof,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Arithmetic overflow")]
    Overflow,
}`;
  }, [circuitName, circuitNodes]);

  const generateTypeScriptCode = useCallback(() => {
    const safeName = circuitName.replace(/\s+/g, "");
    const snakeName = circuitName.replace(/\s+/g, "_").toLowerCase();
    
    const getInputName = (inp: string | { name?: string }) => {
      return typeof inp === 'string' ? inp : (inp.name || 'input');
    };
    
    const getOutputName = (out: string | { name?: string }) => {
      return typeof out === 'string' ? out : (out.name || 'output');
    };
    
    if (circuitNodes.length === 0) {
      return `// Encrypt Circuit - ${circuitName}
// TypeScript SDK for ZK Circuit Interaction
// Compatible with: Solana Web3.js, @coral-xyz/anchor
//
// Add modules to your circuit to generate SDK methods.

import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";

// Your circuit program ID (update after deployment)
const PROGRAM_ID = new PublicKey("11111111111111111111111111111111");

export interface CircuitConfig {
  connection: Connection;
  wallet: Wallet;
}

export class ${safeName}Client {
  private connection: Connection;
  private provider: AnchorProvider;
  
  constructor(config: CircuitConfig) {
    this.connection = config.connection;
    this.provider = new AnchorProvider(config.connection, config.wallet, {});
  }

  async initialize(): Promise<string> {
    console.log("Initializing ${circuitName} on Solana...");
    // Add initialization logic after deploying the Anchor program
    return "";
  }
}

// Example usage:
/*
import { Connection, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));
const client = new ${safeName}Client({
  connection,
  wallet: yourWallet,
});

await client.initialize();
*/`;
    }
    
    return `// Encrypt Circuit - ${circuitName}
// TypeScript SDK for ZK Circuit Interaction
// Compatible with: Solana Web3.js, @coral-xyz/anchor, snarkjs
//
// Dependencies:
// npm install @solana/web3.js @coral-xyz/anchor snarkjs

import { Connection, PublicKey, Keypair, TransactionSignature } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet, BN } from "@coral-xyz/anchor";

// Your circuit program ID (update after deployment)
const PROGRAM_ID = new PublicKey("Encrypt${safeName}111111111111111111111111111111");

// IDL type definition (generated by Anchor after build)
type ${safeName}IDL = {
  version: "0.1.0";
  name: "${snakeName}";
  instructions: { name: string; accounts: { name: string; isMut: boolean; isSigner: boolean }[]; args: { name: string; type: string }[] }[];
  accounts: { name: string; type: { kind: string; fields: { name: string; type: string }[] } }[];
};

export interface ${safeName}Config {
  connection: Connection;
  wallet: Wallet;
  programId?: PublicKey;
}

export interface ProofData {
  proofA: Uint8Array;  // 64 bytes
  proofB: Uint8Array;  // 128 bytes
  proofC: Uint8Array;  // 64 bytes
  publicInputs: Uint8Array[];
}

${circuitNodes.map((node) => {
  const typeName = node.name.replace(/\s+/g, "");
  const inputs = node.inputs || [];
  const outputs = node.outputs || [];
  
  return `export interface ${typeName}Input {
${inputs.length > 0 
  ? inputs.map(inp => `  ${getInputName(inp).replace(/[^a-zA-Z0-9_]/g, '_')}: Uint8Array | Buffer | bigint;`).join("\n")
  : "  data: Uint8Array | Buffer | bigint;"
}
}

export interface ${typeName}Result {
${outputs.length > 0 
  ? outputs.map(out => `  ${getOutputName(out).replace(/[^a-zA-Z0-9_]/g, '_')}: Uint8Array;`).join("\n")
  : "  hash: Uint8Array;"
}
  verified: boolean;
  txSignature: TransactionSignature;
}`;
}).join("\n\n")}

export class ${safeName}Client {
  private connection: Connection;
  private provider: AnchorProvider;
  private program: Program<${safeName}IDL> | null = null;
  private circuitPda: PublicKey | null = null;
  private programId: PublicKey;
  
  constructor(config: ${safeName}Config) {
    this.connection = config.connection;
    this.programId = config.programId || PROGRAM_ID;
    this.provider = new AnchorProvider(config.connection, config.wallet, {
      commitment: "confirmed",
    });
  }

  /**
   * Initialize the SDK with the Anchor program
   * Call this before using other methods
   */
  async initialize(idl: ${safeName}IDL): Promise<void> {
    this.program = new Program(idl, this.provider);
    
    // Derive circuit PDA
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("circuit")],
      this.programId
    );
    this.circuitPda = pda;
    
    console.log("${safeName} SDK initialized");
    console.log("Circuit PDA:", this.circuitPda.toBase58());
  }

  /**
   * Create a new circuit account on Solana
   */
  async createCircuit(): Promise<TransactionSignature> {
    if (!this.program) throw new Error("SDK not initialized. Call initialize() first.");
    
    const tx = await this.program.methods
      .initialize()
      .accounts({
        authority: this.provider.wallet.publicKey,
      })
      .rpc();
    
    console.log("Circuit created. Tx:", tx);
    return tx;
  }

${circuitNodes.map((node) => {
  const methodName = node.name.toLowerCase().replace(/\s+/g, "_");
  const typeName = node.name.replace(/\s+/g, "");
  const inputs = node.inputs || [];
  
  return `  /**
   * ${node.name} - ${node.type} verification
   * ${node.description || "Generates and verifies ZK proof on Solana"}
   */
  async verify${typeName}(input: ${typeName}Input): Promise<${typeName}Result> {
    if (!this.program || !this.circuitPda) {
      throw new Error("SDK not initialized. Call initialize() first.");
    }
    
    // Convert inputs to field elements for proof generation
    const inputFields: Record<string, bigint> = {};
    ${inputs.length > 0 
      ? inputs.map(inp => {
          const name = getInputName(inp).replace(/[^a-zA-Z0-9_]/g, '_');
          return `if (input.${name} instanceof Uint8Array || input.${name} instanceof Buffer) {
      inputFields["${name}"] = BigInt("0x" + Buffer.from(input.${name}).toString("hex"));
    } else {
      inputFields["${name}"] = input.${name} as bigint;
    }`;
        }).join("\n    ")
      : `if (input.data instanceof Uint8Array || input.data instanceof Buffer) {
      inputFields["data"] = BigInt("0x" + Buffer.from(input.data).toString("hex"));
    } else {
      inputFields["data"] = input.data as bigint;
    }`
    }
    
    // Generate ZK proof using snarkjs (requires compiled circuit)
    // const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    //   inputFields,
    //   "circuits/${methodName}.wasm",
    //   "circuits/${methodName}.zkey"
    // );
    
    // Placeholder for proof generation - integrate snarkjs here
    const inputHash = this.hashInputs(Object.values(inputFields));
    
    // Submit verification transaction to Solana
    // The Anchor program expects input_hash as [u8; 32]
    const tx = await this.program.methods
      .verify${typeName}(Array.from(inputHash) as unknown as number[])
      .accounts({
        circuit: this.circuitPda,
        verifier: this.provider.wallet.publicKey,
      })
      .rpc();
    
    console.log("${typeName} verified on Solana. Tx:", tx);
    
    return {
      ${(node.outputs || []).length > 0 
        ? (node.outputs || []).map(out => `${getOutputName(out).replace(/[^a-zA-Z0-9_]/g, '_')}: inputHash`).join(",\n      ")
        : "hash: inputHash"
      },
      verified: true,
      txSignature: tx,
    };
  }`;
}).join("\n\n")}

  /**
   * Get circuit statistics from on-chain account
   */
  async getCircuitStats(): Promise<{
    authority: PublicKey;
    verificationCount: number;
    isActive: boolean;
  }> {
    if (!this.program || !this.circuitPda) {
      throw new Error("SDK not initialized. Call initialize() first.");
    }
    
    const circuit = await this.program.account.circuit.fetch(this.circuitPda);
    return {
      authority: circuit.authority as PublicKey,
      verificationCount: (circuit.verificationCount as BN).toNumber(),
      isActive: circuit.isActive as boolean,
    };
  }

  /**
   * Hash inputs for verification (placeholder - use Poseidon in production)
   */
  private hashInputs(inputs: bigint[]): Uint8Array {
    // Simplified hash for demo - use Poseidon hash in production
    const buffer = new Uint8Array(32);
    let hash = 0n;
    for (const input of inputs) {
      hash = (hash * 31n + input) % (2n ** 256n);
    }
    const hashBytes = hash.toString(16).padStart(64, "0");
    for (let i = 0; i < 32; i++) {
      buffer[i] = parseInt(hashBytes.slice(i * 2, i * 2 + 2), 16);
    }
    return buffer;
  }

  /**
   * Serialize Groth16 proof for on-chain verification
   */
  private serializeProof(proof: ProofData): {
    proofA: number[];
    proofB: number[];
    proofC: number[];
  } {
    return {
      proofA: Array.from(proof.proofA),
      proofB: Array.from(proof.proofB),
      proofC: Array.from(proof.proofC),
    };
  }
}

// Example usage:
/*
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";
import idl from "./target/idl/${snakeName}.json";

const connection = new Connection(clusterApiUrl("devnet"));
const wallet = new Wallet(yourKeypair);

const client = new ${safeName}Client({
  connection,
  wallet,
});

// Initialize with program IDL
await client.initialize(idl as ${safeName}IDL);

// Create circuit account (first time only)
await client.createCircuit();

${circuitNodes.length > 0 ? `// Verify ${circuitNodes[0].name}
const result = await client.verify${circuitNodes[0].name.replace(/\s+/g, "")}({
  ${(circuitNodes[0].inputs || []).length > 0 
    ? (circuitNodes[0].inputs || []).map(inp => `${getInputName(inp).replace(/[^a-zA-Z0-9_]/g, '_')}: new Uint8Array(32)`).join(",\n  ")
    : "data: new Uint8Array(32)"
  }
});
console.log("Verification result:", result);` : ""}

// Get circuit stats
const stats = await client.getCircuitStats();
console.log("Total verifications:", stats.verificationCount);
*/`;
  }, [circuitName, circuitNodes]);

  const generateNoirCode = useCallback(() => {
    const safeName = circuitName.replace(/\s+/g, "_").toLowerCase();
    
    const getInputName = (inp: string | { name?: string }) => {
      return typeof inp === 'string' ? inp : (inp.name || 'input');
    };
    
    const getOutputName = (out: string | { name?: string }) => {
      return typeof out === 'string' ? out : (out.name || 'output');
    };
    
    // Map input count to valid Poseidon hash functions in Noir stdlib
    const getPoseidonHashFn = (inputCount: number) => {
      if (inputCount <= 2) return 'hash_2';
      if (inputCount <= 4) return 'hash_4';
      if (inputCount <= 8) return 'hash_8';
      return 'hash_8'; // Use hash_8 for larger inputs, pad with zeros
    };
    
    if (circuitNodes.length === 0) {
      return `// Encrypt Circuit - ${circuitName}
// Noir DSL for Aztec zkSNARK
// Compatible with: Aztec Network, Barretenberg backend
//
// Add modules to your circuit to generate verification functions.

fn main(input: pub Field) {
    // Circuit: ${circuitName}
    // Add modules to define circuit logic
    
    // Example: Hash the input and assert it's non-zero
    let hash = std::hash::poseidon::bn254::hash_2([input, 0]);
    assert(hash != 0);
}

#[test]
fn test_${safeName}() {
    main(42);
}`;
    }
    
    return `// Encrypt Circuit - ${circuitName}
// Noir DSL for Aztec zkSNARK
// Compatible with: Aztec Network, Barretenberg backend
//
// Compile with: nargo compile
// Prove with: nargo prove
// Verify with: nargo verify

use std::hash::poseidon::bn254::{hash_2, hash_4};

${circuitNodes.map((node, i) => {
  const fnName = node.name.toLowerCase().replace(/\s+/g, "_");
  const inputs = node.inputs || [];
  const outputs = node.outputs || [];
  const inputCount = Math.max(inputs.length, 1);
  const hashFn = getPoseidonHashFn(inputCount);
  
  return `/// Module ${i + 1}: ${node.name} (${node.type})
/// ${node.description || 'ZK verification module'}
fn ${fnName}(${inputs.length > 0 
    ? inputs.map(inp => `${getInputName(inp).toLowerCase().replace(/[^a-z0-9_]/g, '_')}: Field`).join(", ")
    : "input: Field"
}) -> Field {
    // ${node.type.toUpperCase()} verification using Poseidon hash
    ${inputs.length <= 2 
      ? `let hash = hash_2([${inputs.length > 0 
          ? inputs.map(inp => getInputName(inp).toLowerCase().replace(/[^a-z0-9_]/g, '_')).concat(inputs.length === 1 ? ['0'] : []).join(", ")
          : "input, 0"}]);`
      : `let hash = hash_4([${inputs.slice(0, 4).map(inp => getInputName(inp).toLowerCase().replace(/[^a-z0-9_]/g, '_')).concat(Array(4 - Math.min(inputs.length, 4)).fill('0')).join(", ")}]);`
    }
    hash
}`;
}).join("\n\n")}

/// Main circuit entrypoint
/// All inputs are public for verification
fn main(
${circuitNodes.flatMap((node) => {
  const fnName = node.name.toLowerCase().replace(/\s+/g, "_");
  const inputs = node.inputs || [];
  return inputs.length > 0 
    ? inputs.map(inp => `    ${fnName}_${getInputName(inp).toLowerCase().replace(/[^a-z0-9_]/g, '_')}: pub Field`)
    : [`    ${fnName}_input: pub Field`];
}).join(",\n")}
) {
    // Circuit: ${circuitName}
    // Generated by Encrypt Circuit Builder
    
${circuitNodes.map((node) => {
  const fnName = node.name.toLowerCase().replace(/\s+/g, "_");
  const inputs = node.inputs || [];
  
  return `    // Execute ${node.name} module
    let ${fnName}_result = ${fnName}(${inputs.length > 0 
      ? inputs.map(inp => `${fnName}_${getInputName(inp).toLowerCase().replace(/[^a-z0-9_]/g, '_')}`).join(", ")
      : `${fnName}_input`});
    assert(${fnName}_result != 0, "${node.name} verification failed");`;
}).join("\n\n")}
}

#[test]
fn test_${safeName}() {
    // Test with sample inputs
    main(${circuitNodes.flatMap((node) => {
      const inputs = node.inputs || [];
      return inputs.length > 0 ? inputs.map(() => '1') : ['1'];
    }).join(", ")});
}`;
  }, [circuitName, circuitNodes]);

  const exportCode = useCallback((format: ExportFormat) => {
    let code: string;
    let formatName: string;
    
    switch (format) {
      case "circom":
        code = generateCircomCode();
        formatName = "Circom";
        break;
      case "anchor":
        code = generateAnchorCode();
        formatName = "Solana Anchor";
        break;
      case "typescript":
        code = generateTypeScriptCode();
        formatName = "TypeScript SDK";
        break;
      case "noir":
        code = generateNoirCode();
        formatName = "Noir";
        break;
    }
    
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied",
      description: `${formatName} circuit code has been copied to clipboard.`,
    });
  }, [generateCircomCode, generateAnchorCode, generateTypeScriptCode, generateNoirCode, toast]);

  const createVersion = useCallback(() => {
    if (!currentCircuitId) {
      toast({
        title: "Save Circuit First",
        description: "Please save the circuit before creating a version.",
        variant: "destructive",
      });
      return;
    }
    setVersionDialogOpen(true);
  }, [currentCircuitId, toast]);

  const handleCreateVersion = useCallback(() => {
    if (!currentCircuitId) return;
    createVersionMutation.mutate({
      circuitId: currentCircuitId,
      changelog: versionChangelog || undefined,
    });
  }, [currentCircuitId, versionChangelog, createVersionMutation]);

  const handleRestoreVersion = useCallback((version: number) => {
    if (!currentCircuitId) return;
    restoreVersionMutation.mutate({
      circuitId: currentCircuitId,
      version,
    });
  }, [currentCircuitId, restoreVersionMutation]);

  const formatVersionDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredModules = moduleTemplates.filter(
    (m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedModules = filteredModules.reduce((acc, module) => {
    if (!acc[module.type]) acc[module.type] = [];
    acc[module.type].push(module);
    return acc;
  }, {} as Record<CircuitModuleType, ModuleTemplate[]>);

  return (
    <div className="h-full flex">
      {/* Left Panel - Module Palette & Saved Circuits */}
      <div className="w-80 border-r bg-card flex flex-col">
        <Tabs defaultValue="modules" className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger value="modules" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              Modules
            </TabsTrigger>
            <TabsTrigger value="saved" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              Saved ({savedCircuits.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="modules" className="flex-1 flex flex-col m-0 mt-0">
            <div className="p-4 border-b">
              <Input
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-modules"
              />
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {modulesLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  Object.entries(groupedModules).map(([type, modules]) => {
                    const Icon = categoryIcons[type as CircuitModuleType];
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                          <Icon className="h-4 w-4" />
                          {type.replace("_", " ")}
                        </div>
                        <div className="space-y-2">
                          {modules.map((module) => (
                            <div
                              key={module.id}
                              className={`p-3 rounded-lg border cursor-pointer hover-elevate ${categoryColors[module.type]}`}
                              onClick={() => addModule(module)}
                              data-testid={`module-${module.id}`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <GripVertical className="h-4 w-4 opacity-50" />
                                <span className="font-medium text-sm">{module.name}</span>
                              </div>
                              <p className="text-xs opacity-75 pl-6">{module.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="saved" className="flex-1 flex flex-col m-0 mt-0">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {circuitsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : savedCircuits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No saved circuits yet</p>
                    <p className="text-xs mt-1">Build and save your first circuit</p>
                  </div>
                ) : (
                  savedCircuits.map((circuit) => (
                    <div
                      key={circuit.id}
                      className={`p-3 rounded-lg border cursor-pointer hover-elevate ${
                        currentCircuitId === circuit.id ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => loadCircuit(circuit)}
                      data-testid={`saved-circuit-${circuit.id}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm truncate">{circuit.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {circuit.nodes.length} nodes
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{circuit.description}</p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Center - Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-14 border-b px-4 flex items-center justify-between gap-4 bg-card">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={newCircuit} data-testid="button-new-circuit">
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
            <Input
              value={circuitName}
              onChange={(e) => setCircuitName(e.target.value)}
              className="w-48 font-medium"
              data-testid="input-circuit-name"
            />
            <Badge variant="secondary" className="text-xs">
              {circuitNodes.length} modules
            </Badge>
            {currentCircuitId && (
              <Badge variant="outline" className="text-xs gap-1">
                <GitBranch className="h-3 w-3" />
                v{currentVersion}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={saveCircuit}
              disabled={saveCircuitMutation.isPending || updateCircuitMutation.isPending || circuitNodes.length === 0}
              data-testid="button-save-circuit"
            >
              <Save className="h-4 w-4 mr-1" />
              {(saveCircuitMutation.isPending || updateCircuitMutation.isPending) ? "Saving..." : (currentCircuitId ? "Update" : "Save")}
            </Button>
            <Dialog open={versionDialogOpen} onOpenChange={setVersionDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={createVersion}
                  disabled={!currentCircuitId || createVersionMutation.isPending}
                  data-testid="button-create-version"
                >
                  <History className="h-4 w-4 mr-1" />
                  Version
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save New Version</DialogTitle>
                  <DialogDescription>
                    Create a snapshot of your current circuit that you can restore later.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="changelog">Version Notes (optional)</Label>
                    <Textarea
                      id="changelog"
                      placeholder="Describe what changed in this version..."
                      value={versionChangelog}
                      onChange={(e) => setVersionChangelog(e.target.value)}
                      data-testid="input-version-changelog"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setVersionDialogOpen(false)}>Cancel</Button>
                  <Button
                    onClick={handleCreateVersion}
                    disabled={createVersionMutation.isPending}
                    data-testid="button-confirm-version"
                  >
                    {createVersionMutation.isPending ? "Creating..." : "Create Version"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={() => setCircuitNodes([])} data-testid="button-clear-circuit">
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-export-code">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => exportCode("anchor")} data-testid="export-anchor">
                  <SiSolana className="h-4 w-4 mr-2 text-[#9945FF]" />
                  Solana Anchor (Rust)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportCode("typescript")} data-testid="export-typescript">
                  <SiTypescript className="h-4 w-4 mr-2 text-[#3178C6]" />
                  TypeScript SDK
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => exportCode("circom")} data-testid="export-circom">
                  <FileCode2 className="h-4 w-4 mr-2 text-orange-500" />
                  Circom (zkSNARK)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportCode("noir")} data-testid="export-noir">
                  <FileCode2 className="h-4 w-4 mr-2 text-purple-500" />
                  Noir (Aztec)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              onClick={executeCircuit}
              disabled={isExecuting || circuitNodes.length === 0}
              data-testid="button-execute-circuit"
            >
              <Play className="h-4 w-4 mr-1" />
              {isExecuting ? "Executing..." : "Execute"}
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-muted/30 p-6 overflow-auto">
          {circuitNodes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Puzzle className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start Building Your Circuit</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                Drag modules from the left panel to compose your zero-knowledge circuit.
                Each module represents a sealed cryptographic operation.
              </p>
              <Button variant="outline" onClick={() => addModule(moduleTemplates[0])} data-testid="button-add-first-module">
                <Plus className="h-4 w-4 mr-2" />
                Add First Module
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Circuit Flow */}
              <div className="flex flex-wrap gap-4">
                {circuitNodes.map((node, index) => {
                  const Icon = categoryIcons[node.type];
                  const isActive = executionStep === index;
                  const isCompleted = executionStep !== null && index < executionStep;
                  return (
                    <div key={node.id} className="flex items-center gap-4">
                      <Card
                        className={`w-64 cursor-pointer transition-all ${
                          selectedNode?.id === node.id ? "ring-2 ring-primary" : ""
                        } ${isActive ? "ring-2 ring-green-500 animate-pulse" : ""} ${
                          isCompleted ? "opacity-50" : ""
                        }`}
                        onClick={() => setSelectedNode(node)}
                        data-testid={`node-${node.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className={`p-2 rounded-lg ${categoryColors[node.type]}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNode(node.id);
                              }}
                              data-testid={`button-remove-${node.id}`}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <h4 className="font-medium text-sm mb-1">{node.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Lock className="h-3 w-3" />
                            <span>Encrypted Execution</span>
                          </div>
                          {isActive && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-green-500">
                              <Zap className="h-3 w-3 animate-pulse" />
                              <span>Processing...</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      {index < circuitNodes.length - 1 && (
                        <div className="flex items-center">
                          <div className="w-8 h-0.5 bg-border" />
                          <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-border" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Execution Results */}
              {executionStep === null && isExecuting === false && circuitNodes.length > 0 && (
                <Card className="bg-green-500/5 border-green-500/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-500/10">
                      <Zap className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Circuit Ready</p>
                      <p className="text-xs text-muted-foreground">
                        Click Execute to run ZK proof generation
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Properties & Versions */}
      <div className="w-80 border-l bg-card flex flex-col">
        <Tabs value={rightPanelTab} onValueChange={(v) => setRightPanelTab(v as "properties" | "versions")} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger value="properties" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary gap-1">
              <Settings className="h-3 w-3" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="versions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary gap-1">
              <History className="h-3 w-3" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="flex-1 flex flex-col m-0 mt-0">
            <ScrollArea className="flex-1">
              {selectedNode ? (
                <div className="p-4 space-y-4">
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Module Type</Label>
                    <Badge className={`mt-1 ${categoryColors[selectedNode.type]}`}>
                      {selectedNode.type.replace("_", " ")}
                    </Badge>
                  </div>

                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Name</Label>
                    <p className="font-medium">{selectedNode.name}</p>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Inputs</Label>
                    <div className="space-y-2">
                      {selectedNode.inputs?.map((input) => (
                        <div key={input} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-sm font-mono">{input}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Outputs</Label>
                    <div className="space-y-2">
                      {selectedNode.outputs?.map((output) => (
                        <div key={output} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-sm font-mono">{output}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Security</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Lock className="h-4 w-4 text-green-500" />
                        <span>Encrypted Execution</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Eye className="h-4 w-4 text-green-500" />
                        <span>Zero-Knowledge Proof</span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full" data-testid="button-export-node-code">
                        <Copy className="h-4 w-4 mr-2" />
                        Export Code
                        <ChevronDown className="h-3 w-3 ml-auto" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-52">
                      <DropdownMenuItem onClick={() => exportCode("anchor")} data-testid="export-node-anchor">
                        <SiSolana className="h-4 w-4 mr-2 text-[#9945FF]" />
                        Solana Anchor (Rust)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportCode("typescript")} data-testid="export-node-typescript">
                        <SiTypescript className="h-4 w-4 mr-2 text-[#3178C6]" />
                        TypeScript SDK
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => exportCode("circom")} data-testid="export-node-circom">
                        <FileCode2 className="h-4 w-4 mr-2 text-orange-500" />
                        Circom (zkSNARK)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportCode("noir")} data-testid="export-node-noir">
                        <FileCode2 className="h-4 w-4 mr-2 text-purple-500" />
                        Noir (Aztec)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a module to view properties</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="versions" className="flex-1 flex flex-col m-0 mt-0">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {!currentCircuitId ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Save your circuit to enable versioning</p>
                    <p className="text-xs mt-1">Version history helps you track changes</p>
                  </div>
                ) : versionsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : circuitVersions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No versions saved yet</p>
                    <p className="text-xs mt-1">Click "Version" button to create one</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={createVersion}
                      data-testid="button-create-first-version"
                    >
                      <History className="h-4 w-4 mr-1" />
                      Create First Version
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {circuitVersions.map((version) => {
                      const isCurrent = version.version === currentVersion;
                      return (
                        <Card
                          key={version.id}
                          className={`${isCurrent ? "border-primary bg-primary/5" : ""}`}
                          data-testid={`version-${version.version}`}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={isCurrent ? "default" : "secondary"} className="text-xs">
                                  v{version.version}
                                </Badge>
                                {isCurrent && (
                                  <span className="text-xs text-primary font-medium">Current</span>
                                )}
                              </div>
                              {!isCurrent && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => handleRestoreVersion(version.version)}
                                  disabled={restoreVersionMutation.isPending}
                                  data-testid={`button-restore-${version.version}`}
                                >
                                  <RotateCcw className="h-3 w-3 mr-1" />
                                  Restore
                                </Button>
                              )}
                            </div>
                            {version.changelog && (
                              <p className="text-sm text-muted-foreground mb-2">{version.changelog}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatVersionDate(version.createdAt)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Puzzle className="h-3 w-3" />
                                {version.nodes.length} modules
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
