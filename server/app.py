import os
import json
import uuid
import io
from datetime import datetime
from flask import Flask, request, jsonify, send_file, send_from_directory, make_response
from werkzeug.utils import secure_filename
from flask_cors import CORS

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

app = Flask(__name__)
CORS(app)

PORT = 4000
GEMINI_API_KEY = "AIzaSyCRFJtv4Y72junhpx6gCJDvch9VezNn5iY"

_SERVER_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH     = os.path.join(_SERVER_DIR, '..', 'data', 'db.json')
UPLOADS_DIR = os.path.join(_SERVER_DIR, '..', 'uploads')

os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

DEFAULT_DB = {
    "menuItems": [],
    "todaySpecial": {
        "title": "",
        "description": "",
        "price": 0.0,
        "imageUrl": ""
    },
    "orders": []
}

# ── DB helpers ──────────────────────────────────────────────────────────────
def read_db():
    if not os.path.exists(DB_PATH):
        write_db(DEFAULT_DB)
        return DEFAULT_DB
    with open(DB_PATH, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return dict(DEFAULT_DB)

def write_db(db):
    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2)

# ── Static uploads ───────────────────────────────────────────────────────────
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOADS_DIR, filename)

# ── Health ───────────────────────────────────────────────────────────────────
@app.route('/api/health')
def health():
    return jsonify({"ok": True})

# ── Menu ─────────────────────────────────────────────────────────────────────
@app.route('/api/menu', methods=['GET'])
def get_menu():
    db = read_db()
    return jsonify({
        "menuItems": db.get("menuItems", []),
        "todaySpecial": db.get("todaySpecial", {})
    })

@app.route('/api/menu', methods=['POST'])
def add_menu_item():
    data = request.json or {}
    if not data.get("name") or not data.get("category") or data.get("price") is None:
        return jsonify({"message": "name, category and price are required"}), 400

    db = read_db()
    new_item = {
        "id": str(uuid.uuid4()),
        "name": data["name"],
        "category": data["category"],          # "Coffee" | "Food"
        "price": float(data["price"]),
        "description": data.get("description", ""),
        "imageUrl": data.get("imageUrl", "")
    }
    db.setdefault("menuItems", []).insert(0, new_item)
    write_db(db)
    return jsonify(new_item), 201

@app.route('/api/menu/<item_id>', methods=['PUT'])
def update_menu_item(item_id):
    data = request.json or {}
    db = read_db()
    for i, item in enumerate(db.get("menuItems", [])):
        if item["id"] == item_id:
            db["menuItems"][i].update(data)
            write_db(db)
            return jsonify(db["menuItems"][i])
    return jsonify({"message": "Item not found"}), 404

@app.route('/api/menu/<item_id>', methods=['DELETE'])
def delete_menu_item(item_id):
    db = read_db()
    before = len(db.get("menuItems", []))
    db["menuItems"] = [i for i in db.get("menuItems", []) if i["id"] != item_id]
    if len(db["menuItems"]) == before:
        return jsonify({"message": "Item not found"}), 404
    write_db(db)
    return '', 204

