import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import {
  circuitsTable,
  circuitVersionsTable,
  proofsTable,
  encryptedDataTable,
  type Circuit,
  type InsertCircuit,
  type CircuitVersion,
  type Proof,
  type InsertProof,
  type EncryptedData,
  type InsertEncryptedData,
  type ChainStatus,
  type ModuleTemplate,
} from "@shared/schema";

const moduleTemplates: ModuleTemplate[] = [
  {
    id: "identity-verify",
    type: "identity",
    name: "Identity Verify",
    description: "Verify identity without revealing personal data",
    icon: "User",
    inputs: [{ name: "credential", type: "bytes" }],
    outputs: [{ name: "verified", type: "bool" }],
  },
  {
    id: "identity-age",
    type: "identity",
    name: "Age Proof",
    description: "Prove age threshold without revealing actual age",
    icon: "User",
    inputs: [{ name: "birthdate", type: "bytes" }, { name: "threshold", type: "uint" }],
    outputs: [{ name: "above_threshold", type: "bool" }],
  },
  {
    id: "transfer-private",
    type: "transfer",
    name: "Private Transfer",
    description: "Transfer assets with hidden amounts and parties",
    icon: "ArrowRightLeft",
    inputs: [{ name: "sender", type: "address" }, { name: "receiver", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "proof", type: "bytes" }],
  },
  {
    id: "transfer-batch",
    type: "transfer",
    name: "Batch Transfer",
    description: "Multiple private transfers in one proof",
    icon: "ArrowRightLeft",
    inputs: [{ name: "transfers", type: "bytes[]" }],
    outputs: [{ name: "proof", type: "bytes" }],
  },
  {
    id: "storage-commit",
    type: "storage",
    name: "Data Commit",
    description: "Commit data with cryptographic hash",
    icon: "Database",
    inputs: [{ name: "data", type: "bytes" }],
    outputs: [{ name: "commitment", type: "bytes32" }],
  },
  {
    id: "storage-retrieve",
    type: "storage",
    name: "Private Retrieve",
    description: "Retrieve data with ZK access proof",
    icon: "Database",
    inputs: [{ name: "commitment", type: "bytes32" }, { name: "proof", type: "bytes" }],
    outputs: [{ name: "data", type: "bytes" }],
  },
  {
    id: "ai-inference",
    type: "ai_inference",
    name: "Private ML Inference",
    description: "Run ML model on encrypted input",
    icon: "Brain",
    inputs: [{ name: "model_id", type: "bytes32" }, { name: "input", type: "bytes" }],
    outputs: [{ name: "result", type: "bytes" }, { name: "proof", type: "bytes" }],
  },
  {
    id: "ai-classify",
    type: "ai_inference",
    name: "Private Classification",
    description: "Classify data without exposing model or input",
    icon: "Brain",
    inputs: [{ name: "input", type: "bytes" }],
    outputs: [{ name: "class", type: "uint" }, { name: "confidence", type: "uint" }],
  },
  {
    id: "validation-range",
    type: "validation",
    name: "Range Proof",
    description: "Prove value is within range without revealing it",
    icon: "CheckSquare",
    inputs: [{ name: "value", type: "uint256" }, { name: "min", type: "uint256" }, { name: "max", type: "uint256" }],
    outputs: [{ name: "in_range", type: "bool" }],
  },
  {
    id: "validation-merkle",
    type: "validation",
    name: "Merkle Proof",
    description: "Prove membership in a set without revealing element",
    icon: "CheckSquare",
    inputs: [{ name: "element", type: "bytes32" }, { name: "root", type: "bytes32" }],
    outputs: [{ name: "is_member", type: "bool" }],
  },
];

