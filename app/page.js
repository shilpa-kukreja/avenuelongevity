import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import BrandIntro from "../components/BrandIntro";
import Services from "@/components/Services";
import Memberships from "@/components/Memberships";
import RecoveryTech from "@/components/RecoveryTech";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1A1A1A]">
      <Navbar />
      <Hero />
      <BrandIntro />
      <Services/>
      <Memberships/>
      <RecoveryTech/>
      <Testimonials/>
     <Footer/>
    </main>
  );
}