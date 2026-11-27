import React, { Suspense } from "react";
import AdminShell from "../../../../../components/admin/AdminShell";
import PackageForm from "../../../../../components/admin/packages/PackageForm";

export const instant = false;

export default async function EditPackagePage({ params }) {
  const resolvedParams = await params;
  const id = Array.isArray(resolvedParams?.id)
    ? resolvedParams.id[0]
    : resolvedParams?.id;

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080906]" />}>
      <AdminShell
        activeTab="packages"
        title="Edit Package"
        subtitle="Update package sessions, pricing, and validity."
      >
        <PackageForm packageId={id} />
      </AdminShell>
    </Suspense>
  );
}