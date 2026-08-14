"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";
import { canViewTeam, cn } from "@/lib/utils";
import type { Profile } from "@/types";

const links = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/path/atencion-al-cliente", label: "Ruta", icon: BookOpen },
  { href: "/simulator", label: "Simulador", icon: MessageSquare },
  { href: "/phrases", label: "Frases", icon: Sparkles },
  { href: "/team", label: "Equipo", icon: Users, teamOnly: true },
];

export function AppShell({
  profile,
  companyName,
  children,
  onLogout,
}: {
  profile: Profile;
  companyName: string;
  children: React.ReactNode;
  onLogout?: () => void;
}) {
  const pathname = usePathname();
  const visible = links.filter((l) => !l.teamOnly || canViewTeam(profile.role));

  return (
    <div className="min-h-screen bg-[var(--sand)]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_rgba(10,77,104,0.08),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(245,183,0,0.12),_transparent_45%)]" />
      <header className="sticky top-0 z-40 border-b border-teal-900/8 bg-[var(--sand)]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-teal-900">
              atende<span className="text-amber-500">BR</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {visible.map((link) => {
              const Icon = link.icon;
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-teal-900 text-white"
                      : "text-teal-900/70 hover:bg-teal-900/5 hover:text-teal-950",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-teal-950">{profile.full_name}</p>
              <p className="text-xs text-teal-900/55">{companyName}</p>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-teal-900/10 bg-white text-teal-900 hover:bg-teal-50"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-3 md:hidden">
          {visible.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold",
                  active ? "bg-teal-900 text-white" : "bg-white text-teal-900",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
