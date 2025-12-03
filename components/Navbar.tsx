"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, GitBranch } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* 1. KIRI: LOGO & BRAND */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 transition-transform group-hover:scale-105">
              <Image
                src="/logo-datasea.png"
                alt="Logo DATASEA"
                fill
                priority
                className="object-contain"
                sizes="40px"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-datasea-main leading-none tracking-tight">
                DATASEA
              </span>
              <span className="font-light text-sm text-gray-500 leading-none">
                Archive
              </span>
            </div>
          </Link>

          {/* 2. TENGAH: MENU (Hanya muncul jika BUKAN Home) */}
          {!isHomePage && (
            <div className="hidden md:flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
              <NavLink href="/" label="Beranda" active={pathname === "/"} />
              <NavLink href="/materi" label="Arsip Materi" active={pathname === "/materi"} />
              <NavLink href="/jurnal" label="Arsip Jurnal" active={pathname === "/jurnal"} />
              <NavLink href="/peralatan" label="Peralatan" active={pathname === "/peralatan"} />
            </div>
          )}

          {/* 3. KANAN: VERSI & MOBILE MENU (Updated Mobile Responsive) */}
          <div className="flex items-center gap-3">
            
            {/* Indikator Versi (Git Style) - Responsif HP & Laptop */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full bg-gray-50 border border-gray-200 text-[10px] md:text-xs font-medium text-gray-500 hover:text-datasea-main hover:border-datasea-main/30 transition-colors cursor-default">
              <GitBranch className="w-3 h-3 md:w-3.5 md:h-3.5" />
              <span>v1.0.0</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-0.5 md:ml-1"></span>
            </div>

            {/* Tombol Mobile Hamburger (Muncul jika BUKAN Home) */}
            {!isHomePage && (
              <div className="md:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-1.5 text-gray-500 hover:text-datasea-main focus:outline-none bg-gray-50 rounded-md border border-gray-200 ml-1"
                >
                  {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 4. MOBILE DROPDOWN */}
      {!isHomePage && isOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-lg animate-in slide-in-from-top-5 duration-200">
          <div className="px-4 py-4 space-y-2">
            <MobileLink href="/" label="Beranda" onClick={() => setIsOpen(false)} active={pathname === "/"} />
            <MobileLink href="/materi" label="Arsip Materi" onClick={() => setIsOpen(false)} active={pathname === "/materi"} />
            <MobileLink href="/jurnal" label="Arsip Jurnal" onClick={() => setIsOpen(false)} active={pathname === "/jurnal"} />
            <MobileLink href="/peralatan" label="Peralatan" onClick={() => setIsOpen(false)} active={pathname === "/peralatan"} />
          </div>
        </div>
      )}
    </nav>
  );
}

// Komponen Helper
function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-datasea-main/5 text-datasea-main"
          : "text-gray-500 hover:text-datasea-main hover:bg-gray-50"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileLink({ href, label, onClick, active }: { href: string; label: string; onClick: () => void; active: boolean }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-4 py-3 rounded-lg text-base font-medium ${
        active
          ? "bg-datasea-main/5 text-datasea-main border-l-4 border-datasea-main"
          : "text-gray-600 hover:bg-gray-50 hover:text-datasea-main"
      }`}
    >
      {label}
    </Link>
  );
}