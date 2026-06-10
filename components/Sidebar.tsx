"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  FileText, 
  TrendingUp, 
  Settings, 
  LogOut,
  Egg,
  Package,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Wallet,
  ShoppingCart
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

interface MenuItem {
  name: string;
  icon: React.ElementType;
  href?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Kualitas Telur", icon: ClipboardCheck, href: "/egg-quality" },
  { name: "Log Harian Kandang", icon: FileText, href: "/daily-logs" },
  { name: "Penjualan Telur", icon: ShoppingCart, href: "/sales" },
  { name: "Keuangan", icon: Wallet, href: "/finance" },
  { 
    name: "Laporan", 
    icon: FileText, 
    children: [
      { name: "Penjualan Telur", icon: ShoppingCart, href: "/reports/sales" },
      { name: "Kualitas Telur", icon: ClipboardCheck, href: "/reports" },
      { 
        name: "Grafik", 
        icon: BarChart3,
        children: [
          { name: "Penjualan Telur", icon: TrendingUp, href: "/reports/charts/sales" },
          { name: "Kualitas Telur", icon: TrendingUp, href: "/reports/charts/revenue" },
        ]
      },
    ] 
  },
];

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  // Auto-open menus based on current pathname
  useEffect(() => {
    const findAndOpenParent = (items: MenuItem[], path: string, parents: string[] = []): boolean => {
      for (const item of items) {
        if (item.href === path) return true;
        if (item.children) {
          if (findAndOpenParent(item.children, path, [...parents, item.name])) {
            setOpenMenus(prev => Array.from(new Set([...prev, item.name, ...parents])));
            return true;
          }
        }
      }
      return false;
    };
    findAndOpenParent(menuItems, pathname);
  }, [pathname]);

  if (!session) return null;

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => 
      prev.includes(name) 
        ? prev.filter(n => n !== name) 
        : [...prev, name]
    );
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus.includes(item.name);
    const isActive = item.href ? pathname === item.href : false;
    const isChildActive = item.children?.some(child => 
      child.href === pathname || child.children?.some(c => c.href === pathname)
    );

    return (
      <div key={item.name} className="flex flex-col">
        {item.href ? (
          <Link
            href={item.href}
            className={`group flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors touch-manipulation ${
              isActive
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            } ${depth > 0 ? "ml-4" : ""}`}
          >
            <item.icon
              className={`mr-3 h-4 w-4 shrink-0 ${
                isActive ? "text-white" : "text-gray-400 group-hover:text-white"
              }`}
            />
            <span className="flex-1">{item.name}</span>
          </Link>
        ) : (
          <button
            onClick={() => toggleMenu(item.name)}
            className={`group flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors touch-manipulation ${
              isChildActive ? "text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
            } ${depth > 0 ? "ml-4" : ""}`}
          >
            <item.icon
              className={`mr-3 h-4 w-4 shrink-0 ${
                isChildActive ? "text-white" : "text-gray-400 group-hover:text-white"
              }`}
            />
            <span className="flex-1 text-left">{item.name}</span>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        
        {hasChildren && isOpen && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex h-full w-full lg:w-64 flex-col bg-gray-900 text-white ${className || ""}`}>
      <div className="hidden lg:flex h-20 shrink-0 items-center justify-center border-b border-gray-800">
        <Egg className="mr-2 h-8 w-8 text-yellow-500" />
        <span className="text-xl font-bold tracking-wider">POULTRY APP</span>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1 px-3 py-6">
        {menuItems.map((item) => renderMenuItem(item))}
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