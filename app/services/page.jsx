import Navbar from "../../components/Navbar";
import ServicesHero from "../../components/ServicesHero";
import CategoryMarquee from "../../components/CategoryMarquee";
import InteractiveServices from "@/components/InteractiveServices";
import BookSteps from "@/components/BookSteps";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Rituals & Therapies | Avenue Longevity Retreat",
  description: "Explore our heat, cold, and advanced recovery tech services.",
};

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#080906]">
      <Navbar />
      <ServicesHero />
      <CategoryMarquee />
      <InteractiveServices />
      <BookSteps />
      <Footer />
    </main>
  );
}