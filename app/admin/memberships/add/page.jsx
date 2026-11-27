import AdminShell from "../../../../components/admin/AdminShell";
import MembershipForm from "../../../../components/admin/memberships/MembershipForm";

export default function AddMembershipPage() {
  return <AdminShell activeTab="memberships"><MembershipForm /></AdminShell>;
}