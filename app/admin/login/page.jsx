import AdminLogin from "../../../components/AdminLogin";

export const metadata = {
  title: "Admin Login | Avenue Longevity Retreat",
  description: "Secure admin access.",
};

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-[#080906]">
      <AdminLogin />
    </main>
  );
}