import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LegalLayout from "../../components/LegalLayout";

const termsData = [
  { title: "1. Agreement to Terms", content: ["By accessing Avenue Longevity Retreat, you agree to be bound by these Terms of Service. If you do not agree, please refrain from using our facilities."] },
  { title: "2. Booking & Payments", content: ["All bookings are subject to availability. Payments must be completed at the time of booking to secure your reservation. We use secure third-party processors (Razorpay) and do not store your credit card information."] },
  { title: "3. Health & Safety", content: ["Guests with pre-existing medical conditions (heart conditions, pregnancy, high blood pressure) must consult a physician before using heat, cold, or recovery technologies. Our staff reserve the right to refuse service if safety is compromised."] },
  { title: "4. Conduct in the Sanctuary", content: ["We maintain a quiet, serene environment. Please keep noise to a minimum. Mobile phones must be on silent in all relaxation areas. Photography is strictly prohibited in private suites."] },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#080906]">
      <Navbar />
      <LegalLayout title="Terms of Service" lastUpdated="November 2026" sections={termsData} />
      <Footer />
    </main>
  );
}