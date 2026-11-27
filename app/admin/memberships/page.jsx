import AdminShell from "../../../components/admin/AdminShell";
import MembershipsListAdmin from "../../../components/admin/memberships/MembershipsListAdmin";

export default function MembershipsPage() {
  return <AdminShell activeTab="memberships"><MembershipsListAdmin /></AdminShell>;
}