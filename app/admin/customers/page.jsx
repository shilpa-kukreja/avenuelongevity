import AdminShell from "../../../components/admin/AdminShell";
import CustomersAdmin from "../../../components/admin/CustomersAdmin";

export const metadata = {
  title: "Customers | Admin Command",
};

export default function CustomersPage() {
  return (
    <AdminShell activeTab="customers">
      <CustomersAdmin />
    </AdminShell>
  );
}