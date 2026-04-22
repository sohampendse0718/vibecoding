import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type UserRole = "customer" | "chef";

type AuthUser = {
  name: string;
  email: string;
  role: UserRole;
};

type StoredUser = AuthUser & {
  password: string;
};

type SignupInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

type AuthContextValue = {
  currentUser: AuthUser | null;
  login: (email: string, password: string) => { ok: boolean; message?: string };
  signup: (input: SignupInput) => { ok: boolean; message?: string };
  logout: () => void;
};

const USERS_KEY = "vibecafe-users";
const CURRENT_KEY = "vibecafe-current-user";

const seedUsers: StoredUser[] = [
  { name: "Demo Customer", email: "customer@demo.com", password: "customer123", role: "customer" },
  { name: "Demo Chef", email: "chef@demo.com", password: "chef123", role: "chef" },
];

const AuthContext = createContext<AuthContextValue | null>(null);

function readUsers(): StoredUser[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
    return seedUsers;
  }
  try {
    return JSON.parse(raw) as StoredUser[];
  } catch {
    localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
    return seedUsers;
  }
}

function readCurrentUser(): AuthUser | null {
  const raw = localStorage.getItem(CURRENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<StoredUser[]>(() => readUsers());
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => readCurrentUser());

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      login: (email, password) => {
        const found = users.find((user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password);
        if (!found) return { ok: false, message: "Invalid email or password" };
        const sessionUser: AuthUser = { name: found.name, email: found.email, role: found.role };
        setCurrentUser(sessionUser);
        localStorage.setItem(CURRENT_KEY, JSON.stringify(sessionUser));
        return { ok: true };
      },
      signup: (input) => {
        const already = users.some((user) => user.email.toLowerCase() === input.email.toLowerCase());
        if (already) return { ok: false, message: "Email already exists" };
        const newUser: StoredUser = {
          name: input.name.trim(),
          email: input.email.trim(),
          password: input.password,
          role: input.role,
        };
        const nextUsers = [...users, newUser];
        setUsers(nextUsers);
        localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
        const sessionUser: AuthUser = { name: newUser.name, email: newUser.email, role: newUser.role };
        setCurrentUser(sessionUser);
        localStorage.setItem(CURRENT_KEY, JSON.stringify(sessionUser));
        return { ok: true };
      },
      logout: () => {
        setCurrentUser(null);
        localStorage.removeItem(CURRENT_KEY);
      },
    }),
    [currentUser, users],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
