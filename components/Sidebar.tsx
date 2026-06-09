"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  FileText, 
  TrendingUp, 
  Settings, 
  LogOut,
  Egg,
  Package
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Kualitas Telur", icon: ClipboardCheck, href: "/egg-quality" },
  { name: "Log Harian Kandang", icon: FileText, href: "/daily-logs" },
  { name: "Laporan", icon: FileText, href: "/reports" },
];

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <div className={`flex h-full w-full lg:w-64 flex-col bg-gray-900 text-white ${className || ""}`}>
      <div className="hidden lg:flex h-20 shrink-0 items-center justify-center border-b border-gray-800">
        <Egg className="mr-2 h-8 w-8 text-yellow-500" />
        <span className="text-xl font-bold tracking-wider">POULTRY APP</span>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1 px-3 py-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors touch-manipulation ${
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 shrink-0 ${
                  isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center mb-4 px-3">
          <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
            {session.user?.name?.[0] || "U"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{session.user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-colors touch-manipulation"
        >
          <LogOut className="mr-3 h-5 w-5 shrink-0" />
          Keluar
        </button>
      </div>
    </div>
  );
}