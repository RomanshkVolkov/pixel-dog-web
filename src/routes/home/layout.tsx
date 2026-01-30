import { Outlet } from "react-router-dom";
import Header from "@/components/header";

export default function HomeLayout() {
  return (
    <div className="bg-background-light">
      <Header />
      <Outlet />
    </div>
  );
}
