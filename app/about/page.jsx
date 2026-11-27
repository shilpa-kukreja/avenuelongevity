import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutClient from "@/components/AboutClient";

export const metadata = {
  title: "Our Story | Avenue Longevity Retreat",
  description: "The origin, philosophy and people behind Avenue — Mumbai's quiet sanctuary for recovery, ritual and rest.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#080906]">
      <Navbar />
      <AboutClient />
      <Footer />
    </main>
  );
}