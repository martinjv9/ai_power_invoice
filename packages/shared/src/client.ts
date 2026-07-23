import { z } from "zod";

// Example of the DTO pattern we'll use everywhere (see phase-guides/app-2 + the
// DTO discussion). The Prisma DB model stays in `api`; only these safe shapes
// cross to the frontend.

// Input DTO — what the frontend is allowed to send when creating a client.
export const createClientSchema = z.object({
  name: z.string().min(1),
  contactPerson: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  billingAddress: z.string().min(1),
});
export type CreateClientInput = z.infer<typeof createClientSchema>;

// Output DTO — the safe public shape the backend returns (no internal fields).
export const clientResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  contactPerson: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  billingAddress: z.string(),
});
export type ClientResponse = z.infer<typeof clientResponseSchema>;
