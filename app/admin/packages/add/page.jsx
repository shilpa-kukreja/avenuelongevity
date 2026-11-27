import AdminShell from "../../../../components/admin/AdminShell";
import PackageForm from "../../../../components/admin/packages/PackageForm";

export default function AddPackagePage() {
  return <AdminShell activeTab="packages"><PackageForm /></AdminShell>;
}