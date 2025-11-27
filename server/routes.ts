import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertCircuitSchema, insertProofSchema, insertEncryptedDataSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  const clients = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log("WebSocket client connected");

    ws.on("close", () => {
      clients.delete(ws);
      console.log("WebSocket client disconnected");
    });
  });

  // Broadcast to all connected clients
  function broadcast(type: string, data: any) {
    const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Stats endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Performance metrics endpoint
  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = await storage.getPerformanceMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch performance metrics" });
    }
  });

  // Chain status endpoint
  app.get("/api/chains", async (req, res) => {
    try {
      const chains = await storage.getChainStatus();
      res.json(chains);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chain status" });
    }
  });

  // Module templates endpoint
  app.get("/api/modules", async (req, res) => {
    try {
      const modules = await storage.getModuleTemplates();
      res.json(modules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch module templates" });
    }
  });

  // Circuits CRUD
  app.get("/api/circuits", async (req, res) => {
    try {
      const circuits = await storage.getCircuits();
      res.json(circuits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch circuits" });
    }
  });

  app.get("/api/circuits/:id", async (req, res) => {
    try {
      const circuit = await storage.getCircuit(req.params.id);
      if (!circuit) {
        return res.status(404).json({ error: "Circuit not found" });
      }
      res.json(circuit);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch circuit" });
    }
  });

  app.post("/api/circuits", async (req, res) => {
    try {
      const parsed = insertCircuitSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid circuit data", details: parsed.error.errors });
      }
      const circuit = await storage.createCircuit(parsed.data);
      broadcast("circuit:created", circuit);
      res.status(201).json(circuit);
    } catch (error) {
      res.status(500).json({ error: "Failed to create circuit" });
    }
  });

  app.patch("/api/circuits/:id", async (req, res) => {
    try {
      const parsed = insertCircuitSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid circuit data", details: parsed.error.errors });
      }
      const circuit = await storage.updateCircuit(req.params.id, parsed.data);
      if (!circuit) {
        return res.status(404).json({ error: "Circuit not found" });
      }
      broadcast("circuit:updated", circuit);
      res.json(circuit);
    } catch (error) {
      res.status(500).json({ error: "Failed to update circuit" });
    }
  });

  app.delete("/api/circuits/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCircuit(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Circuit not found" });
      }
      broadcast("circuit:deleted", { id: req.params.id });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete circuit" });
    }
  });

  // Circuit Versioning
  app.get("/api/circuits/:id/versions", async (req, res) => {
    try {
      const versions = await storage.getCircuitVersions(req.params.id);
      res.json(versions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch circuit versions" });
    }
  });

  app.get("/api/circuits/:id/versions/:version", async (req, res) => {
    try {
      const version = await storage.getCircuitVersion(req.params.id, parseInt(req.params.version));
      if (!version) {
        return res.status(404).json({ error: "Version not found" });
      }
      res.json(version);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch circuit version" });
    }
  });

  app.post("/api/circuits/:id/versions", async (req, res) => {
    try {
      const { changelog } = req.body;
      const version = await storage.createCircuitVersion(req.params.id, changelog);
      broadcast("circuit:version:created", { circuitId: req.params.id, version });
      res.status(201).json(version);
    } catch (error: any) {
      if (error.message === "Circuit not found") {
        return res.status(404).json({ error: "Circuit not found" });
      }
      res.status(500).json({ error: "Failed to create circuit version" });
    }
  });

  app.post("/api/circuits/:id/versions/:version/restore", async (req, res) => {
    try {
      const circuit = await storage.restoreCircuitVersion(req.params.id, parseInt(req.params.version));
      if (!circuit) {
        return res.status(404).json({ error: "Version not found" });
      }
      broadcast("circuit:version:restored", { circuitId: req.params.id, version: parseInt(req.params.version), circuit });
      res.json(circuit);
    } catch (error) {
      res.status(500).json({ error: "Failed to restore circuit version" });
    }
  });

  // Proofs CRUD
  app.get("/api/proofs", async (req, res) => {
    try {
      const proofs = await storage.getProofs();
      res.json(proofs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch proofs" });
    }
  });

  app.get("/api/proofs/:id", async (req, res) => {
    try {
      const proof = await storage.getProof(req.params.id);
      if (!proof) {
        return res.status(404).json({ error: "Proof not found" });
      }
      res.json(proof);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch proof" });
    }
  });

  app.post("/api/proofs", async (req, res) => {
    try {
      const parsed = insertProofSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid proof data", details: parsed.error.errors });
      }
      const proof = await storage.createProof(parsed.data);
      broadcast("proof:created", proof);
      res.status(201).json(proof);
    } catch (error) {
      res.status(500).json({ error: "Failed to create proof" });
    }
  });

  app.patch("/api/proofs/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!["pending", "verified", "failed"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const proof = await storage.updateProofStatus(req.params.id, status);
      if (!proof) {
        return res.status(404).json({ error: "Proof not found" });
      }
      broadcast("proof:updated", proof);
      res.json(proof);
    } catch (error) {
      res.status(500).json({ error: "Failed to update proof status" });
    }
  });

  // Encrypted data endpoints
  app.post("/api/encrypt", async (req, res) => {
    try {
      const parsed = insertEncryptedDataSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid data", details: parsed.error.errors });
      }
      const encrypted = await storage.encryptData(parsed.data);
      broadcast("data:encrypted", { id: encrypted.id });
      res.status(201).json(encrypted);
    } catch (error) {
      res.status(500).json({ error: "Failed to encrypt data" });
    }
  });

  app.get("/api/encrypted/:id", async (req, res) => {
    try {
      const data = await storage.getEncryptedData(req.params.id);
      if (!data) {
        return res.status(404).json({ error: "Encrypted data not found" });
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch encrypted data" });
    }
  });

  app.post("/api/encrypted/:id/verify", async (req, res) => {
    try {
      const result = await storage.verifyComputation(req.params.id);
      if (!result) {
        return res.status(404).json({ error: "Encrypted data not found" });
      }
      broadcast("computation:verified", { id: req.params.id, ...result });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to verify computation" });
    }
  });

  // Circuit execution simulation
  app.post("/api/circuits/:id/execute", async (req, res) => {
    try {
      const circuit = await storage.getCircuit(req.params.id);
      if (!circuit) {
        return res.status(404).json({ error: "Circuit not found" });
      }

      // Simulate execution with proof generation
      const executionId = `exec-${Date.now()}`;
      
      // Broadcast execution start
      broadcast("circuit:execution:start", { circuitId: circuit.id, executionId });

      // Simulate step-by-step execution
      for (let i = 0; i < circuit.nodes.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        broadcast("circuit:execution:step", {
          circuitId: circuit.id,
          executionId,
          step: i,
          node: circuit.nodes[i].name,
        });
      }

      // Create proof for the execution
      const proof = await storage.createProof({
        circuitId: circuit.id,
        type: `Circuit: ${circuit.name}`,
        status: "verified",
        chain: "ethereum",
        proofHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
        verificationTime: Math.random() * 2 + 0.5,
        gasUsed: Math.floor(Math.random() * 200000) + 100000,
        details: {
          inputs: circuit.nodes.length,
          constraints: circuit.nodes.length * 1024,
        },
      });

      broadcast("circuit:execution:complete", { circuitId: circuit.id, executionId, proof });

      res.json({
        executionId,
        circuitId: circuit.id,
        proof,
        success: true,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to execute circuit" });
    }
  });

  // Generate circuit code
  app.get("/api/circuits/:id/code", async (req, res) => {
    try {
      const circuit = await storage.getCircuit(req.params.id);
      if (!circuit) {
        return res.status(404).json({ error: "Circuit not found" });
      }

      const code = `// Encrypt Circuit - ${circuit.name}
// Generated ZK Circuit Definition

circuit ${circuit.name.replace(/\s+/g, "")} {
${circuit.nodes.map((node, i) => `  // Module ${i + 1}: ${node.name}
  component ${node.name.toLowerCase().replace(/\s+/g, "_")} = ${node.type.toUpperCase()}_MODULE();
  ${node.inputs?.map((inp) => `signal input ${inp};`).join("\n  ") || ""}
  ${node.outputs?.map((out) => `signal output ${out};`).join("\n  ") || ""}`).join("\n\n")}
}`;

      res.json({ code });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate code" });
    }
  });

  return httpServer;
}
