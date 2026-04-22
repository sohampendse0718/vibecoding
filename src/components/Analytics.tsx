import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useGsapReveal } from "../hooks/useGsapReveal";
import { getOrders, type QueueOrder } from "../lib/api";

export default function Analytics() {
  useGsapReveal(".reveal-analytics-card");
  const [orders, setOrders] = useState<QueueOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + o.total, 0), [orders]);
  const totalOrders = orders.length;

  const topItems = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => {
      o.items.forEach(i => {
        counts[i.name] = (counts[i.name] || 0) + i.quantity;
      });
    });
    return Object.entries(counts)
      .map(([name, units]) => ({ name, units }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);
  }, [orders]);

  return (
    <div className="flex-1 overflow-y-auto p-gutter pb-24 md:pb-gutter custom-scrollbar">
      <motion.div
        className="max-w-[1600px] mx-auto space-y-gutter"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between space-y-4 md:space-y-0 mb-xl">
          <div>
            <h2 className="font-serif text-4xl font-bold text-on-surface mb-2">Cycle Overview</h2>
            <p className="font-sans text-lg text-on-surface-variant">Analytics derived from all live menu orders.</p>
          </div>
          <button onClick={fetchAnalytics} className="bg-surface-container border border-outline-variant px-4 py-2 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container-highest transition-colors flex items-center space-x-2 w-fit">
            <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>sync</span>
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="reveal-analytics-card col-span-1 md:col-span-12 bg-surface-container rounded-xl p-8 border border-outline-variant/30 flex gap-10">
              <div>
                 <p className="text-on-surface-variant text-sm mb-1 uppercase tracking-wider">Total Revenue</p>
                 <h3 className="font-serif text-4xl text-primary-container">Rs {totalRevenue.toFixed(2)}</h3>
              </div>
              <div>
                 <p className="text-on-surface-variant text-sm mb-1 uppercase tracking-wider">Total Orders</p>
                 <h3 className="font-serif text-4xl text-on-surface">{totalOrders}</h3>
              </div>
          </div>

          <div className="reveal-analytics-card col-span-1 md:col-span-4 bg-surface-container rounded-xl p-6 border border-outline-variant/30 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-2xl font-bold text-on-surface">Top Selling Items</h3>
              <span className="material-symbols-outlined text-on-surface-variant">leaderboard</span>
            </div>
            {topItems.length === 0 ? (
              <p className="text-on-surface-variant text-sm">No sales recorded.</p>
            ) : (
                <ul className="space-y-4">
                  {topItems.map((item, i) => (
                      <li key={i} className="flex justify-between items-center bg-surface-variant/30 p-3 rounded">
                          <span className="font-mono text-on-surface">{item.name}</span>
                          <span className="text-primary-container font-bold">{item.units} <span className="opacity-50 text-xs text-on-surface">units</span></span>
                      </li>
                  ))}
                </ul>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
