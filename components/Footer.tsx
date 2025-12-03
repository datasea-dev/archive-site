import Link from "next/link";
import Image from "next/image";
import { Laptop, ExternalLink, Instagram, Linkedin, Github } from "lucide-react";

// Ikon TikTok Custom
const TiktokIcon = ({ size = 18, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const waNumber = "628xxxxxxxxxxx"; 
  const waMessage = "Halo Divisi IT DATASEA, saya ingin melaporkan masalah/bug pada website:";

  return (
    <footer className="bg-[#222F4D] text-white mt-auto border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        
        {/* GRID UTAMA */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-8">
          
          {/* 1. PILAR BRAND IDENTITY */}
          <div className="lg:col-span-1 space-y-4 pt-4 lg:pt-0">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 bg-white rounded-lg p-1">
                <Image
                  src="/logo-datasea.png"
                  alt="Logo DATASEA"
                  fill
                  className="object-contain p-0.5"
                  sizes="40px"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight leading-none text-white">
                  DATASEA
                </span>
                <span className="font-light text-sm text-blue-200 leading-none">
                  Archive
                </span>
              </div>
            </div>
            
            <p className="text-blue-200 text-sm leading-relaxed pr-4 max-w-sm">
              Platform arsip digital terintegrasi untuk komunitas Sains Data UTY. 
              Menyimpan pengetahuan untuk masa depan.
            </p>

            {/* LISENSI CC */}
            <div className="pt-2">
              <a 
                href="https://creativecommons.org/licenses/by-nc-nd/4.0/deed.id"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-block" 
              >
                <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl border border-white/20 transition-all hover:bg-white/20 hover:border-white/30 hover:shadow-lg hover:shadow-blue-900/20 cursor-pointer w-fit">
                  <span className="text-sm font-bold text-white tracking-tight">
                    CC BY-NC-ND
                  </span>
                  <div className="flex gap-1">
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-white text-[#222F4D]">BY</span>
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-900/60 text-white border border-white/20">NC</span>
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-900/60 text-white border border-white/20">ND</span>
                  </div>
                </div>
              </a>
            </div>

          </div>

          {/* 2. MENU UTAMA */}
          <div className="grid grid-cols-2 gap-8 lg:gap-8 lg:col-span-2">
            
            {/* 2A. PILAR MENU */}
            <div className="col-span-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-300 mb-4">Menu Utama</h3>
              <ul className="space-y-2.5 text-sm text-blue-100"> 
                <li><Link href="/" className="hover:text-white hover:translate-x-1 transition-all inline-block">Beranda</Link></li>
                <li><Link href="/materi" className="hover:text-white hover:translate-x-1 transition-all inline-block">Materi</Link></li>
                <li><Link href="/jurnal" className="hover:text-white hover:translate-x-1 transition-all inline-block">Jurnal</Link></li>
                <li><Link href="/peralatan" className="hover:text-white hover:translate-x-1 transition-all inline-block">Peralatan</Link></li>
              </ul>
            </div>

            {/* 2B. PILAR KONEKSI */}
            <div className="col-span-1 space-y-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-300 mb-4">Akses Cepat</h3>
                <ul className="space-y-3 text-sm text-blue-100">
                  <li>
                    <a href="https://elearning.uty.ac.id" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-2 group">
                      <ExternalLink size={14} className="text-blue-400 group-hover:text-white transition-colors" /> <span className="truncate">E-Learning UTY</span>
                    </a>
                  </li>
                  <li>
                    <a href="https://uty.ac.id" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-2 group">
                      <ExternalLink size={14} className="text-blue-400 group-hover:text-white transition-colors" /> <span className="truncate">Web UTY</span>
                    </a>
                  </li>
                  <li>
                    {/* LINK KOSONG -> ARAH KE 404 */}
                    <a href="/404" className="hover:text-white flex items-center gap-2 group">
                      <ExternalLink size={14} className="text-blue-400 group-hover:text-white transition-colors" /> <span className="truncate">Web Resmi</span>
                    </a>
                  </li>
                </ul>
              </div>

              {/* Sosial Media (Desktop) */}
              <div className="hidden sm:block"> 
                 <h3 className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-3">Sosial Media</h3>
                 <div className="flex gap-3">
                   <SocialIcon icon={<Instagram size={18}/>} />
                   <SocialIcon icon={<Linkedin size={18}/>} />
                   <SocialIcon icon={<TiktokIcon size={18}/>} />
                   <SocialIcon icon={<Github size={18}/>} />
                 </div>
              </div>
            </div>
            
          </div>

          {/* Mobile Sosmed (HP Only) */}
          <div className="col-span-1 lg:hidden flex justify-between items-center border-t border-white/5 pt-6 mt-2">
              <span className="text-xs font-bold text-blue-300 uppercase">Ikuti Kami</span>
              <div className="flex gap-3">
                 <SocialIcon icon={<Instagram size={18}/>} />
                 <SocialIcon icon={<Linkedin size={18}/>} />
                 <SocialIcon icon={<TiktokIcon size={18}/>} />
                 <SocialIcon icon={<Github size={18}/>} />
              </div>
          </div>

          {/* 4. PILAR DUKUNGAN */}
          <div className="lg:col-span-1 border-t border-white/5 pt-8 lg:pt-0 mt-8 lg:mt-0"> 
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-300 mb-4">Pusat Bantuan</h3>
            <div className="bg-blue-900/30 border border-blue-500/20 rounded-2xl p-5 backdrop-blur-sm">
              <p className="text-xs text-blue-200 mb-4 leading-relaxed">
                Ada kendala akses atau bug?
              </p>
              
              <a 
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/50 group active:scale-95"
              >
                <Laptop size={18} className="group-hover:scale-110 transition-transform" />
                <span>Hubungi IT Support</span>
              </a>
              
              <div className="mt-3 flex justify-center text-[10px] text-blue-400 gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 mt-0.5 animate-pulse"></span>
                Online 24 Jam
              </div>
            </div>
          </div>

        </div>

        {/* COPYRIGHT BAR */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col items-center justify-center gap-2 text-xs text-blue-300 text-center">
          <p>© {currentYear} DATASEA Community. All rights reserved.</p> 
          <p className="opacity-80">
            Dibuat oleh <span className="text-white font-medium">Divisi IT</span>
          </p>
        </div>

      </div>
    </footer>
  );
}

// --- HELPER FUNCTIONS ---

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    // DISINI SETTINGNYA: Link kosong diarahkan ke 404
    <Link href="/404" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-blue-200 hover:text-white transition-all border border-transparent hover:border-white/20 flex items-center justify-center">
      {icon}
    </Link>
  );
}