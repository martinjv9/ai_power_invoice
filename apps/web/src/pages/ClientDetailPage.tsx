import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import type { CreateProjectInput, ProjectResponse, ProjectStatus } from "@invoice/shared";
import { useClient, useClientProjects, useCreateProject, useUpdateProject } from "@/clients/api";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Active",
  completed: "Completed",
  on_hold: "On hold",
};

const STATUS_STYLES: Record<ProjectStatus, string> = {
  active: "border-green-300 bg-green-50 text-green-700",
  completed: "border-neutral-300 bg-neutral-100 text-neutral-600",
  on_hold: "border-amber-300 bg-amber-50 text-amber-700",
};

export default function ClientDetailPage() {
  const { id } = useParams() as { id: string };
  const { data: client, isPending, isError } = useClient(id);
  const { data: projects } = useClientProjects(id);
  const [showNewProject, setShowNewProject] = useState(false);

  if (isPending) return <p className="text-sm text-neutral-400">Loading…</p>;
  if (isError || !client) return <p className="text-sm text-red-600">Client not found.</p>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{client.name}</h1>
        <Link
          to={`/clients/${id}/edit`}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
        >
          Edit client
        </Link>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 rounded-lg border border-neutral-200 bg-white p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase text-neutral-400">Contact person</dt>
          <dd className="mt-0.5">{client.contactPerson}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-neutral-400">Email</dt>
          <dd className="mt-0.5">{client.email}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-neutral-400">Phone</dt>
          <dd className="mt-0.5">{client.phone ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-neutral-400">Billing address</dt>
          <dd className="mt-0.5 whitespace-pre-line">{client.billingAddress}</dd>
        </div>
      </dl>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Projects</h2>
        <button
          onClick={() => setShowNewProject((v) => !v)}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          {showNewProject ? "Close" : "Add project"}
        </button>
      </div>

      {showNewProject && (
        <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-5">
          <ProjectForm clientId={id} onDone={() => setShowNewProject(false)} />
        </div>
      )}

      <ul className="mt-4 space-y-3">
        {projects?.length === 0 && !showNewProject && (
          <li className="rounded-lg border border-dashed border-neutral-300 p-5 text-sm text-neutral-400">
            No projects yet — each project gets its own job-site address.
          </li>
        )}
        {projects?.map((project) => (
          <ProjectCard key={project.id} clientId={id} project={project} />
        ))}
      </ul>
    </div>
  );
}

function ProjectCard({ clientId, project }: { clientId: string; project: ProjectResponse }) {
  const [editing, setEditing] = useState(false);

  return (
    <li className="rounded-lg border border-neutral-200 bg-white p-5">
      {editing ? (
        <ProjectForm clientId={clientId} project={project} onDone={() => setEditing(false)} />
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium">{project.description}</p>
            <p className="mt-1 text-sm text-neutral-500">Job site: {project.jobSiteAddress}</p>
            {project.notes && <p className="mt-1 text-sm text-neutral-400">{project.notes}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs",
                STATUS_STYLES[project.status],
              )}
            >
              {STATUS_LABELS[project.status]}
            </span>
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-neutral-500 underline-offset-2 hover:underline"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

// Create + edit in one form; `project` present = edit.
function ProjectForm({
  clientId,
  project,
  onDone,
}: {
  clientId: string;
  project?: ProjectResponse;
  onDone: () => void;
}) {
  const [form, setForm] = useState<Required<CreateProjectInput>>({
    description: project?.description ?? "",
    jobSiteAddress: project?.jobSiteAddress ?? "",
    status: project?.status ?? "active",
    notes: project?.notes ?? "",
  });
  const createProject = useCreateProject(clientId);
  const updateProject = useUpdateProject(clientId, project?.id ?? "");
  const mutation = project ? updateProject : createProject;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await mutation.mutateAsync({ ...form, notes: form.notes || undefined });
    onDone();
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm font-medium">
        Description
        <input
          required
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className={inputClass}
        />
      </label>
      <label className="block text-sm font-medium">
        Job-site address
        <textarea
          required
          rows={2}
          value={form.jobSiteAddress}
          onChange={(e) => setForm((f) => ({ ...f, jobSiteAddress: e.target.value }))}
          className={inputClass}
        />
      </label>
      <div className="flex gap-4">
        <label className="block flex-1 text-sm font-medium">
          Status
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProjectStatus }))}
            className={inputClass}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block flex-1 text-sm font-medium">
          Notes <span className="font-normal text-neutral-400">(optional)</span>
          <input
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className={inputClass}
          />
        </label>
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-600">Saving failed — check the fields and try again.</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {mutation.isPending ? "Saving…" : project ? "Save project" : "Add project"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
