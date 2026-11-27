import AdminShell from "../../../components/admin/AdminShell";
import PackagesListAdmin from "../../../components/admin/packages/PackagesListAdmin";

export default function PackagesPage() {
  return <AdminShell activeTab="packages"><PackagesListAdmin /></AdminShell>;
}