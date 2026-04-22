import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { useGsapReveal } from "../hooks/useGsapReveal";
import { useAuth } from "../auth/AuthContext";
import { createOrder, getMenu, withAssetUrl, type MenuItem, type TodaySpecial } from "../lib/api";
import NovaBot from "./NovaBot";

type CartItem = MenuItem & { quantity: number };

export default function Menu() {
  const { logout } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"All" | "Coffee" | "Food">("All");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [special, setSpecial] = useState<TodaySpecial | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");

  useGsapReveal(".menu-reveal");

  useEffect(() => {
    const fetchMenu = () => {
      void getMenu().then((data) => {
        setMenuItems(data.menuItems);
        setSpecial(data.todaySpecial);
      });
    };
    fetchMenu();
    // Live-poll every 5 s so cafe menu/special changes render for customers
    const t = setInterval(fetchMenu, 5000);
    return () => clearInterval(t);
  }, []);

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return menuItems;
    return menuItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const addToCart = (item: MenuItem) => {
    setCart((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return current.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        );
      }
      return [...current, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, change: number) => {
    setCart((current) =>
      current
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + change) } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const placeOrder = async () => {
    if (!customerName || !tableNumber || cart.length === 0) return;
    setPlacingOrder(true);
    await createOrder({
      customerName,
      tableNumber,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: item.quantity,
      })),
    });
    setCart([]);
    setCustomerName("");
    setTableNumber("");
    setIsCartOpen(false);
    setPlacingOrder(false);
  };

  return (
    <div className="bg-[#1a0f0a] text-on-background font-sans min-h-screen pb-32">
      <header className="fixed top-0 w-full z-50 border-b border-primary-container/20 bg-[#1a0f0a]/80 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center px-6 h-16 w-full">
          <div className="flex items-center gap-4">
            <span className="text-xl font-black text-primary-container drop-shadow-[0_0_10px_rgba(234,179,8,0.25)] font-serif tracking-tight">
              NOCTURNE CAFE
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex gap-6">
              <a className="font-serif font-bold tracking-tight text-primary-container border-b-2 border-primary-container hover:text-primary-fixed-dim hover:bg-white/5 transition-all py-4" href="#">Menu</a>
              <a className="font-serif font-bold tracking-tight text-on-surface-variant hover:text-primary-fixed-dim hover:bg-white/5 transition-all py-4" href="#">Combos</a>
              <a className="font-serif font-bold tracking-tight text-on-surface-variant hover:text-primary-fixed-dim hover:bg-white/5 transition-all py-4" href="#">Reservations</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative text-primary-container hover:text-primary-fixed-dim hover:bg-white/5 transition-all active:scale-95 duration-200 p-2 rounded-full"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>shopping_cart</span>
              {cart.length > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-secondary-fixed-dim text-[10px] text-black font-bold flex items-center justify-center">
                  {cart.length}
                </span>
              ) : null}
            </button>
            <button className="text-on-surface-variant hover:text-primary-fixed-dim hover:bg-white/5 transition-all active:scale-95 duration-200 p-2 rounded-full">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>notifications</span>
            </button>
            <button
              onClick={logout}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-primary-container hover:border-primary-container transition-colors text-xs font-semibold"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Logout
            </button>
            <Link to="/">
              <img alt="Chef Profile" className="w-8 h-8 rounded-full border border-primary-container object-cover cursor-pointer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHPdbszUCFZZN4Sh2Cdhuawgq2d9vn33bdSPBgl8eZhHNW8i09jhCF4nnlqzlu7-0Dhaz6nxS4RhtHJQp8MeZyQt6PelTYqoR3DpZPu7X7QbqiCzEoZc5uMkiykrTbZk8fFIN3S1n1gH9XHRhjLUvoU2eaDKnFjaXKBFB4QDawtqsrNSLn6XXM5MYYTUxRzVO5FhSugD_hqE_GQMyv8tkoiVRJCaf0qmQdMX2FEqvpMUE-mtMKPlJtdVH8EAsfS5wgxPFVXCV0qRk" />
            </Link>
            <button
              onClick={logout}
              className="sm:hidden text-on-surface-variant hover:text-primary-fixed-dim hover:bg-white/5 transition-all active:scale-95 duration-200 p-2 rounded-full"
              title="Logout"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>
      
      <div className="fixed top-16 w-full z-40 bg-secondary-fixed-dim text-on-secondary py-2 px-4 shadow-[0_0_15px_rgba(200,200,176,0.3)] flex justify-center items-center gap-2">
        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
        <span className="font-mono font-bold text-xs">Live Menu and Ordering</span>
      </div>

      <main className="pt-32 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
        {/* ── Today's Special Card ──────────────────────────────────── */}
        {special?.title && (
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative w-full rounded-2xl bg-surface-container-high border border-primary-container/25 shadow-[0_4px_24px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-container/70 to-transparent" />

            <div className="flex items-center">
              {/* Left — text */}
              <div className="flex-1 min-w-0 p-6 md:p-8 flex flex-col gap-3">
                <div className="inline-flex items-center gap-1.5 bg-primary-container/15 text-primary-container border border-primary-container/40 px-3 py-1 rounded-full w-fit">
                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <span className="font-sans text-[10px] font-bold uppercase tracking-widest">Chef's Daily Special</span>
                </div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-on-surface leading-tight">
                  {special.title}
                </h2>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                  {special.description}
                </p>
                <div className="inline-flex items-center gap-2 w-fit mt-1">
                  <span className="font-mono text-xl font-bold text-primary-container drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]">
                    Rs {(special.price ?? 0).toFixed(2)}
                  </span>
                  <span className="text-xs text-on-surface-variant">today only</span>
                </div>
              </div>

              {/* Right — small thumbnail */}
              {special.imageUrl ? (
                <div className="shrink-0 w-36 h-36 md:w-44 md:h-44 m-4 rounded-xl overflow-hidden border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.7)]">
                  <img
                    src={withAssetUrl(special.imageUrl)}
                    alt={special.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="shrink-0 w-36 h-36 md:w-44 md:h-44 m-4 rounded-xl bg-surface-dim border border-white/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-white/10">restaurant</span>
                </div>
              )}
            </div>
          </motion.section>
        )}

        <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar">
          {["All", "Coffee", "Food"].map((label) => (
             <button key={label} onClick={() => setActiveCategory(label as "All" | "Coffee" | "Food")} className={cn(
               "whitespace-nowrap px-4 py-2 rounded-full font-sans text-xs font-bold uppercase transition-colors",
               activeCategory === label ? "bg-primary-container/10 text-primary-container border border-primary-container shadow-[0_0_10px_rgba(234,179,8,0.2)]" :
               "bg-surface-container text-on-surface border border-outline-variant hover:border-primary-container hover:text-primary-container"
             )}>{label}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <article key={item.id} className="menu-reveal bg-surface-container rounded-xl border border-white/5 p-4 flex flex-col hover:border-primary-container/50 transition-all group">
              <div className="mb-3 rounded-lg overflow-hidden border border-white/10 bg-surface-dim h-36">
                {item.imageUrl ? (
                  <img src={withAssetUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-on-surface-variant">No image</div>
                )}
              </div>
              <div className="mb-3">
                <span className="inline-flex text-[10px] uppercase tracking-wide bg-surface-variant px-2 py-1 rounded">
                  {item.category}
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-on-background mb-1">{item.name}</h3>
              <p className="font-sans text-sm text-on-surface-variant mb-4">{item.description}</p>
              <div className="mt-auto flex items-center justify-between">
                <span className="font-mono text-lg text-primary-container font-bold">Rs {item.price.toFixed(2)}</span>
                <button onClick={() => addToCart(item)} className="w-10 h-10 rounded-full bg-surface-variant border border-outline-variant flex items-center justify-center text-on-surface hover:bg-primary-container hover:text-on-primary hover:border-primary-container transition-all">
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex justify-end">
          <aside className="w-full md:w-[480px] h-full bg-surface-container-low/95 backdrop-blur-2xl shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col border-l border-white/5">
            <div className="p-6 flex justify-between items-center border-b border-white/5">
              <h2 className="font-serif text-3xl font-bold text-on-surface">Your Order</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-on-surface-variant hover:text-primary-container transition-colors p-2 rounded-full hover:bg-white/5">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <p className="text-on-surface-variant text-sm">Cart is empty.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bg-surface border border-white/5 rounded-lg p-4 flex gap-4 relative group hover:border-primary-container/30 transition-colors">
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-mono text-sm text-on-surface">{item.name}</h3>
                          <p className="font-sans text-xs text-on-surface-variant mt-1">{item.category}</p>
                        </div>
                        <span className="font-mono text-sm text-primary-container">Rs {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-3 bg-surface-container rounded px-2 py-1 border border-white/5 text-on-surface">
                          <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-primary-container"><span className="material-symbols-outlined text-[16px]">remove</span></button>
                          <span className="font-mono text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="hover:text-primary-container"><span className="material-symbols-outlined text-[16px]">add</span></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-surface-container-high border-t border-white/5">
              <div className="space-y-3 mb-6">
                <input className="w-full bg-transparent border border-white/20 rounded text-on-surface focus:ring-0 focus:border-primary-container font-mono text-sm py-2 px-3 transition-colors placeholder:text-on-surface-variant/50 outline-none" placeholder="Customer Name" type="text" value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
                <input className="w-full bg-transparent border border-white/20 rounded text-on-surface focus:ring-0 focus:border-primary-container font-mono text-sm py-2 px-3 transition-colors placeholder:text-on-surface-variant/50 outline-none" placeholder="Table Number" type="text" value={tableNumber} onChange={(event) => setTableNumber(event.target.value)} />
              </div>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between font-sans text-sm text-on-surface-variant">
                  <span>Subtotal</span>
                  <span className="font-mono text-on-surface">Rs {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-sans text-sm text-on-surface-variant">
                  <span>Tax</span>
                  <span className="font-mono text-on-surface">Rs {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-serif font-bold text-xl text-on-surface mt-2 pt-2 border-t border-white/5">
                  <span>Total</span>
                  <span className="font-mono text-primary-container drop-shadow-[0_0_5px_rgba(234,179,8,0.3)]">Rs {total.toFixed(2)}</span>
                </div>
              </div>
              <button onClick={() => { void placeOrder(); }} disabled={!customerName || !tableNumber || cart.length === 0 || placingOrder} className="w-full bg-primary-container disabled:opacity-40 disabled:cursor-not-allowed text-on-primary-container font-sans font-bold text-sm tracking-widest py-4 rounded transition-all active:scale-[0.98] flex justify-center items-center gap-2 uppercase shadow-[0_0_15px_rgba(234,179,8,0.25)]">
                <span>{placingOrder ? "Placing..." : "Place Order"}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── NOVA Chatbot ──────────────────────────────────────────── */}
      <NovaBot />
    </div>
  );
}
