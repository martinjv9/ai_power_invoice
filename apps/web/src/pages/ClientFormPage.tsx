import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { CreateClientInput } from "@invoice/shared";
import { useClient, useCreateClient, useUpdateClient } from "@/clients/api";

const EMPTY: CreateClientInput = {
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  billingAddress: "",
};

// One page for both create (/clients/new) and edit (/clients/:id/edit) — the
// presence of :id decides which.
export default function ClientFormPage() {
  const { id } = useParams();
  return id ? <EditClient id={id} /> : <ClientForm />;
}

// Edit needs the existing client loaded before the form can render with
// initial values; split out so hooks stay unconditional.
function EditClient({ id }: { id: string }) {
  const { data: client, isPending } = useClient(id);
  if (isPending || !client) return <p className="text-sm text-neutral-400">Loading…</p>;
  return <ClientForm id={id} initial={{ ...client, phone: client.phone ?? "" }} />;
}

function ClientForm({ id, initial }: { id?: string; initial?: CreateClientInput }) {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateClientInput>(initial ?? EMPTY);
  const createClient = useCreateClient();
  const updateClient = useUpdateClient(id ?? "");
  const mutation = id ? updateClient : createClient;

  function set<K extends keyof CreateClientInput>(key: K, value: CreateClientInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    // Optional field: send undefined, not "", so the API stores NULL.
    const payload = { ...form, phone: form.phone || undefined };
    const saved = await mutation.mutateAsync(payload);
    navigate(`/clients/${saved.id}`);
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold">{id ? "Edit client" : "New client"}</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium">
          Company / client name
          <input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Contact person
          <input
            required
            value={form.contactPerson}
            onChange={(e) => set("contactPerson", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Phone <span className="font-normal text-neutral-400">(optional)</span>
          <input
            value={form.phone ?? ""}
            onChange={(e) => set("phone", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Billing address
          <textarea
            required
            rows={3}
            value={form.billingAddress}
            onChange={(e) => set("billingAddress", e.target.value)}
            className={inputClass}
          />
        </label>

        {mutation.isError && (
          <p className="text-sm text-red-600">Saving failed — check the fields and try again.</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            {mutation.isPending ? "Saving…" : id ? "Save changes" : "Create client"}
          </button>
          <Link
            to={id ? `/clients/${id}` : "/clients"}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
