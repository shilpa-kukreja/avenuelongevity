import AuthForm from "../../components/AuthForm";

export const metadata = {
  title: "Login | Avenue Longevity Retreat",
  description: "Access your sanctuary dashboard.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#080906]">
      <AuthForm />
    </main>
  );
}