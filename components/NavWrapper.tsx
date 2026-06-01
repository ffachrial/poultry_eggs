"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";

export default function NavWrapper({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close sidebar when route changes using derived state pattern
  // to avoid cascading renders in useEffect
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  // Prevent scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex" />

      {/* Mobile Header */}
      <header className="lg:hidden flex h-16 items-center justify-between border-b bg-white px-4 sticky top-0 z-30">
        <button
          onClick={() => setIsOpen(true)}
          className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg touch-manipulation"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="text-lg font-bold text-gray-900 tracking-tight">POULTRY APP</span>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </header>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col transform bg-gray-900 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-800 px-4">
          <span className="text-xl font-bold text-white tracking-wider">MENU</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-3 text-gray-400 hover:text-white rounded-lg touch-manipulation"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <Sidebar className="w-full h-full" />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}