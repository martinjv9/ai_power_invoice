import { z } from "zod";

export const projectStatusSchema = z.enum(["active", "completed", "on_hold"]);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

// Input DTO — creating a project under a client (the client id comes from the
// URL, not the body; created_by comes from the session).
export const createProjectSchema = z.object({
  description: z.string().min(1),
  jobSiteAddress: z.string().min(1),
  status: projectStatusSchema.optional(),
  notes: z.string().optional(),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial();
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// Output DTO — the safe public shape of a project.
export const projectResponseSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  description: z.string(),
  status: projectStatusSchema,
  notes: z.string().nullable(),
  jobSiteAddress: z.string(),
  createdById: z.string(),
  createdAt: z.string(), // ISO timestamp
});
export type ProjectResponse = z.infer<typeof projectResponseSchema>;
