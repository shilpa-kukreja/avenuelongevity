import Navbar from "../../components/Navbar";
import CheckoutClient from "../../components/CheckoutClient";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Secure Checkout | Avenue Longevity Retreat",
  description: "Complete your purchase of premium packages and memberships.",
};

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[#080906]">
      <Navbar />
      <CheckoutClient />
      <Footer />
    </main>
  );
}