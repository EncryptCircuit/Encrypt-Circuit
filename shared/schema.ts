import { z } from "zod";
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Circuit Module Types
export const circuitModuleTypes = [
  "identity",
  "transfer",
  "storage",
  "ai_inference",
  "validation",
  "custom"
] as const;

export type CircuitModuleType = typeof circuitModuleTypes[number];

// Circuit Node Schema
export const circuitNodeSchema = z.object({
  id: z.string(),
  type: z.enum(circuitModuleTypes),
  name: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  config: z.record(z.any()).optional(),
  inputs: z.array(z.string()).optional(),
  outputs: z.array(z.string()).optional()
});

export type CircuitNode = z.infer<typeof circuitNodeSchema>;

// Circuit Connection Schema
export const circuitConnectionSchema = z.object({
  id: z.string(),
  sourceNodeId: z.string(),
  sourceOutput: z.string(),
  targetNodeId: z.string(),
  targetInput: z.string()
});

export type CircuitConnection = z.infer<typeof circuitConnectionSchema>;

// Circuit Schema
export const circuitSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  nodes: z.array(circuitNodeSchema),
  connections: z.array(circuitConnectionSchema),
  currentVersion: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type Circuit = z.infer<typeof circuitSchema>;

export const insertCircuitSchema = circuitSchema.omit({ id: true, createdAt: true, updatedAt: true, currentVersion: true });
export type InsertCircuit = z.infer<typeof insertCircuitSchema>;

// Proof Status Types
export const proofStatuses = ["pending", "verified", "failed"] as const;
export type ProofStatus = typeof proofStatuses[number];

// Blockchain Types - Solana-first with backwards compatibility
export const blockchains = ["solana", "solana-devnet", "eclipse", "ethereum", "polygon", "base", "arbitrum", "optimism", "avalanche"] as const;
export type Blockchain = typeof blockchains[number];

// Solana-focused chains (primary networks)
export const primaryChains = ["solana", "solana-devnet", "eclipse"] as const;

// Chain display names for UI
export const chainDisplayNames: Record<Blockchain, string> = {
  solana: "Solana",
  "solana-devnet": "Solana Devnet",
  eclipse: "Eclipse",
  ethereum: "Ethereum",
  polygon: "Polygon",
  base: "Base",
  arbitrum: "Arbitrum",
  optimism: "Optimism",
  avalanche: "Avalanche",
};

// Proof Schema
export const proofSchema = z.object({
  id: z.string(),
  circuitId: z.string().optional(),
  type: z.string(),
  status: z.enum(proofStatuses),
  chain: z.enum(blockchains),
  proofHash: z.string(),
  verificationTime: z.number().optional(),
  gasUsed: z.number().optional(),
  timestamp: z.string(),
  details: z.record(z.any()).optional()
});

export type Proof = z.infer<typeof proofSchema>;

export const insertProofSchema = proofSchema.omit({ id: true, timestamp: true });
export type InsertProof = z.infer<typeof insertProofSchema>;

// Chain Status Schema
export const chainStatusSchema = z.object({
  chain: z.enum(blockchains),
  status: z.enum(["online", "degraded", "offline"]),
  verificationCount: z.number(),
  avgLatency: z.number(),
  lastBlock: z.number()
});

export type ChainStatus = z.infer<typeof chainStatusSchema>;

// Encrypted Data Schema
export const encryptedDataSchema = z.object({
  id: z.string(),
  originalHash: z.string(),
  encryptedData: z.string(),
  algorithm: z.string(),
  outputHash: z.string().optional(),
  proofHash: z.string().optional(),
  timestamp: z.string(),
  verified: z.boolean()
});

export type EncryptedData = z.infer<typeof encryptedDataSchema>;

export const insertEncryptedDataSchema = z.object({
  plainData: z.string(),
  algorithm: z.string().optional()
});

export type InsertEncryptedData = z.infer<typeof insertEncryptedDataSchema>;

// Computation Result Schema
export const computationResultSchema = z.object({
  id: z.string(),
  inputHash: z.string(),
  outputHash: z.string(),
  proofHash: z.string(),
  status: z.enum(["submitted", "computing", "verified", "failed"]),
  steps: z.array(z.object({
    name: z.string(),
    status: z.enum(["pending", "active", "completed", "failed"]),
    timestamp: z.string().optional()
  }))
});

export type ComputationResult = z.infer<typeof computationResultSchema>;

// Demo Types
export const demoTypes = [
  "private_voting",
  "encrypted_messaging", 
  "confidential_transfer",
  "identity_verification",
  "private_ai"
] as const;

