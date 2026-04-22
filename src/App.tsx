import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Sidebar, TopBar, BottomNavBar } from "./components/Layout";
import Analytics from "./components/Analytics";
import Settings from "./components/Settings";
import LiveOrders from "./components/LiveOrders";
import OperationsDashboard from "./components/OperationsDashboard";
import Menu from "./components/Menu";
import AuthPage from "./components/AuthPage";
import { useAuth } from "./auth/AuthContext";
import MenuConfig from "./components/MenuConfig";

function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex flex-col flex-1 h-screen overflow-hidden relative">
        <TopBar />
        <Outlet />
        <BottomNavBar />
      </main>
    </div>
  );
}

export default function App() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <AuthPage />;
  }

  if (currentUser.role === "customer") {
    return (
      <Routes>
        <Route path="/menu" element={<Menu />} />
        <Route path="*" element={<Navigate to="/menu" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/orders" replace />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/orders" element={<LiveOrders />} />
        <Route path="/business" element={<OperationsDashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/assistant" element={
          <div className="flex items-center justify-center h-full text-on-surface-variant font-serif">
            Virtual Assistant standing by.
          </div>
        } />
        <Route path="/menu-config" element={<MenuConfig />} />
      </Route>
      <Route path="/menu" element={<Navigate to="/orders" replace />} />
      <Route path="*" element={<Navigate to="/orders" replace />} />
    </Routes>
  );
}
