import Navbar from "../../components/Navbar";
import Dashboard from "../../components/Dashboard";

export const metadata = {
  title: "Member Dashboard | Avenue Longevity Retreat",
  description: "Manage your wellness journey.",
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#080906]">
      <Navbar />
      <Dashboard />
    </main>
  );
}