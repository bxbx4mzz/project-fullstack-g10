import { useNavigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { decodeJwtPayload } from "../lib/jwt";

type TokenPayload = { name?: string; email?: string };

export default function CalendarApp() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const payload = token ? decodeJwtPayload<TokenPayload>(token) : null;
  const userName = payload?.name ?? payload?.email ?? "User";

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return <AppLayout userName={userName} onLogout={handleLogout} />;
}