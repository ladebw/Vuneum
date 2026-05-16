"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Shield,
  FileText,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Settings,
  Users,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  role: string;
  username: string;
}

export default function Sidebar({ role, username }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("light", next === "light");
  };

  const isActive = (path: string) => pathname.startsWith(path);

  const links: { href: string; label: string; icon: React.ReactNode; roles: string[] }[] = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      roles: ["RESEARCHER", "COMPANY", "TRIAGER", "ADMIN"],
    },
    {
      href: "/programs",
      label: "Programs",
      icon: <Shield size={20} />,
      roles: ["RESEARCHER", "COMPANY", "TRIAGER", "ADMIN"],
    },
    {
      href: "/reports",
      label: "Reports",
      icon: <FileText size={20} />,
      roles: ["RESEARCHER", "COMPANY", "TRIAGER", "ADMIN"],
    },
    {
      href: "/disputes",
      label: "Disputes",
      icon: <AlertTriangle size={20} />,
      roles: ["RESEARCHER", "COMPANY", "TRIAGER", "ADMIN"],
    },
    {
      href: "/payouts",
      label: "Payouts",
      icon: <DollarSign size={20} />,
      roles: ["RESEARCHER", "COMPANY", "ADMIN"],
    },
    {
      href: "/transparency",
      label: "Transparency",
      icon: <BarChart3 size={20} />,
      roles: ["RESEARCHER", "COMPANY", "TRIAGER", "ADMIN"],
    },
    {
      href: "/admin",
      label: "Admin",
      icon: <Users size={20} />,
      roles: ["ADMIN"],
    },
    {
      href: "/settings",
      label: "Settings",
      icon: <Settings size={20} />,
      roles: ["RESEARCHER", "COMPANY", "TRIAGER", "ADMIN"],
    },
  ];

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-60"
      } h-screen bg-[var(--surface)] border-r border-[var(--border)] flex flex-col transition-all duration-200 fixed left-0 top-0 z-40`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-[var(--border)]">
        <button onClick={() => setCollapsed(!collapsed)} className="mr-3 text-[var(--muted)] hover:text-[var(--foreground)]">
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
        {!collapsed && (
          <Link href="/dashboard" className="text-xl font-bold tracking-tight">
            <span className="text-[var(--accent)]">Vun</span>
            <span>eum</span>
          </Link>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {links
          .filter((l) => l.roles.includes(role))
          .map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(link.href)
                  ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5"
              }`}
            >
              {link.icon}
              {!collapsed && <span>{link.label}</span>}
            </Link>
          ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[var(--border)] p-3 space-y-2">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
        </button>
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--danger)] hover:bg-white/5"
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </Link>
        {!collapsed && (
          <div className="px-3 pt-2 text-xs text-[var(--muted)]">
            Signed in as <span className="text-[var(--foreground)] font-medium">{username}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