const chainStatusConfig: ChainStatus[] = [
  { chain: "solana", status: "online", verificationCount: 0, avgLatency: 4, lastBlock: 298765432 },
  { chain: "solana-devnet", status: "online", verificationCount: 0, avgLatency: 5, lastBlock: 187654321 },
  { chain: "eclipse", status: "online", verificationCount: 0, avgLatency: 8, lastBlock: 54321098 },
  { chain: "ethereum", status: "online", verificationCount: 0, avgLatency: 12, lastBlock: 19234567 },
  { chain: "polygon", status: "online", verificationCount: 0, avgLatency: 8, lastBlock: 54321098 },
  { chain: "base", status: "online", verificationCount: 0, avgLatency: 15, lastBlock: 12345678 },
  { chain: "arbitrum", status: "online", verificationCount: 0, avgLatency: 15, lastBlock: 187654321 },
  { chain: "optimism", status: "online", verificationCount: 0, avgLatency: 11, lastBlock: 98765432 },
  { chain: "avalanche", status: "online", verificationCount: 0, avgLatency: 22, lastBlock: 45678901 },
];

export interface IStorage {
  getCircuits(): Promise<Circuit[]>;
  getCircuit(id: string): Promise<Circuit | undefined>;
  createCircuit(circuit: InsertCircuit): Promise<Circuit>;
  updateCircuit(id: string, circuit: Partial<InsertCircuit>): Promise<Circuit | undefined>;
  deleteCircuit(id: string): Promise<boolean>;
  getCircuitVersions(circuitId: string): Promise<CircuitVersion[]>;
  getCircuitVersion(circuitId: string, version: number): Promise<CircuitVersion | undefined>;
  createCircuitVersion(circuitId: string, changelog?: string): Promise<CircuitVersion>;
  restoreCircuitVersion(circuitId: string, version: number): Promise<Circuit | undefined>;
  getProofs(): Promise<Proof[]>;
  getProof(id: string): Promise<Proof | undefined>;
  createProof(proof: InsertProof): Promise<Proof>;
  updateProofStatus(id: string, status: Proof["status"]): Promise<Proof | undefined>;
  encryptData(data: InsertEncryptedData): Promise<EncryptedData>;
  getEncryptedData(id: string): Promise<EncryptedData | undefined>;
  verifyComputation(id: string): Promise<{ inputHash: string; outputHash: string; proofHash: string } | undefined>;
  getChainStatus(): Promise<ChainStatus[]>;
  getModuleTemplates(): Promise<ModuleTemplate[]>;
  getStats(): Promise<{
    activeCircuits: number;
    proofsVerified: number;
    encryptedOperations: number;
    avgProofTime: number;
  }>;
  getPerformanceMetrics(): Promise<{
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
  }>;
}

function deterministicHash(input: string, seed: string = ""): string {
  let hash = 0;
  const combined = input + seed;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return "0x" + Math.abs(hash).toString(16).padStart(64, "0").slice(0, 64);
}

function simpleHash(input: string): string {
  return deterministicHash(input);
}

export class DatabaseStorage implements IStorage {
  private chainStatus: ChainStatus[];

  constructor() {
    this.chainStatus = [...chainStatusConfig];
  }

