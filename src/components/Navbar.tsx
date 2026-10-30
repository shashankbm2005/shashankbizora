import React, { useState } from 'react';
import { Menu, X, ArrowRight, MessageSquare } from 'lucide-react';
import { getWhatsAppUrl } from '../data/servicesData.ts';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenConsultation: (preselectedService?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenConsultation,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Strict 3-Zone Top Bar with Responsive Gaps */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 md:gap-8 h-16 sm:h-20">
          {/* Zone 1: Brand Wordmark (Shrink-resistant) */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 sm:gap-2.5 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md py-1 shrink-0"
            aria-label="BIZORA Homepage"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-xs shrink-0">
              B
            </div>
            <div className="shrink-0">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 block leading-tight">
                BIZORA
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-slate-600" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 text-[15px] ${
                    isActive
                      ? 'border-blue-600 text-blue-600 font-semibold'
                      : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="hidden sm:flex items-center gap-2.5 md:gap-3 shrink-0">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors whitespace-nowrap min-h-[40px]"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>WhatsApp</span>
            </a>
            <button
              onClick={() => onOpenConsultation()}
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer min-h-[40px]"
            >
              <span>Get Free Consultation</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>

          {/* Mobile Menu & Quick Consultation Button (320px+ safe) */}
          <div className="flex sm:hidden items-center gap-1.5 xs:gap-2 shrink-0">
            <button
              onClick={() => onOpenConsultation()}
              className="px-2.5 xs:px-3 py-2 text-[11px] xs:text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors min-h-[40px] cursor-pointer"
            >
              Consult
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-700 hover:text-slate-900 rounded-lg border border-slate-200 active:bg-slate-100 transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/98 backdrop-blur-md border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`w-full text-left py-3 px-3 rounded-lg text-base font-medium transition-colors ${
                currentTab === link.id
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Chat on WhatsApp (+91 8147827430)
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenConsultation();
              }}
              className="w-full py-3 px-4 text-center text-sm font-semibold text-white bg-blue-600 rounded-lg"
            >
              Get a Free Consultation
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
