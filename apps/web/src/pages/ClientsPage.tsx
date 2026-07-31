import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClients } from "@/clients/api";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const { data: clients, isPending, isError } = useClients(search);
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <Link
          to="/clients/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          New client
        </Link>
      </div>

      <input
        type="search"
        placeholder="Search by name or contact person…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-4 w-full max-w-md rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
      />

      <div className="mt-4 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
            </tr>
          </thead>
          <tbody>
            {isPending && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-neutral-400">
                  Loading…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-red-600">
                  Couldn't load clients.
                </td>
              </tr>
            )}
            {clients?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-neutral-400">
                  {search ? "No clients match your search." : "No clients yet — add the first one."}
                </td>
              </tr>
            )}
            {clients?.map((client) => (
              <tr
                key={client.id}
                onClick={() => navigate(`/clients/${client.id}`)}
                className="cursor-pointer border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
              >
                <td className="px-4 py-3 font-medium">{client.name}</td>
                <td className="px-4 py-3">{client.contactPerson}</td>
                <td className="px-4 py-3 text-neutral-500">{client.email}</td>
                <td className="px-4 py-3 text-neutral-500">{client.phone ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
