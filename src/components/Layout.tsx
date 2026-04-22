import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { useAuth } from "../auth/AuthContext";

export function Sidebar() {
  const location = useLocation();
  const { currentUser } = useAuth();

  const links = [
    { name: "Live Orders", href: "/orders", icon: "receipt_long" },
    { name: "Business", href: "/business", icon: "storefront" },
    { name: "Analytics", href: "/analytics", icon: "analytics" },
    { name: "Menu Config", href: "/menu-config", icon: "menu_book" },
    { name: "Settings", href: "/settings", icon: "settings" },
  ];

  const chefLinks = [
    { name: "Live Orders", href: "/orders", icon: "receipt_long" },
    { name: "Business", href: "/business", icon: "storefront" },
    { name: "Analytics", href: "/analytics", icon: "analytics" },
    { name: "Menu Config", href: "/menu-config", icon: "menu_book" },
    { name: "Settings", href: "/settings", icon: "settings" },
  ];
  const visibleLinks = currentUser?.role === "chef" ? chefLinks : links;

  return (
    <nav className="hidden md:flex flex-col h-screen sticky top-0 border-r w-64 border-surface-bright shadow-2xl shadow-black bg-surface-dim z-40">
      <div className="p-6 border-b border-surface-bright/50 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-container shadow-[0_0_15px_rgba(234,179,8,0.15)] bg-surface-container-high flex items-center justify-center">
          <span className="material-symbols-outlined text-primary-container">storefront</span>
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold text-primary-container">Cafe Console</h2>
          <p className="font-sans text-on-surface-variant text-sm">Business Dashboard</p>
        </div>
      </div>
      <div className="flex-1 py-6 flex flex-col space-y-2">
        {visibleLinks.map((link) => {
          const isActive = location.pathname === link.href;
          return (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                "px-4 py-3 flex items-center space-x-3 transition-all duration-300 ease-in-out",
                isActive
                  ? "bg-surface-container/50 text-primary-container border-r-2 border-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container/30 hover:text-primary"
              )}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}>
                {link.icon}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function TopBar() {
  const { currentUser, logout } = useAuth();

  return (
    <header className="flex justify-between items-center px-6 h-16 w-full sticky top-0 border-b border-surface-bright shadow-none bg-surface/80 backdrop-blur z-30 shrink-0">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold tracking-tighter text-primary-container font-serif antialiased">
          Cafe Dashboard
        </h1>
      </div>
      <div className="flex items-center space-x-6">
        <div className="hidden md:flex items-center bg-surface-container-lowest border border-outline/30 rounded-full px-4 py-1.5 focus-within:border-primary-container focus-within:ring-1 focus-within:ring-primary-container/50 transition-all">
          <span className="material-symbols-outlined text-outline text-sm mr-2">search</span>
          <input
            className="bg-transparent border-none text-on-surface text-sm focus:ring-0 placeholder-on-surface-variant w-48 outline-none"
            placeholder="Search analytics..."
            type="text"
          />
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-on-surface-variant hover:text-primary-container transition-colors active:opacity-80">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <span className="text-xs uppercase tracking-wider text-on-surface-variant">{currentUser?.role}</span>
          <button onClick={logout} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-primary-container hover:border-primary-container transition-colors text-xs font-semibold" title="Logout">
            <span className="material-symbols-outlined text-sm">logout</span>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export function BottomNavBar() {
  const location = useLocation();
  const links = [
    { name: "Orders", href: "/orders", icon: "receipt_long" },
    { name: "Business", href: "/business", icon: "storefront" },
    { name: "Settings", href: "/settings", icon: "settings" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 border-t rounded-t-xl border-surface-bright shadow-[0_-4px_10px_rgba(0,0,0,0.5)] bg-surface-dim">
      {links.map((link) => {
        const isActive = location.pathname === link.href;
        return (
          <Link
            key={link.name}
            to={link.href}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-xl scale-95 transition-transform",
              isActive ? "text-primary-container bg-primary-container/10" : "text-on-surface-variant active:bg-surface-container"
            )}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}>
              {link.icon}
            </span>
            <span className="font-serif text-[10px] mt-1 uppercase tracking-wider">{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