@app.route('/api/menu/upload-image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"message": "No image uploaded"}), 400
    file = request.files['image']
    if not file.filename:
        return jsonify({"message": "No image selected"}), 400
    ext = os.path.splitext(secure_filename(file.filename))[1] or '.jpg'
    new_name = f"{int(datetime.now().timestamp()*1000)}-{uuid.uuid4().hex[:8]}{ext}"
    file.save(os.path.join(UPLOADS_DIR, new_name))
    return jsonify({"imageUrl": f"/uploads/{new_name}"})

# ── Today's Special ──────────────────────────────────────────────────────────
@app.route('/api/special', methods=['GET'])
def get_special():
    db = read_db()
    return jsonify(db.get("todaySpecial", {}))

@app.route('/api/special', methods=['PUT'])
def update_special():
    data = request.json or {}
    db = read_db()
    special = db.get("todaySpecial", {})
    title = data.get("title", special.get("title", ""))

    # ── AI description via Gemini ────────────────────────────────────────────
    description = data.get("description", special.get("description", ""))
    if data.get("generateAiDescription") and title:
        try:
            if GENAI_AVAILABLE:
                genai.configure(api_key=GEMINI_API_KEY)
                model = genai.GenerativeModel('gemini-1.5-flash')
                prompt = (
                    f"You are a premium restaurant copywriter. Write ONE irresistible, "
                    f"mouth-watering menu description (2-3 sentences max) for today's "
                    f"cafe special called '{title}'. Make it sound luxurious, sensory and "
                    f"tempting. Do not include price. Do not add bullet points or headers."
                )
                response = model.generate_content(prompt)
                description = response.text.strip()
            else:
                description = (
                    f"Indulge in our exquisite {title} — a masterfully crafted creation "
                    f"that blends rich flavours and the finest ingredients, served with love "
                    f"from our kitchen to your table."
                )
        except Exception as e:
            print(f"Gemini error: {e}")
            description = (
                f"Savour the essence of our {title}, a culinary gem prepared fresh daily "
                f"by our head chef — one bite and you'll understand why it's today's star."
            )

    db["todaySpecial"] = {
        "title": title,
        "description": description,
        "price": float(data.get("price", special.get("price", 0.0))),
        "imageUrl": data.get("imageUrl", special.get("imageUrl", ""))
    }
    write_db(db)
    return jsonify(db["todaySpecial"])

# ── Orders ───────────────────────────────────────────────────────────────────
@app.route('/api/orders', methods=['GET'])
def get_orders():
    db = read_db()
    return jsonify(db.get("orders", []))

@app.route('/api/orders', methods=['POST'])
def create_order():
    payload = request.json or {}
    if not payload.get("customerName") or not payload.get("tableNumber") or not payload.get("items"):
        return jsonify({"message": "Invalid order payload"}), 400

    subtotal = sum(float(i["price"]) * int(i["quantity"]) for i in payload["items"])
    tax    = round(subtotal * 0.05, 2)
    total  = round(subtotal + tax, 2)

    order = {
        "id": f"ORD-{str(int(datetime.now().timestamp()*1000))[-6:]}",
        "customerName": payload["customerName"],
        "tableNumber":  payload["tableNumber"],
        "items":        payload["items"],
        "subtotal":     subtotal,
        "tax":          tax,
        "total":        total,
        "status":       "new",
        "createdAt":    datetime.now().isoformat() + "Z"
    }
    db = read_db()
    db.setdefault("orders", []).insert(0, order)
    write_db(db)
    return jsonify(order), 201

@app.route('/api/orders/<order_id>/status', methods=['PATCH'])
def update_order_status(order_id):
    data   = request.json or {}
    status = data.get("status")
    if not status:
        return jsonify({"message": "Status required"}), 400
    db = read_db()
    for order in db.get("orders", []):
        if order["id"] == order_id:
            order["status"] = status
            write_db(db)
            return jsonify(order)
    return jsonify({"message": "Order not found"}), 404

# ── Bill – returns JSON for client-side PDF generation ───────────────────────
@app.route('/api/orders/<order_id>/bill', methods=['GET'])
def get_bill_data(order_id):
    db    = read_db()
    order = next((o for o in db.get("orders", []) if o["id"] == order_id), None)
    if not order:
        return jsonify({"message": "Order not found"}), 404
    return jsonify(order)

# ── NOVA Chatbot ─────────────────────────────────────────────────────────────
NOVA_SYSTEM_PROMPT = """
You are NOVA — Nocturne's Own Virtual Assistant — a warm, friendly and knowledgeable 
café chatbot for NOCTURNE CAFE. You ONLY answer questions related to:
- Our menu items (food and coffee), their prices, descriptions, categories
- Today's daily special
- How to place an order (enter name + table number, add items to cart)
- Order status (new → accepted → preparing → done)
- Café policies: we serve dine-in only, table service, 5% GST included
- General café info: we are open 8am–11pm, located at your city's heart
- Bill / receipt: available as PDF download after ordering

If asked anything UNRELATED to the café, menus, ordering, or food — politely say:
"I'm only trained to help with Nocturne Cafe questions! Ask me about our menu, 
today's special, or how to place your order. 🍵"

Keep answers SHORT (2-4 sentences max), friendly, and on-brand — slightly poetic 
and warm. Use 1 emoji per response. Menu context will be injected with each message.
"""

@app.route('/api/chat', methods=['POST'])
def nova_chat():
    payload = request.json or {}
    user_message = payload.get("message", "").strip()
    history = payload.get("history", [])   # list of {role, text}

    if not user_message:
        return jsonify({"reply": "Please type a message!"}), 400

    if not GENAI_AVAILABLE:
        return jsonify({"reply": "NOVA is currently unavailable. Please ask our staff!"}), 200

    # ── Build live menu context ──────────────────────────────────────────────
    db = read_db()
    items = db.get("menuItems", [])
    special = db.get("todaySpecial", {})

    menu_summary = "CURRENT MENU:\n"
    for item in items:
        menu_summary += f"- {item['name']} ({item['category']}) = Rs {item['price']:.2f}: {item.get('description','')}\n"

    if special.get("title"):
        menu_summary += f"\nTODAY'S SPECIAL: {special['title']} — Rs {special.get('price', 0):.2f}\n{special.get('description','')}\n"
    else:
        menu_summary += "\nNo special today.\n"

    system_with_menu = NOVA_SYSTEM_PROMPT.strip() + "\n\n" + menu_summary

    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel(
            model_name='gemini-1.5-flash',
            system_instruction=system_with_menu
        )

        # Build chat history for multi-turn
        gemini_history = []
        for turn in history[-10:]:   # last 10 turns max
            role = "user" if turn.get("role") == "user" else "model"
            gemini_history.append({"role": role, "parts": [turn.get("text", "")]})

        chat = model.start_chat(history=gemini_history)
        response = chat.send_message(user_message)
        reply = response.text.strip()

    except Exception as e:
        print(f"NOVA error: {e}")
        reply = "I'm having a little trouble right now. Please try again in a moment! ☕"

    return jsonify({"reply": reply})

if __name__ == '__main__':
    print(f"API server running -> http://localhost:{PORT}")
    app.run(port=PORT, host="0.0.0.0", debug=True)

