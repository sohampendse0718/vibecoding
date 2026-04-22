export type MenuCategory = "Coffee" | "Food";

export type MenuItem = {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  description: string;
  imageUrl: string;
};

export type TodaySpecial = {
  title: string;
  description: string;
  price: number;
  imageUrl: string;
};

export type OrderStatus = "new" | "accepted" | "preparing" | "done";

export type QueueOrder = {
  id: string;
  customerName: string;
  tableNumber: string;
  items: Array<{
    id: string;
    name: string;
    category: MenuCategory;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
};

const API_BASE = "/api";

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed");
  }
  return (await response.json()) as T;
}

export async function getMenu() {
  return parseJson<{ menuItems: MenuItem[]; todaySpecial: TodaySpecial }>(await fetch(`${API_BASE}/menu`));
}

export async function createMenuItem(payload: Omit<MenuItem, "id">) {
  return parseJson<MenuItem>(
    await fetch(`${API_BASE}/menu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function updateMenuItem(id: string, payload: Partial<MenuItem>) {
  return parseJson<MenuItem>(
    await fetch(`${API_BASE}/menu/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function deleteMenuItem(id: string) {
  const res = await fetch(`${API_BASE}/menu/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete item");
}

export async function uploadMenuImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  return parseJson<{ imageUrl: string }>(
    await fetch(`${API_BASE}/menu/upload-image`, {
      method: "POST",
      body: formData,
    }),
  );
}

export async function updateTodaySpecial(payload: Partial<TodaySpecial> & { generateAiDescription?: boolean }) {
  return parseJson<TodaySpecial>(
    await fetch(`${API_BASE}/special`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function createOrder(payload: { customerName: string; tableNumber: string; items: QueueOrder["items"] }) {
  return parseJson<QueueOrder>(
    await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function getOrders() {
  return parseJson<QueueOrder[]>(await fetch(`${API_BASE}/orders`));
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  return parseJson<QueueOrder>(
    await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }),
  );
}

export async function getOrderBillData(orderId: string) {
  return parseJson<QueueOrder>(await fetch(`${API_BASE}/orders/${orderId}/bill`));
}

export function withAssetUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return url;
}
