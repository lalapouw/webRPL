import "./admin.css";
import AdminSidebar from "./sidebar";
import AdminNavbar from "@/components/Navbar/AdminNavbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <div className="main-section">
        <AdminNavbar />
        <div className="dashboard-content">{children}</div>
      </div>
    </div>
  );
}
