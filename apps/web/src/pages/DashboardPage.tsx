import { useAuth } from "@/auth/AuthContext";
import HealthBadge from "@/components/HealthBadge";

// Empty on purpose — real content (outstanding balances, overdue invoices,
// recent activity) arrives in App Phase 6.
export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">Welcome back, {user?.name}.</p>
      <div className="mt-6">
        <HealthBadge />
      </div>
    </div>
  );
}
