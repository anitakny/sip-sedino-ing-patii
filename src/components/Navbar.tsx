import React, { useState } from 'react';
import {
  Compass,
  Menu,
  X,
  Layers,
  ShoppingBag,
  Info,
  Phone
} from 'lucide-react';

interface NavbarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onNavigate
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'tentang', label: 'Tentang Kami', icon: Info },
    { id: 'wisata', label: 'Wisata & Rute', icon: Layers },
    { id: 'ekraf', label: 'Ekraf', icon: ShoppingBag },
    { id: 'kontak', label: 'Kontak', icon: Phone }
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-18 flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr] md:gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer group select-none md:justify-self-start"
        >
          <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-[#071736] via-[#0c2b64] to-[#1a56a4] text-white flex items-center justify-center shadow-md shadow-[#0c2b64]/30 group-hover:scale-105 transition-transform border border-[#38bdf8]/30">
            <Compass className="w-5 h-5 text-[#38bdf8]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                SIP<span className="text-[#1a56a4] dark:text-[#38bdf8]">PATI</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium tracking-wide">
              Sedina ing Pati & Ekraf
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`min-h-[38px] flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0c2b64] text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-200 hover:text-[#0c2b64] dark:hover:text-[#38bdf8] hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#38bdf8]' : 'text-slate-600 dark:text-slate-300'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Tools (Mobile Menu & Desktop Centering Spacer) */}
        <div className="flex items-center justify-end md:justify-self-end">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 rounded-xl text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full min-h-[46px] flex items-center justify-between p-3 rounded-xl text-sm font-bold transition ${
                  isActive
                    ? 'bg-[#0c2b64] text-white'
                    : 'text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {isActive && <span className="text-[11px] uppercase font-bold">Aktif</span>}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
