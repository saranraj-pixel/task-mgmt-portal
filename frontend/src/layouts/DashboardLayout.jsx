import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <>
      <Navbar />

      <div className="p-6">
        <Outlet />
      </div>
    </>
  );
}

export default DashboardLayout;
