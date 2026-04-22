import { useState } from "react";
import { useAuth, type UserRole } from "../auth/AuthContext";

export default function AuthPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    if (!email || !password || (mode === "signup" && !name)) {
      setError("Please fill all required fields.");
      return;
    }
    if (mode === "login") {
      const result = login(email, password);
      if (!result.ok) setError(result.message ?? "Unable to login.");
      return;
    }
    const result = signup({ name, email, password, role });
    if (!result.ok) setError(result.message ?? "Unable to signup.");
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-surface-container border border-outline-variant/40 rounded-2xl p-8">
          <h1 className="font-serif text-4xl text-primary-container mb-2">Cafe Access</h1>
          <p className="text-on-surface-variant mb-8">Use dummy credentials now; replace with real credentials later.</p>

          <div className="flex gap-2 mb-6">
            <button
              className={`px-4 py-2 rounded-lg text-sm ${mode === "login" ? "bg-primary-container text-on-primary-container" : "bg-surface text-on-surface-variant"}`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm ${mode === "signup" ? "bg-primary-container text-on-primary-container" : "bg-surface text-on-surface-variant"}`}
              onClick={() => setMode("signup")}
            >
              Signup
            </button>
          </div>

          <div className="space-y-4">
            {mode === "signup" ? (
              <input className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 outline-none focus:border-primary-container" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            ) : null}
            <input className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 outline-none focus:border-primary-container" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 outline-none focus:border-primary-container" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="flex gap-2">
              <button className={`flex-1 py-2 rounded-lg border ${role === "customer" ? "border-primary-container text-primary-container" : "border-outline-variant text-on-surface-variant"}`} onClick={() => setRole("customer")}>
                Customer
              </button>
              <button className={`flex-1 py-2 rounded-lg border ${role === "chef" ? "border-primary-container text-primary-container" : "border-outline-variant text-on-surface-variant"}`} onClick={() => setRole("chef")}>
                Chef
              </button>
            </div>
            {error ? <p className="text-error text-sm">{error}</p> : null}
            <button className="w-full bg-primary-container text-on-primary-container py-3 rounded-lg font-semibold" onClick={submit}>
              {mode === "login" ? "Login" : "Create Account"}
            </button>
          </div>
        </section>

        <section className="bg-surface-container border border-outline-variant/40 rounded-2xl p-8 space-y-5">
          <h2 className="font-serif text-2xl text-on-surface">Dummy Accounts</h2>
          <div className="bg-surface p-4 rounded-lg border border-outline-variant/40">
            <p className="text-sm text-primary-container font-semibold">Customer Login</p>
            <p className="text-sm text-on-surface-variant mt-1">Email: customer@demo.com</p>
            <p className="text-sm text-on-surface-variant">Password: customer123</p>
          </div>
          <div className="bg-surface p-4 rounded-lg border border-outline-variant/40">
            <p className="text-sm text-primary-container font-semibold">Chef Login</p>
            <p className="text-sm text-on-surface-variant mt-1">Email: chef@demo.com</p>
            <p className="text-sm text-on-surface-variant">Password: chef123</p>
          </div>
          <p className="text-xs text-on-surface-variant">Customer sees customer pages only (menu-first). Chef sees chef operations pages only.</p>
        </section>
      </div>
    </div>
  );
}
