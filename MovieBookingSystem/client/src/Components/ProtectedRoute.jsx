import { Navigate, Outlet } from "react-router-dom";

// Admin Only Route - Blocks regular users from accessing admin pages
const ProtectedAdminRoute = () => {
  const stored = localStorage.getItem("mobook_user");
  const userType = localStorage.getItem("userType");

  let admin = null;
  try {
    admin = stored ? JSON.parse(stored) : null;
  } catch {
    admin = null;
  }

  // CASE 1: Not logged in at all → Send to login
  if (!admin) {
    return <Navigate to="/" replace />;
  }

  // CASE 2: Logged in but NOT an admin → Send back to user home
  if (userType !== "admin") {
    return <Navigate to="/Home" replace />;
  }

  // CASE 3: Is admin → Allow access
  return <Outlet />;
};

// User Only Route - Blocks admins from accessing user pages
const ProtectedUserRoute = () => {
  const stored = localStorage.getItem("mobook_user");
  const userType = localStorage.getItem("userType");

  let user = null;
  try {
    user = stored ? JSON.parse(stored) : null;
  } catch {
    user = null;
  }

  // CASE 1: Not logged in at all → Send to login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // CASE 2: Logged in but IS an admin → Keep them in admin area
  if (userType === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // CASE 3: Is regular user → Allow access
  return <Outlet />;
};

export { ProtectedAdminRoute, ProtectedUserRoute };
export default ProtectedAdminRoute;