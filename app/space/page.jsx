import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SpaceClient from "@/components/SpaceClient";

export const metadata = {
  title: "Our Space | Avenue Longevity Retreat",
  description: "Step inside our studio — hand-crafted interiors, meticulous hygiene, and thoughtful amenities.",
};

export default function SpacePage() {
  return (
    <main className="min-h-screen bg-[#080906]">
      <Navbar />
      <SpaceClient />
      <Footer />
    </main>
  );
}