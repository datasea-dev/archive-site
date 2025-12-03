"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          // PERUBAHAN STYLE:
          // 1. w-14 h-14: Ukuran tombol lebih besar di HP (56px)
          // 2. bg-blue-600: Warna biru lebih terang/mencolok
          // 3. shadow-2xl: Bayangan lebih tebal agar terlihat melayang
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 flex items-center justify-center w-12 h-12 md:w-12 md:h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-2xl border-2 border-white/20 transition-all duration-300 animate-in fade-in zoom-in hover:-translate-y-1 active:scale-90"
        >
          {/* Ikon diperbesar sedikit di HP */}
          <ArrowUp className="w-7 h-7 md:w-5 md:h-5" strokeWidth={3} />
        </button>
      )}
    </>
  );
}