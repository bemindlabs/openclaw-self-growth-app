import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  RotateCcw,
  BookOpen,
  Target,
  Search,
  Settings,
  Sparkles,
  MessageCircle,
  CheckSquare,
  Heart,
  Trophy,
  PenLine,
  HelpCircle,
  Wallet,
  ListTodo,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "../ui/Logo";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/goals", icon: Trophy, label: "Goals" },
  { to: "/todos", icon: ListTodo, label: "Todos" },
  { to: "/habits", icon: CheckSquare, label: "Habits" },
  { to: "/routines", icon: RotateCcw, label: "Routines" },
  { to: "/health", icon: Heart, label: "Health" },
  { to: "/checkups", icon: ClipboardList, label: "Checkups" },
  { to: "/skills", icon: Target, label: "Skills" },
  { to: "/learning", icon: BookOpen, label: "Learning" },
  { to: "/journal", icon: PenLine, label: "Journal" },
  { to: "/chat", icon: MessageCircle, label: "Chat" },
  { to: "/stories", icon: Sparkles, label: "Stories" },
  { to: "/ledger", icon: Wallet, label: "Ledger" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/settings", icon: Settings, label: "Settings" },
  { to: "/get-started", icon: HelpCircle, label: "Get Started" },
];

export default function AppShell() {
  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card safe-area-top">
        <div className="p-4 border-b border-border">
          <Logo />
          <p className="text-[10px] text-muted-foreground mt-1 px-1">Self Development Platform</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-14">
          <Outlet />
        </div>
        <footer className="hidden md:block border-t border-border bg-card px-4 py-2 text-center">
          <p className="text-[11px] text-muted-foreground">
            Powered by Bemind Technology Co.,Ltd. (Bemindlabs) &middot; v0.1.0
          </p>
        </footer>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom">
        <p className="text-[9px] text-muted-foreground text-center pt-1">
          Powered by Bemind Technology Co.,Ltd. (Bemindlabs) &middot; v0.1.0
        </p>
        <div className="flex justify-around py-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
