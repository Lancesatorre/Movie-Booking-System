import { Navigate, Outlet } from "react-router-dom";

const ProtectedAdminRoute = () => {
  const stored = localStorage.getItem("mobook_user");
  const userType = localStorage.getItem("userType");

  let admin = null;
  try {
    admin = stored ? JSON.parse(stored) : null;
  } catch {
    admin = null;
  }

  // Check if admin is logged in and userType is admin
  if (!admin || userType !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedAdminRoute;
