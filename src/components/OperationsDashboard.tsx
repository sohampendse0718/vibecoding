import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGsapReveal } from "../hooks/useGsapReveal";
import {
  createMenuItem,
  getMenu,
  updateMenuItem,
  updateTodaySpecial,
  uploadMenuImage,
  withAssetUrl,
  type MenuCategory,
  type MenuItem,
} from "../lib/api";

export default function OperationsDashboard() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Coffee" as MenuCategory,
    price: "",
    description: "",
    imageUrl: "",
  });
  const [specialTitle, setSpecialTitle] = useState("");
  const [specialDescription, setSpecialDescription] = useState("");
  const [specialPrice, setSpecialPrice] = useState("");
  const [specialImageUrl, setSpecialImageUrl] = useState("");

  useGsapReveal(".reveal-ops-card");

  useEffect(() => {
    void getMenu().then((data) => {
      setMenuItems(data.menuItems);
      setSpecialTitle(data.todaySpecial.title);
      setSpecialDescription(data.todaySpecial.description);
      setSpecialPrice(String(data.todaySpecial.price));
      setSpecialImageUrl(data.todaySpecial.imageUrl);
    });
  }, []);

  const addMenuItem = async () => {
    if (!newItem.name || !newItem.description || !newItem.price) return;
    const created = await createMenuItem({
      name: newItem.name,
      description: newItem.description,
      category: newItem.category,
      price: Number(newItem.price),
      imageUrl: newItem.imageUrl,
    });
    setMenuItems((current) => [created, ...current]);
    setNewItem({ name: "", category: "Coffee", price: "", description: "", imageUrl: "" });
  };

  const saveMenuItem = async (item: MenuItem) => {
    const updated = await updateMenuItem(item.id, item);
    setMenuItems((current) => current.map((entry) => (entry.id === item.id ? updated : entry)));
  };

  const uploadImageForNewItem = async (file: File) => {
    const response = await uploadMenuImage(file);
    setNewItem((current) => ({ ...current, imageUrl: response.imageUrl }));
  };

  const uploadImageForItem = async (file: File, itemId: string) => {
    const response = await uploadMenuImage(file);
    setMenuItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, imageUrl: response.imageUrl } : item)),
    );
  };

  const uploadImageForSpecial = async (file: File) => {
    const response = await uploadMenuImage(file);
    setSpecialImageUrl(response.imageUrl);
  };

  const saveSpecial = async () => {
    await updateTodaySpecial({
      title: specialTitle,
      description: specialDescription,
      price: Number(specialPrice || 0),
      imageUrl: specialImageUrl,
    });
  };

  return (
    <div className="flex-1 flex flex-col gap-6 p-4 md:p-6 overflow-y-auto custom-scrollbar">
      <motion.div
        className="flex justify-between items-end"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div>
          <h1 className="font-serif text-3xl font-bold text-on-surface mb-1">Cafe Console</h1>
          <p className="text-on-surface-variant text-sm">Edit menu, upload images, and publish today's special for customers.</p>
        </div>
      </motion.div>

      <div className="reveal-ops-card bg-surface-container border border-white/5 rounded-xl p-6 space-y-4">
        <h2 className="font-serif text-2xl text-on-surface">Today's Special</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="bg-surface border border-white/10 p-3 rounded-lg outline-none" placeholder="Special title" value={specialTitle} onChange={(event) => setSpecialTitle(event.target.value)} />
          <input className="bg-surface border border-white/10 p-3 rounded-lg outline-none" placeholder="Special price" type="number" value={specialPrice} onChange={(event) => setSpecialPrice(event.target.value)} />
          <textarea className="md:col-span-2 bg-surface border border-white/10 p-3 rounded-lg outline-none min-h-24" placeholder="Special description" value={specialDescription} onChange={(event) => setSpecialDescription(event.target.value)} />
          <div className="md:col-span-2 flex items-center gap-3">
            <input type="file" accept="image/*" onChange={(event) => { if (event.target.files?.[0]) { void uploadImageForSpecial(event.target.files[0]); } }} />
            {specialImageUrl ? <img src={withAssetUrl(specialImageUrl)} alt="Special" className="w-16 h-16 object-cover rounded" /> : null}
          </div>
        </div>
        <button className="bg-primary-container text-on-primary-container text-xs font-semibold uppercase px-6 py-3 rounded-lg" onClick={() => { void saveSpecial(); }}>
          Publish Special
        </button>
      </div>

      <div className="reveal-ops-card bg-surface-container border border-white/5 rounded-xl p-4 lg:p-6 flex flex-col min-h-[360px]">
        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
          <span className="material-symbols-outlined text-primary-fixed-dim">edit_square</span>
          <h2 className="font-serif text-2xl font-bold text-on-surface">Menu Management</h2>
        </div>

        <div className="bg-surface border border-white/5 rounded-xl p-4 mb-5">
          <h3 className="text-sm font-semibold mb-3">Add New Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="bg-surface-container border border-white/10 p-2 rounded" placeholder="Name" value={newItem.name} onChange={(event) => setNewItem((current) => ({ ...current, name: event.target.value }))} />
            <select className="bg-surface-container border border-white/10 p-2 rounded" value={newItem.category} onChange={(event) => setNewItem((current) => ({ ...current, category: event.target.value as MenuCategory }))}>
              <option value="Coffee">Coffee</option>
              <option value="Food">Food</option>
            </select>
            <input className="bg-surface-container border border-white/10 p-2 rounded" placeholder="Price" type="number" value={newItem.price} onChange={(event) => setNewItem((current) => ({ ...current, price: event.target.value }))} />
            <input type="file" accept="image/*" onChange={(event) => { if (event.target.files?.[0]) { void uploadImageForNewItem(event.target.files[0]); } }} />
            <textarea className="md:col-span-2 bg-surface-container border border-white/10 p-2 rounded min-h-20" placeholder="Description" value={newItem.description} onChange={(event) => setNewItem((current) => ({ ...current, description: event.target.value }))} />
          </div>
          <button className="mt-3 bg-primary-container text-on-primary-container text-xs font-semibold px-4 py-2 rounded" onClick={() => { void addMenuItem(); }}>
            Add Item
          </button>
        </div>

        <div className="flex flex-col gap-4 flex-1">
          {menuItems.map((item) => (
            <div key={item.id} className="border border-white/10 rounded-lg p-3 bg-surface-container">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input className="bg-surface border border-white/10 p-2 rounded" value={item.name} onChange={(event) => setMenuItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, name: event.target.value } : entry)))} />
                <select className="bg-surface border border-white/10 p-2 rounded" value={item.category} onChange={(event) => setMenuItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, category: event.target.value as MenuCategory } : entry)))}>
                  <option value="Coffee">Coffee</option>
                  <option value="Food">Food</option>
                </select>
                <input className="bg-surface border border-white/10 p-2 rounded" type="number" value={item.price} onChange={(event) => setMenuItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, price: Number(event.target.value) } : entry)))} />
                <textarea className="md:col-span-2 bg-surface border border-white/10 p-2 rounded min-h-20" value={item.description} onChange={(event) => setMenuItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, description: event.target.value } : entry)))} />
                <div className="flex items-center gap-3">
                  <input type="file" accept="image/*" onChange={(event) => { if (event.target.files?.[0]) { void uploadImageForItem(event.target.files[0], item.id); } }} />
                  {item.imageUrl ? <img src={withAssetUrl(item.imageUrl)} alt={item.name} className="w-12 h-12 object-cover rounded" /> : null}
                </div>
              </div>
              <button className="mt-3 bg-primary-container text-on-primary-container text-xs font-semibold px-4 py-2 rounded" onClick={() => { void saveMenuItem(item); }}>
                Save Item
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
