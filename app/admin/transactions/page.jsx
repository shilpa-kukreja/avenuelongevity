import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import AdminShell from "../../../components/admin/AdminShell";
import TransactionsAdmin from "../../../components/admin/TransactionsAdmin";

export const instant = false;

export const metadata = {
  title: "Transactions | Admin Command",
};

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080906] flex items-center justify-center text-white/40">
          <Loader2 className="animate-spin text-[#C9944A]" />
        </div>
      }
    >
      <AdminShell
        activeTab="transactions"
        title="Transactions"
        subtitle="Track package and membership payments, discounts, and receipts."
      >
        <TransactionsAdmin />
      </AdminShell>
    </Suspense>
  );
}