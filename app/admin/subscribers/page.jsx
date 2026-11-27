import AdminShell from "../../../components/admin/AdminShell";
import SubscribersAdmin from "../../../components/admin/SubscribersAdmin";

export const metadata = {
  title: "Subscribers | Admin Command",
};

export default function SubscribersPage() {
  return (
    <AdminShell activeTab="subscribers">
      <SubscribersAdmin />
    </AdminShell>
  );
}