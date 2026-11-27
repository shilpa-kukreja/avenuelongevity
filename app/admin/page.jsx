import AdminDashboard from "../../components/AdminDashboard";
import AdminGuard from "../../components/AdminGuard";

export const metadata = {
  title: "Admin Command Center | Avenue Longevity Retreat",
  description: "Manage bookings, customers, and revenue.",
};

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#080906]">
      <AdminGuard>
        <AdminDashboard />
      </AdminGuard>
    </main>
  );
}