import React, { Suspense } from "react";
import AdminShell from "@/components/admin/AdminShell";
import ServicesAdmin from "@/components/admin/ServicesAdmin";

export const metadata = {
  title: "Manage Services | Admin",
};

export default function AdminServicesPage() {
  return (
    <AdminShell
      activeTab="services"
      title="Manage Services"
      subtitle="Add, edit and manage the rituals in your catalog."
    >
      <div className="max-w-[1500px] mx-auto">
        <Suspense
          fallback={<div className="text-white/40 text-center py-10">Loading…</div>}
        >
          <ServicesAdmin />
        </Suspense>
      </div>
    </AdminShell>
  );
}