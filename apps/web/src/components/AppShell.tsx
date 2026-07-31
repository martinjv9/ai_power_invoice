import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { cn } from "@/lib/utils";

// Placeholder items become real links as their phases land (Documents: Phase 3).
const NAV_ITEMS = [
  { to: "/", label: "Dashboard", enabled: true },
  { to: "/clients", label: "Clients", enabled: true },
  { to: "/documents", label: "Documents", enabled: false },
];

export default function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
      <aside className="flex w-56 flex-col border-r border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 px-4 py-4 text-sm font-semibold">
          Invoice System
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {NAV_ITEMS.map((item) =>
            item.enabled ? (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "block rounded-md px-3 py-2 text-sm",
                    isActive
                      ? "bg-neutral-900 font-medium text-white"
                      : "text-neutral-700 hover:bg-neutral-100",
                  )
                }
              >
                {item.label}
              </NavLink>
            ) : (
              <span
                key={item.to}
                className="block cursor-not-allowed rounded-md px-3 py-2 text-sm text-neutral-300"
                title="Coming in a later phase"
              >
                {item.label}
              </span>
            ),
          )}
        </nav>
        <div className="border-t border-neutral-200 p-3">
          <p className="truncate px-1 text-xs text-neutral-500" title={user?.email}>
            {user?.name} · {user?.email}
          </p>
          <button
            onClick={() => void logout()}
            className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
