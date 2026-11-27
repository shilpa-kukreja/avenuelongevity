import Navbar from "../../components/Navbar";
import ContactSection from "../../components/ContactSection";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Contact Us | Avenue Longevity Retreat",
  description: "Get in touch with our concierge team.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#080906]">
      <Navbar />
      <ContactSection />
      <Footer />
    </main>
  );
}