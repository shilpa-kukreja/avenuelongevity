import AdminShell from "../../../components/admin/AdminShell";
import BookingsAdmin from "../../../components/admin/BookingsAdmin";

export const metadata = {
  title: "Bookings | Admin Command",
};

export default function BookingsPage() {
  return (
    <main className="min-h-screen bg-[#080906]">
      <AdminShell activeTab="bookings">
        <BookingsAdmin />
      </AdminShell>
    </main>
  );
}