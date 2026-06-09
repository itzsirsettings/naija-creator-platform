import BrandDashboard from "./BrandDashboard";
import CreatorDashboard from "./CreatorDashboard";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { activeRole } = useAuth();
  return activeRole === "brand" ? <BrandDashboard /> : <CreatorDashboard />;
}
