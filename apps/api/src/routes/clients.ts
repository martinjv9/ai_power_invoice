import { Router } from "express";
import type { Client } from "@prisma/client";
import { createClientSchema, updateClientSchema, type ClientResponse } from "@invoice/shared";
import { prisma } from "../lib/prisma";
import { projectsRouter } from "./projects";

// DB row → safe public DTO. Explicit field-by-field (never a spread) so a new
// column can't leak to the frontend by default.
export function toClientResponse(client: Client): ClientResponse {
  return {
    id: client.id,
    name: client.name,
    contactPerson: client.contactPerson,
    email: client.email,
    phone: client.phone,
    billingAddress: client.billingAddress,
  };
}

export const clientsRouter = Router();

// Projects live under their client: /clients/:clientId/projects
clientsRouter.use("/:clientId/projects", projectsRouter);

// List, with basic name/contact search (?search=...). Contains-matching is
// enough for Phase 2; Phase 7 upgrades this to proper full-text/trigram search.
clientsRouter.get("/", async (req, res, next) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const clients = await prisma.client.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { contactPerson: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { name: "asc" },
    });
    res.json(clients.map(toClientResponse));
  } catch (err) {
    next(err);
  }
});

clientsRouter.post("/", async (req, res, next) => {
  try {
    const parsed = createClientSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
      return;
    }
    const client = await prisma.client.create({ data: parsed.data });
    res.status(201).json(toClientResponse(client));
  } catch (err) {
    next(err);
  }
});

clientsRouter.get("/:id", async (req, res, next) => {
  try {
    const client = await prisma.client.findUnique({ where: { id: req.params.id } });
    if (!client) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
    res.json(toClientResponse(client));
  } catch (err) {
    next(err);
  }
});

clientsRouter.patch("/:id", async (req, res, next) => {
  try {
    const parsed = updateClientSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
      return;
    }
    const existing = await prisma.client.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json(toClientResponse(client));
  } catch (err) {
    next(err);
  }
});

// No DELETE on purpose: documents (Phase 3) will reference clients, and the
// right deletion/archival policy is decided once those exist.
