import React, { Suspense } from "react";
import AdminShell from "../../../../../components/admin/AdminShell";
import MembershipForm from "../../../../../components/admin/memberships/MembershipForm";

export const instant = false;

export default async function EditMembershipPage({ params }) {
  const resolvedParams = await params;
  const id = Array.isArray(resolvedParams?.id)
    ? resolvedParams.id[0]
    : resolvedParams?.id;

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080906]" />}>
      <AdminShell
        activeTab="memberships"
        title="Edit Membership Plan"
        subtitle="Update pricing, perks, and availability."
      >
        <MembershipForm membershipId={id} />
      </AdminShell>
    </Suspense>
  );
}