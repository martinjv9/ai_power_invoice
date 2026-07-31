// Client/project data hooks — the one place the clients UI talks to the
// backend. Query keys: ["clients", search] for lists, ["clients", id] for one,
// ["clients", id, "projects"] for its projects; mutations invalidate
// ["clients"] so every dependent view refetches.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ClientResponse,
  CreateClientInput,
  UpdateClientInput,
  ProjectResponse,
  CreateProjectInput,
  UpdateProjectInput,
} from "@invoice/shared";
import { api } from "@/lib/api";

export function useClients(search: string) {
  return useQuery({
    queryKey: ["clients", { search }],
    queryFn: () =>
      api<ClientResponse[]>(`/clients${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: () => api<ClientResponse>(`/clients/${id}`),
  });
}

export function useClientProjects(clientId: string) {
  return useQuery({
    queryKey: ["clients", clientId, "projects"],
    queryFn: () => api<ProjectResponse[]>(`/clients/${clientId}/projects`),
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClientInput) =>
      api<ClientResponse>("/clients", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useUpdateClient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateClientInput) =>
      api<ClientResponse>(`/clients/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useCreateProject(clientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) =>
      api<ProjectResponse>(`/clients/${clientId}/projects`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients", clientId, "projects"] }),
  });
}

export function useUpdateProject(clientId: string, projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProjectInput) =>
      api<ProjectResponse>(`/clients/${clientId}/projects/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients", clientId, "projects"] }),
  });
}