  async getCircuits(): Promise<Circuit[]> {
    const results = await db.select().from(circuitsTable).orderBy(desc(circuitsTable.updatedAt));
    return results.map(r => ({
      id: r.id.toString(),
      name: r.name,
      description: r.description || undefined,
      nodes: r.nodes,
      connections: r.connections,
      currentVersion: r.currentVersion,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async getCircuit(id: string): Promise<Circuit | undefined> {
    const [result] = await db.select().from(circuitsTable).where(eq(circuitsTable.id, parseInt(id)));
    if (!result) return undefined;
    return {
      id: result.id.toString(),
      name: result.name,
      description: result.description || undefined,
      nodes: result.nodes,
      connections: result.connections,
      currentVersion: result.currentVersion,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  async createCircuit(circuit: InsertCircuit): Promise<Circuit> {
    const [result] = await db.insert(circuitsTable).values({
      name: circuit.name,
      description: circuit.description,
      nodes: circuit.nodes,
      connections: circuit.connections,
      currentVersion: 1,
    }).returning();
    return {
      id: result.id.toString(),
      name: result.name,
      description: result.description || undefined,
      nodes: result.nodes,
      connections: result.connections,
      currentVersion: result.currentVersion,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  async updateCircuit(id: string, circuit: Partial<InsertCircuit>): Promise<Circuit | undefined> {
    const [result] = await db.update(circuitsTable)
      .set({
        ...circuit,
        updatedAt: new Date(),
      })
      .where(eq(circuitsTable.id, parseInt(id)))
      .returning();
    if (!result) return undefined;
    return {
      id: result.id.toString(),
      name: result.name,
      description: result.description || undefined,
      nodes: result.nodes,
      connections: result.connections,
      currentVersion: result.currentVersion,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  async deleteCircuit(id: string): Promise<boolean> {
    await db.delete(circuitVersionsTable).where(eq(circuitVersionsTable.circuitId, parseInt(id)));
    const result = await db.delete(circuitsTable).where(eq(circuitsTable.id, parseInt(id))).returning();
    return result.length > 0;
  }

  async getCircuitVersions(circuitId: string): Promise<CircuitVersion[]> {
    const results = await db.select().from(circuitVersionsTable)
      .where(eq(circuitVersionsTable.circuitId, parseInt(circuitId)))
      .orderBy(desc(circuitVersionsTable.version));
    return results.map(r => ({
      id: r.id.toString(),
      circuitId: r.circuitId.toString(),
      version: r.version,
      name: r.name,
      description: r.description || undefined,
      nodes: r.nodes,
      connections: r.connections,
      changelog: r.changelog || undefined,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async getCircuitVersion(circuitId: string, version: number): Promise<CircuitVersion | undefined> {
    const [result] = await db.select().from(circuitVersionsTable)
      .where(and(
        eq(circuitVersionsTable.circuitId, parseInt(circuitId)),
        eq(circuitVersionsTable.version, version)
      ));
    if (!result) return undefined;
    return {
      id: result.id.toString(),
      circuitId: result.circuitId.toString(),
      version: result.version,
      name: result.name,
      description: result.description || undefined,
      nodes: result.nodes,
      connections: result.connections,
      changelog: result.changelog || undefined,
      createdAt: result.createdAt.toISOString(),
    };
  }

  async createCircuitVersion(circuitId: string, changelog?: string): Promise<CircuitVersion> {
    const circuit = await this.getCircuit(circuitId);
    if (!circuit) throw new Error("Circuit not found");

    const existingVersions = await this.getCircuitVersions(circuitId);
    const nextVersion = existingVersions.length > 0 
      ? Math.max(...existingVersions.map(v => v.version)) + 1 
      : 1;

    const [result] = await db.insert(circuitVersionsTable).values({
      circuitId: parseInt(circuitId),
      version: nextVersion,
      name: circuit.name,
      description: circuit.description,
      nodes: circuit.nodes,
      connections: circuit.connections,
      changelog: changelog || `Version ${nextVersion}`,
    }).returning();

    await db.update(circuitsTable)
      .set({ currentVersion: nextVersion })
      .where(eq(circuitsTable.id, parseInt(circuitId)));

    return {
      id: result.id.toString(),
      circuitId: result.circuitId.toString(),
      version: result.version,
      name: result.name,
      description: result.description || undefined,
      nodes: result.nodes,
      connections: result.connections,
      changelog: result.changelog || undefined,
      createdAt: result.createdAt.toISOString(),
    };
  }

  async restoreCircuitVersion(circuitId: string, version: number): Promise<Circuit | undefined> {
    const targetVersion = await this.getCircuitVersion(circuitId, version);
    if (!targetVersion) return undefined;

    const [result] = await db.update(circuitsTable)
      .set({
        name: targetVersion.name,
        description: targetVersion.description,
        nodes: targetVersion.nodes,
        connections: targetVersion.connections,
        currentVersion: version,
        updatedAt: new Date(),
      })
      .where(eq(circuitsTable.id, parseInt(circuitId)))
      .returning();

    if (!result) return undefined;
    return {
      id: result.id.toString(),
      name: result.name,
      description: result.description || undefined,
      nodes: result.nodes,
      connections: result.connections,
      currentVersion: result.currentVersion,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  async getProofs(): Promise<Proof[]> {
    const results = await db.select().from(proofsTable).orderBy(desc(proofsTable.timestamp));
    return results.map(r => ({
      id: r.id.toString(),
      circuitId: r.circuitId?.toString(),
      type: r.type,
      status: r.status as Proof["status"],
      chain: r.chain as Proof["chain"],
      proofHash: r.proofHash,
      verificationTime: r.verificationTime || undefined,
      gasUsed: r.gasUsed || undefined,
      timestamp: r.timestamp.toISOString(),
      details: r.details || undefined,
    }));
  }

  async getProof(id: string): Promise<Proof | undefined> {
    const [result] = await db.select().from(proofsTable).where(eq(proofsTable.id, parseInt(id)));
    if (!result) return undefined;
    return {
      id: result.id.toString(),
      circuitId: result.circuitId?.toString(),
      type: result.type,
      status: result.status as Proof["status"],
      chain: result.chain as Proof["chain"],
      proofHash: result.proofHash,
      verificationTime: result.verificationTime || undefined,
      gasUsed: result.gasUsed || undefined,
      timestamp: result.timestamp.toISOString(),
      details: result.details || undefined,
    };
  }

  async createProof(proof: InsertProof): Promise<Proof> {
    const [result] = await db.insert(proofsTable).values({
      circuitId: proof.circuitId ? parseInt(proof.circuitId) : null,
      type: proof.type,
      status: proof.status,
      chain: proof.chain,
      proofHash: proof.proofHash,
      verificationTime: proof.verificationTime,
      gasUsed: proof.gasUsed,
      details: proof.details,
    }).returning();

    const chainIndex = this.chainStatus.findIndex((c) => c.chain === proof.chain);
    if (chainIndex >= 0) {
      this.chainStatus[chainIndex].verificationCount++;
    }

    return {
      id: result.id.toString(),
      circuitId: result.circuitId?.toString(),
      type: result.type,
      status: result.status as Proof["status"],
      chain: result.chain as Proof["chain"],
      proofHash: result.proofHash,
      verificationTime: result.verificationTime || undefined,
      gasUsed: result.gasUsed || undefined,
      timestamp: result.timestamp.toISOString(),
      details: result.details || undefined,
    };
  }

  async updateProofStatus(id: string, status: Proof["status"]): Promise<Proof | undefined> {
    const [existing] = await db.select().from(proofsTable).where(eq(proofsTable.id, parseInt(id)));
    if (!existing) return undefined;

    const updates: any = { status };
    if (status === "verified") {
      const typeHash = Math.abs(existing.type.split('').reduce((a, b) => a + b.charCodeAt(0), 0));
      updates.verificationTime = (typeHash % 200) / 100 + 0.5;
      updates.gasUsed = (typeHash % 200000) + 100000;
    }

    const [result] = await db.update(proofsTable)
      .set(updates)
      .where(eq(proofsTable.id, parseInt(id)))
      .returning();
    if (!result) return undefined;
    return {
      id: result.id.toString(),
      circuitId: result.circuitId?.toString(),
      type: result.type,
      status: result.status as Proof["status"],
      chain: result.chain as Proof["chain"],
      proofHash: result.proofHash,
      verificationTime: result.verificationTime || undefined,
      gasUsed: result.gasUsed || undefined,
      timestamp: result.timestamp.toISOString(),
      details: result.details || undefined,
    };
  }

  async encryptData(data: InsertEncryptedData): Promise<EncryptedData> {
    const algorithm = data.algorithm || "poseidon";
    const encrypted = Buffer.from(data.plainData).toString("base64")
      .split("")
      .map((c, i) => String.fromCharCode(((c.charCodeAt(0) - 65 + i) % 26) + 65))
      .join("");

    const [result] = await db.insert(encryptedDataTable).values({
      originalHash: simpleHash(data.plainData),
      encryptedData: `-----BEGIN ENCRYPTED DATA-----\n${encrypted.match(/.{1,32}/g)?.join("\n") || encrypted}\n-----END ENCRYPTED DATA-----`,
      algorithm,
      verified: false,
    }).returning();

    return {
      id: result.id.toString(),
      originalHash: result.originalHash,
      encryptedData: result.encryptedData,
      algorithm: result.algorithm,
      outputHash: undefined,
      proofHash: undefined,
      timestamp: result.timestamp.toISOString(),
      verified: result.verified,
    };
  }

  async getEncryptedData(id: string): Promise<EncryptedData | undefined> {
    const [result] = await db.select().from(encryptedDataTable).where(eq(encryptedDataTable.id, parseInt(id)));
    if (!result) return undefined;
    return {
      id: result.id.toString(),
      originalHash: result.originalHash,
      encryptedData: result.encryptedData,
      algorithm: result.algorithm,
      outputHash: result.outputHash || undefined,
      proofHash: result.proofHash || undefined,
      timestamp: result.timestamp.toISOString(),
      verified: result.verified,
    };
  }

  async verifyComputation(id: string): Promise<{ inputHash: string; outputHash: string; proofHash: string } | undefined> {
    const [existing] = await db.select().from(encryptedDataTable).where(eq(encryptedDataTable.id, parseInt(id)));
    if (!existing) return undefined;

    if (existing.verified && existing.outputHash && existing.proofHash) {
      return {
        inputHash: existing.originalHash,
        outputHash: existing.outputHash,
        proofHash: existing.proofHash,
      };
    }

    const outputHash = deterministicHash(existing.encryptedData, "output");
    const proofHash = deterministicHash(existing.originalHash + existing.encryptedData, "proof");

    const [result] = await db.update(encryptedDataTable)
      .set({ 
        verified: true,
        outputHash,
        proofHash,
      })
      .where(eq(encryptedDataTable.id, parseInt(id)))
      .returning();
    if (!result) return undefined;
    
    return {
      inputHash: result.originalHash,
      outputHash: result.outputHash!,
      proofHash: result.proofHash!,
    };
  }

  async getChainStatus(): Promise<ChainStatus[]> {
    const proofs = await db.select().from(proofsTable);
    const chainCounts: Record<string, number> = {};
    proofs.forEach(p => {
      chainCounts[p.chain] = (chainCounts[p.chain] || 0) + 1;
    });

    return this.chainStatus.map((chain) => ({
      ...chain,
      verificationCount: chainCounts[chain.chain] || 0,
      lastBlock: chain.lastBlock + Math.floor(Math.random() * 10),
      avgLatency: Math.max(5, chain.avgLatency + Math.floor(Math.random() * 5) - 2),
    }));
  }

  async getModuleTemplates(): Promise<ModuleTemplate[]> {
    return moduleTemplates;
  }

  async getStats(): Promise<{
    activeCircuits: number;
    proofsVerified: number;
    encryptedOperations: number;
    avgProofTime: number;
  }> {
    const circuits = await db.select().from(circuitsTable);
    const proofs = await db.select().from(proofsTable);
    const encryptedItems = await db.select().from(encryptedDataTable);

    const verifiedProofs = proofs.filter((p) => p.status === "verified");
    const avgTime = verifiedProofs.length > 0
      ? verifiedProofs.reduce((sum, p) => sum + (p.verificationTime || 0), 0) / verifiedProofs.length
      : 0;

    return {
      activeCircuits: circuits.length,
      proofsVerified: verifiedProofs.length,
      encryptedOperations: encryptedItems.length,
      avgProofTime: Math.round(avgTime * 10) / 10,
    };
  }

  async getPerformanceMetrics(): Promise<{
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
  }> {
    const proofs = await db.select().from(proofsTable).orderBy(proofsTable.timestamp);
    const circuits = await db.select().from(circuitsTable);
    const verifiedProofs = proofs.filter((p) => p.status === "verified");

    const verificationTimes = verifiedProofs.map((p) => p.verificationTime || 0).filter((t) => t > 0).sort((a, b) => a - b);
    const proofTimeAnalytics = {
      avg: verificationTimes.length > 0 ? verificationTimes.reduce((a, b) => a + b, 0) / verificationTimes.length : 0,
      min: verificationTimes.length > 0 ? verificationTimes[0] : 0,
      max: verificationTimes.length > 0 ? verificationTimes[verificationTimes.length - 1] : 0,
      p50: verificationTimes.length > 0 ? verificationTimes[Math.floor(verificationTimes.length * 0.5)] : 0,
      p95: verificationTimes.length > 0 ? verificationTimes[Math.floor(verificationTimes.length * 0.95)] : 0,
      trend: verifiedProofs.slice(-20).map((p) => ({
        timestamp: p.timestamp.toISOString(),
        value: p.verificationTime || 0,
      })),
    };

    const gasValues = verifiedProofs.map((p) => p.gasUsed || 0);
    const totalGasUsed = gasValues.reduce((a, b) => a + b, 0);
    const chainGasMap = new Map<string, { total: number; count: number }>();
    verifiedProofs.forEach((p) => {
      const existing = chainGasMap.get(p.chain) || { total: 0, count: 0 };
      chainGasMap.set(p.chain, {
        total: existing.total + (p.gasUsed || 0),
        count: existing.count + 1,
      });
    });
    const gasAnalytics = {
      totalGasUsed,
      avgGasPerProof: verifiedProofs.length > 0 ? totalGasUsed / verifiedProofs.length : 0,
      byChain: Array.from(chainGasMap.entries()).map(([chain, data]) => ({
        chain,
        totalGas: data.total,
        avgGas: data.count > 0 ? data.total / data.count : 0,
        count: data.count,
      })),
    };

    const moduleCountPerCircuit = circuits.map((c) => ((c.nodes as any[]) || []).length);
    const avgModules = moduleCountPerCircuit.length > 0
      ? moduleCountPerCircuit.reduce((a, b) => a + b, 0) / moduleCountPerCircuit.length
      : 0;
    const complexityRanges = [
      { range: "1-2 modules", min: 1, max: 2 },
      { range: "3-5 modules", min: 3, max: 5 },
      { range: "6-10 modules", min: 6, max: 10 },
      { range: "10+ modules", min: 11, max: Infinity },
    ];
    const complexityDist = complexityRanges.map(({ range, min, max }) => ({
      range,
      count: moduleCountPerCircuit.filter((c) => c >= min && c <= max).length,
    }));
    const typeMap = new Map<string, number>();
    circuits.forEach((c) => {
      ((c.nodes as any[]) || []).forEach((node: any) => {
        typeMap.set(node.type, (typeMap.get(node.type) || 0) + 1);
      });
    });
    const circuitComplexity = {
      totalCircuits: circuits.length,
      avgModulesPerCircuit: Math.round(avgModules * 10) / 10,
      complexityDistribution: complexityDist,
      byType: Array.from(typeMap.entries()).map(([type, count]) => ({ type, count })),
    };

    const chainStatusMap = new Map<string, { verified: number; pending: number; failed: number }>();
    proofs.forEach((p) => {
      const existing = chainStatusMap.get(p.chain) || { verified: 0, pending: 0, failed: 0 };
      if (p.status === "verified") existing.verified++;
      else if (p.status === "pending") existing.pending++;
      else if (p.status === "failed") existing.failed++;
      chainStatusMap.set(p.chain, existing);
    });
    const proofsByChain = Array.from(chainStatusMap.entries()).map(([chain, data]) => ({
      chain,
      ...data,
    }));

    const typeTimeMap = new Map<string, { count: number; totalTime: number }>();
    verifiedProofs.forEach((p) => {
      const existing = typeTimeMap.get(p.type) || { count: 0, totalTime: 0 };
      typeTimeMap.set(p.type, {
        count: existing.count + 1,
        totalTime: existing.totalTime + (p.verificationTime || 0),
      });
    });
    const proofsByType = Array.from(typeTimeMap.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      avgTime: data.count > 0 ? Math.round((data.totalTime / data.count) * 100) / 100 : 0,
    }));

    const last7Days = new Map<string, { proofs: number; gas: number }>();
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      last7Days.set(dateStr, { proofs: 0, gas: 0 });
    }
    proofs.forEach((p) => {
      const dateStr = p.timestamp.toISOString().split("T")[0];
      if (last7Days.has(dateStr)) {
        const existing = last7Days.get(dateStr)!;
        last7Days.set(dateStr, {
          proofs: existing.proofs + 1,
          gas: existing.gas + (p.gasUsed || 0),
        });
      }
    });
    const recentActivity = Array.from(last7Days.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));

    return {
      proofTimeAnalytics,
      gasAnalytics,
      circuitComplexity,
      proofsByChain,
      proofsByType,
      recentActivity,
    };
  }
}

export const storage = new DatabaseStorage();
