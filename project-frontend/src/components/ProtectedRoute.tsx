import { Navigate } from "react-router-dom";
import type { JSX } from "react";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default ProtectedRoute;