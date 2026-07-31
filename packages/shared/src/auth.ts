import { z } from "zod";

// Input DTO — login credentials. min(1) not min(8): password *rules* apply at
// account creation; at login we just check "did you type something".
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

// Output DTO — the safe public shape of a logged-in user. Never includes
// passwordHash (or anything else the frontend has no business seeing).
export const userResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
});
export type UserResponse = z.infer<typeof userResponseSchema>;
