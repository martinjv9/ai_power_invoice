import { Router } from "express";
import type { Project } from "@prisma/client";
import { createProjectSchema, updateProjectSchema, type ProjectResponse } from "@invoice/shared";
import { prisma } from "../lib/prisma";

export function toProjectResponse(project: Project): ProjectResponse {
  return {
    id: project.id,
    clientId: project.clientId,
    description: project.description,
    status: project.status,
    notes: project.notes,
    jobSiteAddress: project.jobSiteAddress,
    createdById: project.createdById,
    createdAt: project.createdAt.toISOString(),
  };
}

// mergeParams so :clientId from the parent /clients/:clientId mount is visible.
export const projectsRouter = Router({ mergeParams: true });

// Every route needs the parent client to exist — resolve it once here.
projectsRouter.use(async (req, res, next) => {
  try {
    const clientId = (req.params as { clientId: string }).clientId;
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
    res.locals.clientId = clientId;
    next();
  } catch (err) {
    next(err);
  }
});

projectsRouter.get("/", async (_req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { clientId: res.locals.clientId },
      orderBy: { createdAt: "desc" },
    });
    res.json(projects.map(toProjectResponse));
  } catch (err) {
    next(err);
  }
});

projectsRouter.post("/", async (req, res, next) => {
  try {
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
      return;
    }
    const project = await prisma.project.create({
      data: {
        ...parsed.data,
        clientId: res.locals.clientId,
        // Accountability: who created this is the logged-in user, never
        // something the client gets to claim in the body.
        createdById: req.session.userId!,
      },
    });
    res.status(201).json(toProjectResponse(project));
  } catch (err) {
    next(err);
  }
});

projectsRouter.patch("/:id", async (req, res, next) => {
  try {
    const parsed = updateProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
      return;
    }
    // Scoped to the client from the URL so a project can't be edited through
    // some other client's path.
    const existing = await prisma.project.findFirst({
      where: { id: req.params.id, clientId: res.locals.clientId },
    });
    if (!existing) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const project = await prisma.project.update({
      where: { id: existing.id },
      data: parsed.data,
    });
    res.json(toProjectResponse(project));
  } catch (err) {
    next(err);
  }
});
