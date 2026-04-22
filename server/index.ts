import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import dotenv from "dotenv";

dotenv.config();

type MenuCategory = "Coffee" | "Food";

type MenuItem = {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  description: string;
  imageUrl: string;
};

type TodaySpecial = {
  title: string;
  description: string;
  price: number;
  imageUrl: string;
};

type OrderItem = {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  quantity: number;
};

type OrderStatus = "new" | "accepted" | "preparing" | "done";

type Order = {
  id: string;
  customerName: string;
  tableNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
};

type DbShape = {
  menuItems: MenuItem[];
  todaySpecial: TodaySpecial;
  orders: Order[];
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dbPath = path.join(rootDir, "data", "db.json");
const uploadsDir = path.join(rootDir, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  }),
});

const app = express();
const port = Number(process.env.API_PORT ?? 4000);

app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(uploadsDir));

function readDb(): DbShape {
  const raw = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(raw) as DbShape;
}

function writeDb(nextDb: DbShape) {
  fs.writeFileSync(dbPath, JSON.stringify(nextDb, null, 2), "utf-8");
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/menu", (_req, res) => {
  const db = readDb();
  res.json({
    menuItems: db.menuItems,
    todaySpecial: db.todaySpecial,
  });
});

app.post("/api/menu", (req, res) => {
  const { name, category, price, description, imageUrl } = req.body as Partial<MenuItem>;
  if (!name || !category || typeof price !== "number" || !description) {
    res.status(400).json({ message: "Invalid menu payload" });
    return;
  }
  const db = readDb();
  const newItem: MenuItem = {
    id: randomUUID(),
    name,
    category,
    price,
    description,
    imageUrl: imageUrl ?? "",
  };
  db.menuItems.unshift(newItem);
  writeDb(db);
  res.status(201).json(newItem);
});

app.put("/api/menu/:id", (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const index = db.menuItems.findIndex((item) => item.id === id);
  if (index === -1) {
    res.status(404).json({ message: "Item not found" });
    return;
  }
  const updated = { ...db.menuItems[index], ...(req.body as Partial<MenuItem>) };
  db.menuItems[index] = updated;
  writeDb(db);
  res.json(updated);
});

app.delete("/api/menu/:id", (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.menuItems = db.menuItems.filter((item) => item.id !== id);
  writeDb(db);
  res.status(204).send();
});

app.post("/api/menu/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: "No image uploaded" });
    return;
  }
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

app.put("/api/special", (req, res) => {
  const payload = req.body as Partial<TodaySpecial>;
  const db = readDb();
  db.todaySpecial = {
    title: payload.title ?? db.todaySpecial.title,
    description: payload.description ?? db.todaySpecial.description,
    price: typeof payload.price === "number" ? payload.price : db.todaySpecial.price,
    imageUrl: payload.imageUrl ?? db.todaySpecial.imageUrl,
  };
  writeDb(db);
  res.json(db.todaySpecial);
});

app.get("/api/orders", (_req, res) => {
  const db = readDb();
  res.json(db.orders);
});

app.post("/api/orders", (req, res) => {
  const payload = req.body as Partial<Order>;
  if (!payload.customerName || !payload.tableNumber || !payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
    res.status(400).json({ message: "Invalid order payload" });
    return;
  }
  const subtotal = payload.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));
  const order: Order = {
    id: `ORD-${Date.now().toString().slice(-6)}`,
    customerName: payload.customerName,
    tableNumber: payload.tableNumber,
    items: payload.items,
    subtotal,
    tax,
    total,
    status: "new",
    createdAt: new Date().toISOString(),
  };
  const db = readDb();
  db.orders.unshift(order);
  writeDb(db);
  res.status(201).json(order);
});

app.patch("/api/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status?: OrderStatus };
  if (!status) {
    res.status(400).json({ message: "Status is required" });
    return;
  }
  const db = readDb();
  const index = db.orders.findIndex((order) => order.id === id);
  if (index === -1) {
    res.status(404).json({ message: "Order not found" });
    return;
  }
  db.orders[index].status = status;
  writeDb(db);
  res.json(db.orders[index]);
});

app.get("/api/orders/:id/bill", (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const order = db.orders.find((entry) => entry.id === id);
  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  const bill = [
    "NOCTURNE CAFE",
    "====================",
    `Order ID: ${order.id}`,
    `Customer: ${order.customerName}`,
    `Table: ${order.tableNumber}`,
    `Created: ${new Date(order.createdAt).toLocaleString()}`,
    "--------------------",
    ...order.items.map((item) => `${item.quantity}x ${item.name} - Rs ${(item.quantity * item.price).toFixed(2)}`),
    "--------------------",
    `Subtotal: Rs ${order.subtotal.toFixed(2)}`,
    `Tax: Rs ${order.tax.toFixed(2)}`,
    `Total: Rs ${order.total.toFixed(2)}`,
  ].join("\n");

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Content-Disposition", `attachment; filename="${order.id}-bill.txt"`);
  res.send(bill);
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API server running on http://localhost:${port}`);
});
