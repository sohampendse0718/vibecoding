import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { getOrderBillData, getOrders, updateOrderStatus, type QueueOrder } from "../lib/api";
import { jsPDF } from "jspdf";

/* ── PDF generator ──────────────────────────────────────────────────────────
   Pure client-side, no server dependency – renders a styled receipt as PDF.
─────────────────────────────────────────────────────────────────────────── */
async function downloadPdfBill(orderId: string) {
  const order = await getOrderBillData(orderId);
  const doc   = new jsPDF({ unit: "mm", format: "a5", orientation: "portrait" });

  const W  = doc.internal.pageSize.getWidth();
  let   y  = 14;
  const cx = W / 2;

  const line   = () => { doc.setDrawColor(200); doc.setLineWidth(0.3); doc.line(10, y, W - 10, y); y += 5; };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dashed = () => { (doc as any).setLineDash([1.5, 1.5]); doc.line(10, y, W - 10, y); (doc as any).setLineDash([]); y += 5; };

  /* header */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("NOCTURNE CAFE", cx, y, { align: "center" }); y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text("Artisan Brewing · Brewed with Passion", cx, y, { align: "center" }); y += 4;
  doc.setTextColor(0);
  line();

  /* meta */
  doc.setFontSize(9);
  const dateStr = new Date(order.createdAt).toLocaleString();
  doc.text(`Order : ${order.id}`, 10, y);
  doc.text(dateStr, W - 10, y, { align: "right" }); y += 5;
  doc.text(`Customer : ${order.customerName}`, 10, y);
  doc.text(`Table : ${order.tableNumber}`, W - 10, y, { align: "right" }); y += 3;
  dashed();

  /* items header */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Qty  Item", 10, y);
  doc.text("Amount", W - 10, y, { align: "right" }); y += 2;
  line();

  /* items */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  for (const item of order.items) {
    const amt = (item.price * item.quantity).toFixed(2);
    doc.text(`${item.quantity}x  ${item.name}`, 10, y);
    doc.text(`Rs ${amt}`, W - 10, y, { align: "right" });
    y += 6;
  }
  dashed();

  /* totals */
  doc.setFontSize(9);
  doc.text("Subtotal", 10, y); doc.text(`Rs ${order.subtotal.toFixed(2)}`, W - 10, y, { align: "right" }); y += 5;
  doc.text("GST (5%)", 10, y); doc.text(`Rs ${order.tax.toFixed(2)}`, W - 10, y, { align: "right" }); y += 5;
  line();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("TOTAL", 10, y); doc.text(`Rs ${order.total.toFixed(2)}`, W - 10, y, { align: "right" }); y += 8;

  /* footer */
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(140);
  doc.text("Thank you for dining with us! ☕  See you again.", cx, y, { align: "center" });

  doc.save(`${order.id}-bill.pdf`);
}

