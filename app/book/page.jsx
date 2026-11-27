import Navbar from "../../components/Navbar";
import BookingWizard from "../../components/BookingWizard";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Book a Session | Avenue Longevity Retreat",
  description: "Reserve your wellness experience.",
};

export default function BookPage() {
  return (
    <main className="min-h-screen bg-[#080906]">
      <Navbar />
      <BookingWizard />
      <Footer />
    </main>
  );
}