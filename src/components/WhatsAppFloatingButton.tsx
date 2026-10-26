import React from 'react';
import { MessageSquare } from 'lucide-react';
import { getWhatsAppUrl } from '../data/servicesData.ts';

export const WhatsAppFloatingButton: React.FC = () => {
  return (
    <aside aria-label="Direct WhatsApp Contact" className="fixed bottom-6 left-6 z-40">
      <a
        href={getWhatsAppUrl(
          'Hello BIZORA, I would like to discuss digital solutions for my business. Please share the details.'
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 min-h-[48px]"
        aria-label="Chat with BIZORA Founder on WhatsApp (+91 8147827430)"
      >
        <MessageSquare className="w-5 h-5 text-white" />
        <span className="text-xs font-bold tracking-wide hidden sm:inline whitespace-nowrap">
          Chat on WhatsApp
        </span>
      </a>
    </aside>
  );
};
