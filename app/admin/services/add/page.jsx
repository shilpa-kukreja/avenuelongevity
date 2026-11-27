"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import ServiceFormPage from "../../../../components/admin/ServiceFormModal";
import { servicesApi } from "../../../lib/adminApi";

export default function AddServicePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      await servicesApi.create(payload);
      router.push("/admin/services?created=1");
    } catch (err) {
      setSubmitting(false);
      throw err;
    }
  };

  return (
    <AdminShell
      activeTab="services"
      title="Services"
      subtitle="Create a new service in your catalog."
    >
      <div className="max-w-[1500px] mx-auto">
        <ServiceFormPage
          mode="add"
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </div>
    </AdminShell>
  );
}