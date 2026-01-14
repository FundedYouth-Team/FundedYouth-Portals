import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";
import { isAdmin } from "lib/roles";
import { supabase } from "lib/supabaseClient";

interface DashboardStats {
  totalUsers: number;
  usersWithBilling: number;
  totalVps: number;
  runningVps: number;
  totalAdmins: number;
  totalManagers: number;
}

export function DashboardPage() {
  const { user, role } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    usersWithBilling: 0,
    totalVps: 0,
    runningVps: 0,
    totalAdmins: 0,
    totalManagers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch user counts from billing_customers
        const { count: billingCount } = await supabase
          .from("billing_customers")
          .select("*", { count: "exact", head: true });

        const { count: stripeConnectedCount } = await supabase
          .from("billing_customers")
          .select("*", { count: "exact", head: true })
          .not("stripe_customer_id", "is", null);

        // Fetch VPS counts
        const { count: vpsCount } = await supabase
          .from("vps_instances")
          .select("*", { count: "exact", head: true });

        const { count: runningVpsCount } = await supabase
          .from("vps_instances")
          .select("*", { count: "exact", head: true })
          .eq("status", "running");

        setStats({
          totalUsers: billingCount || 0,
          usersWithBilling: stripeConnectedCount || 0,
          totalVps: vpsCount || 0,
          runningVps: runningVpsCount || 0,
          totalAdmins: 0, // Would need Edge Function to count by role
          totalManagers: 0,
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Welcome, {user?.email}
        </h2>
        <p className="text-gray-600">
          You are logged in as{" "}
          <span className="font-medium capitalize">{role}</span>.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/users"
          className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
        >
          <h3 className="mb-2 text-lg font-semibold text-gray-800">Users</h3>
          <p className="text-sm text-gray-600">
            View and manage user accounts.
          </p>
          {loading ? (
            <div className="mt-4 h-8 w-16 animate-pulse rounded bg-gray-200"></div>
          ) : (
            <>
              <p className="mt-4 text-2xl font-bold text-gray-900">
                {stats.totalUsers}
              </p>
              <p className="text-xs text-gray-500">
                {stats.usersWithBilling} with Stripe
              </p>
            </>
          )}
        </Link>

        <Link
          to="/vps"
          className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
        >
          <h3 className="mb-2 text-lg font-semibold text-gray-800">
            VPS Instances
          </h3>
          <p className="text-sm text-gray-600">Manage VPS assignments.</p>
          {loading ? (
            <div className="mt-4 h-8 w-16 animate-pulse rounded bg-gray-200"></div>
          ) : (
            <>
              <p className="mt-4 text-2xl font-bold text-gray-900">
                {stats.totalVps}
              </p>
              <p className="text-xs text-gray-500">
                {stats.runningVps} running
              </p>
            </>
          )}
        </Link>

        {isAdmin(role) && (
          <Link
            to="/roles"
            className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
          >
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              Role Management
            </h3>
            <p className="text-sm text-gray-600">
              Assign and revoke user roles.
            </p>
            <p className="mt-4 text-2xl font-bold text-gray-900">Admin Only</p>
            <p className="text-xs text-gray-500">Manage user permissions</p>
          </Link>
        )}
      </div>
    </div>
  );
}
