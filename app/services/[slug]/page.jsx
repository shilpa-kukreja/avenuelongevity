import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceDetailClient from "@/components/ServiceDetailClient";

const servicesMeta = {
  sauna:            { title: "Finnish Sauna",         desc: "A private heat session paired with cold plunge — the original hot–cold ritual." },
  "cold-plunge":    { title: "Cold Plunge",           desc: "Guided cold-water immersion for mental clarity, recovery and resilience." },
  "ceragem-massage":{ title: "Ceragem Massage Bed",   desc: "Automated thermal massage with heated jade rollers for spinal relief." },
  "turkish-hammam": { title: "Turkish Hammam",        desc: "A traditional bathing ritual — steam, scrub, foam wash and deep rest." },
  "thz-teta-p90":   { title: "THz Teta-P90 Plus",     desc: "Advanced terahertz wellness system for deep cellular recovery." },
  "pelvic-chair":   { title: "Pelvic Chair",          desc: "Discreet pelvic floor therapy — fully clothed, fully private." },
  "body-massage":   { title: "Body Massage",          desc: "Therapist-led massage in a private suite — 30, 60 or 90 minutes." },
  "exopod-infrared":{ title: "Exopod Infrared Bed",   desc: "An enclosed infrared pod for a quiet, private warmth session." },
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const meta = servicesMeta[slug] || servicesMeta.sauna;
  return {
    title: `${meta.title} | Avenue Longevity Retreat`,
    description: meta.desc,
  };
}

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  return (
    <main className="min-h-screen bg-[#080906]">
      <Navbar />
      <ServiceDetailClient slug={slug} />
      <Footer />
    </main>
  );
}