import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PackagesClient from "@/components/PackagesClient";

export const metadata = {
  title: "Packages & Memberships | Avenue Longevity Retreat",
  description: "Save more, ritual more. Session bundles and monthly memberships for every rhythm of wellness.",
};

export default function PackagesPage() {
  return (
    <main className="min-h-screen bg-[#080906]">
      <Navbar />
      <PackagesClient />
      <Footer />
    </main>
  );
}