import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // You store user in either "user" or "mobook_user"
  const storedUser =
    localStorage.getItem("user") || localStorage.getItem("mobook_user");

  const isLoggedIn = !!storedUser;

  // If not logged in, redirect to login (/)
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // If logged in, allow access to nested routes
  return <Outlet />;
};

export default ProtectedRoute;