/* ── component ──────────────────────────────────────────────────────────── */
export default function LiveOrders() {
  const [orders, setOrders]     = useState<QueueOrder[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy]   = useState(false);

  /* live-poll every 3 s */
  useEffect(() => {
    const load = () => { void getOrders().then(setOrders); };
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, []);

  /* auto-select latest order */
  useEffect(() => {
    if (orders.length && !selected) setSelected(orders[0].id);
  }, [orders]);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selected) ?? orders[0] ?? null,
    [orders, selected],
  );

  const advanceStatus = async (order: QueueOrder) => {
    const map: Record<string, string> = { new: "accepted", accepted: "preparing", preparing: "done" };
    const next = map[order.status];
    if (!next) return;
    const updated = await updateOrderStatus(order.id, next as QueueOrder["status"]);
    setOrders((cur) => cur.map((o) => (o.id === order.id ? updated : o)));
  };

  const handleDownloadPdf = async () => {
    if (!selectedOrder) return;
    setPdfBusy(true);
    try { await downloadPdfBill(selectedOrder.id); }
    catch (e) { alert("PDF generation failed. Please try again."); }
    setPdfBusy(false);
  };

  const statusColour: Record<string, string> = {
    new:       "bg-amber-500/20 text-amber-400 border-amber-500/30",
    accepted:  "bg-blue-500/20 text-blue-400 border-blue-500/30",
    preparing: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    done:      "bg-white/5 text-on-surface-variant border-white/10",
  };

  return (
    <div className="flex-1 overflow-x-hidden p-6 lg:p-8 flex flex-col min-h-screen">
      {/* ── top bar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-on-surface">Live Orders</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {orders.length === 0 ? "No orders yet — waiting…" : `${orders.length} order${orders.length > 1 ? "s" : ""} in queue`}
          </p>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={!selectedOrder || pdfBusy}
          className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container text-xs font-semibold px-5 py-3 rounded-xl border border-white/10 shadow-lg shadow-primary-container/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {pdfBusy ? (
            <span className="material-symbols-outlined text-sm animate-spin">sync</span>
          ) : (
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
          )}
          {pdfBusy ? "Generating PDF…" : "Download Bill (PDF)"}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 flex-1">
        {/* ── Queue list ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}
          className="xl:col-span-4 flex flex-col gap-4"
        >
          <div className="bg-surface-container rounded-xl p-5 border border-white/5 shadow-md">
            <h3 className="text-xs font-semibold text-on-surface-variant mb-4 tracking-wider uppercase">Order Queue</h3>

            {orders.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No incoming orders yet.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelected(order.id)}
                    className={`w-full text-left bg-surface border rounded-lg p-3 transition-all ${
                      selected === order.id
                        ? "border-primary-container/50 bg-primary-container/5"
                        : "border-outline-variant/40 hover:border-white/20"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm text-on-surface">{order.id}</p>
                        <p className="text-xs text-on-surface-variant">{order.customerName} · Table {order.tableNumber}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full border uppercase font-bold ${statusColour[order.status]}`}>
                        {order.status}
                      </span>
                    </div>

                    {order.status !== "done" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); void advanceStatus(order); }}
                        className="mt-3 w-full bg-primary-container text-on-primary-container text-xs py-2 rounded-lg font-semibold hover:opacity-90 transition active:scale-95"
                      >
                        {order.status === "new"
                          ? "Accept Order →"
                          : order.status === "accepted"
                          ? "Mark Preparing →"
                          : "Mark Done ✓"}
                      </button>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Receipt preview ──────────────────────────────────────────── */}
        <div className="xl:col-span-8 bg-surface-variant/40 rounded-xl border border-white/5 p-4 sm:p-8 flex justify-center items-start overflow-x-auto min-h-[600px] shadow-inner relative">
          <div className="absolute top-4 left-4 bg-surface/80 backdrop-blur px-3 py-1 rounded text-xs font-semibold text-on-surface-variant border border-white/5 shadow-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">receipt_long</span>
            Print Preview
          </div>

          <div className="bg-white w-full max-w-[380px] shadow-xl border border-gray-200 origin-top p-8 flex flex-col font-sans text-black rounded-sm">
            {/* cafe name */}
            <div className="text-center border-b-2 border-black/10 pb-5 mb-5">
              <h2 className="text-2xl font-black tracking-tighter mb-0.5 font-serif">NOCTURNE CAFE</h2>
              <p className="text-xs text-gray-400 italic font-serif">Artisan Brewing · Brewed with Passion</p>
            </div>

            {/* meta */}
            <div className="flex justify-between font-mono text-xs text-gray-600 mb-5 pb-4 border-b border-dashed border-gray-300">
              <div>
                <p>Date: {selectedOrder ? new Date(selectedOrder.createdAt).toLocaleDateString() : "—"}</p>
                <p>Time: {selectedOrder ? new Date(selectedOrder.createdAt).toLocaleTimeString() : "—"}</p>
              </div>
              <div className="text-right">
                <p>Order: {selectedOrder?.id ?? "—"}</p>
                <p>Table: {selectedOrder?.tableNumber ?? "—"}</p>
              </div>
            </div>

            {/* items */}
            <div className="flex-1 font-mono text-sm mb-4">
              {!selectedOrder ? (
                <p className="text-gray-400 text-center py-6 text-xs">Select or place an order to preview the bill.</p>
              ) : (
                selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                      <span className="text-gray-400">{item.quantity}×</span>
                      <div>
                        <p className="font-bold leading-tight">{item.name}</p>
                        <p className="text-[10px] text-gray-400">{item.category}</p>
                      </div>
                    </div>
                    <span className="font-bold">Rs {(item.quantity * item.price).toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>

            {/* totals */}
            <div className="border-t-2 border-black/10 pt-4 font-mono text-sm">
              <div className="flex justify-between mb-1 text-gray-500">
                <span>Subtotal</span><span>Rs {(selectedOrder?.subtotal ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-3 text-gray-500">
                <span>GST (5%)</span><span>Rs {(selectedOrder?.tax ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-dashed border-gray-300 pt-3 text-xl font-black">
                <span>TOTAL</span>
                <span>Rs {(selectedOrder?.total ?? 0).toFixed(2)}</span>
              </div>
            </div>

            {/* barcode decor */}
            <div className="mt-8 text-center pt-5 border-t-2 border-black/10">
              <div className="mb-3 flex justify-center">
                <div className="w-44 h-10 bg-[repeating-linear-gradient(to_right,black_0,black_2px,transparent_2px,transparent_4px,black_4px,black_5px,transparent_5px,transparent_8px,black_8px,black_10px,transparent_10px,transparent_14px)]" />
              </div>
              <p className="font-mono text-[10px] text-gray-400">Thank you! Visit us again 🙏</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
