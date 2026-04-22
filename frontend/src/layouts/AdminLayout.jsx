import AdminNavbar from "../components/AdminNavbar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div>
      <AdminNavbar />
      <div className="p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
