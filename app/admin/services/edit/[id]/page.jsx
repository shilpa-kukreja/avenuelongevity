
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  Suspense,
} from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import ServiceFormPage from "../../../../../components/admin/ServiceFormModal";
import { servicesApi } from "../../../../lib/adminApi";

function EditServiceContent() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchService = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setLoadError("");

    try {
      const res = await servicesApi.getById(id);
      setService(res.data);
    } catch (err) {
      setLoadError(err.message || "Failed to load service");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);

    try {
      await servicesApi.update(id, payload);
      router.push("/admin/services?updated=1");
    } catch (err) {
      setSubmitting(false);
      throw err;
    }
  };

  // Loading state
  if (loading) {
    return (
      <AdminShell
        activeTab="services"
        title="Edit Service"
        subtitle="Loading service details…"
      >
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2
              size={28}
              className="text-[#C9944A] animate-spin"
            />
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">
              Loading service…
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  // Error state
  if (loadError || !service) {
    return (
      <AdminShell
        activeTab="services"
        title="Edit Service"
        subtitle="Could not load service."
      >
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={26} className="text-red-400" />
            </div>

            <h2 className="font-serif text-2xl text-white font-light mb-2">
              Couldn&apos;t load service
            </h2>

            <p className="text-white/50 text-sm mb-6">
              {loadError || "Service not found"}
            </p>

            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => router.push("/admin/services")}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-[10px] uppercase tracking-[0.25em] text-white/60 hover:text-white border border-white/15 hover:border-white/30 transition-colors"
              >
                <ArrowLeft size={14} />
                Back
              </button>

              <button
                type="button"
                onClick={fetchService}
                className="px-6 py-3 rounded-full bg-[#C9944A] text-[#080906] text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-[#E3D9C9] transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      activeTab="services"
      title="Edit Service"
      subtitle={`Editing: ${service.title}`}
    >
      <div className="max-w-[1500px] mx-auto">
        <ServiceFormPage
          mode="edit"
          initialService={service}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </div>
    </AdminShell>
  );
}

export default function EditServicePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2
            size={28}
            className="text-[#C9944A] animate-spin"
          />
        </div>
      }
    >
      <EditServiceContent />
    </Suspense>
  );
}
