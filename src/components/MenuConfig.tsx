import { useEffect, useRef, useState } from "react";
import {
  createMenuItem,
  deleteMenuItem,
  getMenu,
  updateTodaySpecial,
  uploadMenuImage,
  withAssetUrl,
  type MenuItem,
  type TodaySpecial,
} from "../lib/api";

/* ── tiny helpers ─────────────────────────────────────────────────────────── */
const INPUT =
  "w-full bg-[#0f0f0f] border border-white/10 rounded-lg py-3 px-4 text-on-surface outline-none focus:border-primary-container/60 transition placeholder:text-on-surface-variant/40 text-sm";

const BTN_GOLD =
  "inline-flex items-center gap-2 bg-primary-container text-on-primary-container font-semibold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed";

const BTN_GHOST =
  "inline-flex items-center gap-2 border border-white/10 text-on-surface-variant font-semibold text-sm px-5 py-2.5 rounded-lg hover:border-white/30 hover:text-on-surface active:scale-95 transition";

/* ── component ────────────────────────────────────────────────────────────── */
export default function MenuConfig() {
  // ── menu items ─────────────────────────────────────────────────────────
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // ── today's special ────────────────────────────────────────────────────
  const [special, setSpecial] = useState<TodaySpecial | null>(null);
  const [spTitle, setSpTitle]     = useState("");
  const [spPrice, setSpPrice]     = useState("");
  const [spDesc, setSpDesc]       = useState("");
  const [spImageFile, setSpImageFile] = useState<File | null>(null);
  const [spBusy, setSpBusy]       = useState(false);
  const spFileRef = useRef<HTMLInputElement>(null);

  // ── add-item form ──────────────────────────────────────────────────────
  const [iName, setIName]         = useState("");
  const [iCat, setICat]           = useState<"Coffee" | "Food">("Coffee");
  const [iPrice, setIPrice]       = useState("");
  const [iDesc, setIDesc]         = useState("");
  const [iImageFile, setIImageFile] = useState<File | null>(null);
  const [iAdding, setIAdding]     = useState(false);
  const iFileRef = useRef<HTMLInputElement>(null);

  // ── toast ──────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // ── fetch ──────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    const data = await getMenu();
    setMenuItems(data.menuItems);
    setSpecial(data.todaySpecial);
    setSpTitle(data.todaySpecial?.title ?? "");
    setSpPrice(data.todaySpecial?.price?.toString() ?? "");
    setSpDesc(data.todaySpecial?.description ?? "");
  };

  useEffect(() => {
    void fetchAll();
    // live-poll every 5 s so café changes are reflected without manual refresh
    const t = setInterval(fetchAll, 5000);
    return () => clearInterval(t);
  }, []);

  // ── Today's Special handlers ───────────────────────────────────────────
  const handleSaveSpecial = async (aiMode: boolean) => {
    if (!spTitle.trim()) { showToast("Please enter a special title first.", false); return; }
    setSpBusy(true);
    try {
      let imageUrl = special?.imageUrl ?? "";
      if (spImageFile) {
        const r = await uploadMenuImage(spImageFile);
        imageUrl = r.imageUrl;
      }
      const updated = await updateTodaySpecial({
        title: spTitle,
        description: aiMode ? "" : spDesc,
        price: parseFloat(spPrice) || 0,
        imageUrl,
        generateAiDescription: aiMode,
      });
      setSpecial(updated);
      setSpDesc(updated.description);
      setSpImageFile(null);
      if (spFileRef.current) spFileRef.current.value = "";
      showToast(aiMode ? "✨ AI description generated & saved!" : "Special saved!");
    } catch (e) {
      showToast("Failed to save special.", false);
    }
    setSpBusy(false);
  };

  // ── Add item handler ───────────────────────────────────────────────────
  const handleAddItem = async () => {
    if (!iName.trim() || !iPrice) { showToast("Name and price are required.", false); return; }
    setIAdding(true);
    try {
      let imageUrl = "";
      if (iImageFile) {
        const r = await uploadMenuImage(iImageFile);
        imageUrl = r.imageUrl;
      }
      await createMenuItem({ name: iName, category: iCat, price: parseFloat(iPrice), description: iDesc, imageUrl });
      setIName(""); setIPrice(""); setIDesc(""); setIImageFile(null);
      if (iFileRef.current) iFileRef.current.value = "";
      showToast("Menu item added! 🎉");
      await fetchAll();
    } catch (e) {
      showToast("Failed to add item.", false);
    }
    setIAdding(false);
  };

  // ── Delete item ────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      await deleteMenuItem(id);
      showToast("Item removed.");
      await fetchAll();
    } catch {
      showToast("Delete failed.", false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 pb-24 custom-scrollbar relative">
      {/* ── Toast ─────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[999] px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl transition-all ${
            toast.ok ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-10">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div>
          <h2 className="font-serif text-4xl font-bold text-on-surface mb-1">Menu Configuration</h2>
          <p className="text-on-surface-variant text-sm">Manage your menu items and today's special.</p>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 1 — ADD MENU ITEM
        ══════════════════════════════════════════════════════════════ */}
        <section className="bg-surface-container rounded-2xl p-6 border border-white/5 space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary-container text-sm">restaurant_menu</span>
            </div>
            <h3 className="font-serif text-2xl text-on-surface font-bold">Add Menu Item</h3>
          </div>

          {/* Row 1 — name + category + price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs text-on-surface-variant mb-1.5 uppercase tracking-wider">Category</label>
              <select
                value={iCat}
                onChange={(e) => setICat(e.target.value as "Coffee" | "Food")}
                className={INPUT + " cursor-pointer"}
              >
                <option value="Coffee">☕ Coffee</option>
                <option value="Food">🍽️ Food</option>
              </select>
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs text-on-surface-variant mb-1.5 uppercase tracking-wider">Item Name</label>
              <input
                value={iName}
                onChange={(e) => setIName(e.target.value)}
                className={INPUT}
                placeholder="e.g. Caramel Macchiato"
              />
            </div>
            <div>
              <label className="block text-xs text-on-surface-variant mb-1.5 uppercase tracking-wider">Price (Rs)</label>
              <input
                value={iPrice}
                onChange={(e) => setIPrice(e.target.value)}
                type="number"
                min="0"
                step="0.5"
                className={INPUT}
                placeholder="e.g. 149"
              />
            </div>
          </div>

          {/* Row 2 — description */}
          <div>
            <label className="block text-xs text-on-surface-variant mb-1.5 uppercase tracking-wider">Short Description (optional)</label>
            <textarea
              value={iDesc}
              onChange={(e) => setIDesc(e.target.value)}
              className={INPUT + " h-20 resize-none"}
              placeholder="A quick appetizing line about the item…"
            />
          </div>

          {/* Row 3 — image + submit */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-0">
              <label className="block text-xs text-on-surface-variant mb-1.5 uppercase tracking-wider">Item Image</label>
              <input
                type="file"
                accept="image/*"
                ref={iFileRef}
                onChange={(e) => e.target.files && setIImageFile(e.target.files[0])}
                className="text-xs text-on-surface-variant file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-white/10 file:text-on-surface hover:file:bg-white/20 cursor-pointer"
              />
            </div>
            {iImageFile && (
              <img src={URL.createObjectURL(iImageFile)} className="w-14 h-14 rounded-lg object-cover border border-white/10" />
            )}
            <button onClick={handleAddItem} disabled={iAdding} className={BTN_GOLD}>
              {iAdding ? (
                <span className="material-symbols-outlined text-sm animate-spin">sync</span>
              ) : (
                <span className="material-symbols-outlined text-sm">add_circle</span>
              )}
              {iAdding ? "Adding…" : "Add to Menu"}
            </button>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 2 — TODAY'S SPECIAL
        ══════════════════════════════════════════════════════════════ */}
        <section className="bg-surface-container rounded-2xl border border-primary-container/20 overflow-hidden">
          {/* Glow header */}
          <div className="bg-gradient-to-r from-primary-container/15 to-transparent px-6 py-4 border-b border-white/5 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
            <h3 className="font-serif text-2xl text-primary-container font-bold">Today's Special</h3>
            <span className="ml-auto text-[10px] uppercase tracking-widest text-on-surface-variant border border-white/10 px-2 py-1 rounded">
              Gemini AI ✨
            </span>
          </div>

          <div className="p-6 flex flex-col md:flex-row gap-6">
            {/* Left — form */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-xs text-on-surface-variant mb-1.5 uppercase tracking-wider">Special Name / Title</label>
                <input
                  value={spTitle}
                  onChange={(e) => setSpTitle(e.target.value)}
                  className={INPUT}
                  placeholder="e.g. Truffle Mushroom Bruschetta"
                />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1.5 uppercase tracking-wider">Price (Rs)</label>
                <input
                  value={spPrice}
                  onChange={(e) => setSpPrice(e.target.value)}
                  type="number"
                  className={INPUT}
                  placeholder="e.g. 299"
                />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1.5 uppercase tracking-wider">Description</label>
                <textarea
                  value={spDesc}
                  onChange={(e) => setSpDesc(e.target.value)}
                  className={INPUT + " h-28 resize-none"}
                  placeholder="Write a description or click below to let AI craft one…"
                />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1.5 uppercase tracking-wider">Special Image</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={spFileRef}
                  onChange={(e) => e.target.files && setSpImageFile(e.target.files[0])}
                  className="text-xs text-on-surface-variant file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-white/10 file:text-on-surface hover:file:bg-white/20 cursor-pointer"
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <button onClick={() => handleSaveSpecial(false)} disabled={spBusy} className={BTN_GHOST}>
                  <span className="material-symbols-outlined text-sm">save</span>
                  Save Special
                </button>
                <button onClick={() => handleSaveSpecial(true)} disabled={spBusy} className={BTN_GOLD}>
                  {spBusy ? (
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  )}
                  {spBusy ? "AI Writing…" : "Generate AI Description & Save"}
                </button>
              </div>
            </div>

            {/* Right — preview */}
            <div className="w-full md:w-56 shrink-0 space-y-3">
              <div className="w-full aspect-square rounded-xl overflow-hidden border border-white/10 bg-surface-dim flex items-center justify-center">
                {spImageFile ? (
                  <img src={URL.createObjectURL(spImageFile)} className="w-full h-full object-cover" />
                ) : special?.imageUrl ? (
                  <img src={withAssetUrl(special.imageUrl)} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-white/10">image</span>
                )}
              </div>
              {special?.description && (
                <div className="bg-surface-dim rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-on-surface-variant italic leading-relaxed line-clamp-5">{special.description}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 3 — CURRENT MENU ITEMS
        ══════════════════════════════════════════════════════════════ */}
        <section>
          <h3 className="font-serif text-2xl text-on-surface font-bold mb-4">
            Current Menu
            <span className="ml-3 text-sm font-sans font-normal text-on-surface-variant">({menuItems.length} items)</span>
          </h3>

          {menuItems.length === 0 ? (
            <div className="bg-surface-container rounded-2xl p-10 border border-white/5 text-center text-on-surface-variant">
              No items yet — add your first item above!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-container rounded-xl border border-white/5 p-4 flex gap-4 group hover:border-white/10 transition"
                >
                  {/* thumb */}
                  <div className="w-16 h-16 rounded-lg shrink-0 overflow-hidden bg-surface-dim border border-white/5">
                    {item.imageUrl ? (
                      <img src={withAssetUrl(item.imageUrl)} className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center material-symbols-outlined text-white/10 text-2xl">
                        {item.category === "Coffee" ? "local_cafe" : "restaurant"}
                      </span>
                    )}
                  </div>

                  {/* info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-serif font-bold text-on-surface truncate">{item.name}</h4>
                      <span className="font-mono text-primary-container text-sm shrink-0 ml-2">Rs {item.price}</span>
                    </div>
                    <span className="inline-block text-[10px] uppercase tracking-wider text-on-surface-variant bg-surface-dim px-2 py-0.5 rounded mt-0.5">
                      {item.category}
                    </span>
                    {item.description && (
                      <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </div>

                  {/* delete */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:bg-red-400/10"
                    title="Delete item"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
