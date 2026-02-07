import express from "express";
import { generateAnswer } from "../services/ollamaClient.js";
import { listTenants, retrieveForTenant, getTenant } from "../services/tenantStore.js";

export const chatRouter = express.Router();

chatRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

chatRouter.get("/tenants", (_req, res) => {
  res.json({ tenants: listTenants() });
});

chatRouter.post("/chat", async (req, res) => {
  const tenantId = req.header("x-tenant-id") || req.body.tenantId;
  const message = req.body.message?.trim();
  const history = Array.isArray(req.body.history) ? req.body.history.slice(-6) : [];

  if (!tenantId) {
    return res.status(400).json({ error: "tenantId is required." });
  }

  if (!message) {
    return res.status(400).json({ error: "message is required." });
  }

  if (message.length > 2000) {
    return res.status(400).json({ error: "message exceeds 2000 characters." });
  }

  const tenant = getTenant(tenantId);
  if (!tenant) {
    return res.status(404).json({ error: `Unknown tenant '${tenantId}'.` });
  }

  const retrievedChunks = retrieveForTenant(tenantId, message, 3);
  const context = retrievedChunks
    .map((chunk, idx) => `[${idx + 1}] ${chunk.content}`)
    .join("\n\n");

  const answer = await generateAnswer({
    tenantName: tenant.name,
    question: message,
    history,
    context
  });

  return res.json({
    tenantId,
    answer,
    context: retrievedChunks.map(({ id, content, score }) => ({ id, content, score })),
    citations: retrievedChunks.map(({ id, score }) => ({ id, score }))
  });
});
