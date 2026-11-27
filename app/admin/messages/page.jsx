import AdminShell from "../../../components/admin/AdminShell";
import MessagesAdmin from "../../../components/admin/MessagesAdmin";

export const metadata = {
  title: "Messages | Admin Command",
};

export default function MessagesPage() {
  return (
    <AdminShell activeTab="messages">
      <MessagesAdmin />
    </AdminShell>
  );
}