export type DemoType = typeof demoTypes[number];

// Demo Schema
export const demoSchema = z.object({
  id: z.string(),
  type: z.enum(demoTypes),
  title: z.string(),
  description: z.string(),
  steps: z.array(z.object({
    title: z.string(),
    description: z.string(),
    code: z.string().optional()
  })),
  isInteractive: z.boolean()
});

export type Demo = z.infer<typeof demoSchema>;

// Demo Execution Schema
export const demoExecutionSchema = z.object({
  id: z.string(),
  demoId: z.string(),
  currentStep: z.number(),
  inputs: z.record(z.any()),
  outputs: z.record(z.any()).optional(),
  proofGenerated: z.boolean(),
  executionTime: z.number().optional()
});

export type DemoExecution = z.infer<typeof demoExecutionSchema>;

// Circuit Module Template
export const moduleTemplateSchema = z.object({
  id: z.string(),
  type: z.enum(circuitModuleTypes),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  inputs: z.array(z.object({
    name: z.string(),
    type: z.string()
  })),
  outputs: z.array(z.object({
    name: z.string(),
    type: z.string()
  })),
  configFields: z.array(z.object({
    name: z.string(),
    type: z.string(),
    label: z.string(),
    defaultValue: z.any().optional()
  })).optional()
});

export type ModuleTemplate = z.infer<typeof moduleTemplateSchema>;

// User Schema (keeping for compatibility)
export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  password: z.string()
});

export type User = z.infer<typeof userSchema>;

export const insertUserSchema = userSchema.omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;

// Circuit Version Schema
export const circuitVersionSchema = z.object({
  id: z.string(),
  circuitId: z.string(),
  version: z.number(),
  name: z.string(),
  description: z.string().optional(),
  nodes: z.array(circuitNodeSchema),
  connections: z.array(circuitConnectionSchema),
  changelog: z.string().optional(),
  createdAt: z.string(),
});

export type CircuitVersion = z.infer<typeof circuitVersionSchema>;

export const insertCircuitVersionSchema = circuitVersionSchema.omit({ id: true, createdAt: true });
export type InsertCircuitVersion = z.infer<typeof insertCircuitVersionSchema>;

// ============================================
// Drizzle Tables for Database Persistence
// ============================================

export const circuitsTable = pgTable("circuits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  nodes: jsonb("nodes").notNull().$type<CircuitNode[]>(),
  connections: jsonb("connections").notNull().$type<CircuitConnection[]>(),
  currentVersion: integer("current_version").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const circuitVersionsTable = pgTable("circuit_versions", {
  id: serial("id").primaryKey(),
  circuitId: integer("circuit_id").notNull(),
  version: integer("version").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  nodes: jsonb("nodes").notNull().$type<CircuitNode[]>(),
  connections: jsonb("connections").notNull().$type<CircuitConnection[]>(),
  changelog: text("changelog"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const proofsTable = pgTable("proofs", {
  id: serial("id").primaryKey(),
  circuitId: integer("circuit_id"),
  type: text("type").notNull(),
  status: text("status").notNull(),
  chain: text("chain").notNull(),
  proofHash: text("proof_hash").notNull(),
  verificationTime: integer("verification_time"),
  gasUsed: integer("gas_used"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  details: jsonb("details").$type<Record<string, any>>(),
});

export const encryptedDataTable = pgTable("encrypted_data", {
  id: serial("id").primaryKey(),
  originalHash: text("original_hash").notNull(),
  encryptedData: text("encrypted_data").notNull(),
  algorithm: text("algorithm").notNull(),
  outputHash: text("output_hash"),
  proofHash: text("proof_hash"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  verified: boolean("verified").default(false).notNull(),
});

// Drizzle Insert Schemas
export const insertCircuitDbSchema = createInsertSchema(circuitsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCircuitVersionDbSchema = createInsertSchema(circuitVersionsTable).omit({ id: true, createdAt: true });
export const insertProofDbSchema = createInsertSchema(proofsTable).omit({ id: true, timestamp: true });
export const insertEncryptedDataDbSchema = createInsertSchema(encryptedDataTable).omit({ id: true, timestamp: true });

// Drizzle Select Types
export type CircuitDb = typeof circuitsTable.$inferSelect;
export type CircuitVersionDb = typeof circuitVersionsTable.$inferSelect;
export type ProofDb = typeof proofsTable.$inferSelect;
export type EncryptedDataDb = typeof encryptedDataTable.$inferSelect;
