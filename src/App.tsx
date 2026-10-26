import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { EnquiryModal } from './components/EnquiryModal.tsx';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton.tsx';
import { AiChatbotAssistant } from './components/AiChatbotAssistant.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { ServicesPage } from './pages/ServicesPage.tsx';
import { HowItWorksPage } from './pages/HowItWorksPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { PrivacyPage } from './pages/PrivacyPage.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '').trim();
    return hash || 'home';
  });

  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<string | undefined>();

  // Sync hash on navigation
  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to hash changes (e.g., back/forward buttons)
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash) {
        setCurrentTab(hash);
      } else {
        setCurrentTab('home');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleOpenConsultation = (serviceId?: string) => {
    setPreselectedService(serviceId);
    setIsConsultationOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenConsultation={() => handleOpenConsultation()}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            onOpenConsultation={handleOpenConsultation}
            onNavigate={handleNavigate}
          />
        )}
        {currentTab === 'services' && (
          <ServicesPage onOpenConsultation={handleOpenConsultation} />
        )}
        {currentTab === 'how-it-works' && (
          <HowItWorksPage onOpenConsultation={() => handleOpenConsultation()} />
        )}
        {currentTab === 'about' && (
          <AboutPage onOpenConsultation={() => handleOpenConsultation()} />
        )}

        {currentTab === 'contact' && (
          <ContactPage
            onOpenConsultation={() => handleOpenConsultation()}
            onNavigateToPrivacy={() => handleNavigate('privacy')}
          />
        )}
        {currentTab === 'privacy' && (
          <PrivacyPage onBack={() => handleNavigate('home')} />
        )}
        {currentTab === 'admin' && (
          <AdminDashboard onBackToSite={() => handleNavigate('home')} />
        )}
      </main>

      {/* Consultation Enquiry Modal */}
      <EnquiryModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
        preselectedService={preselectedService}
        onNavigateToPrivacy={() => {
          setIsConsultationOpen(false);
          handleNavigate('privacy');
        }}
      />

      {/* Floating WhatsApp Quick Action & AI Chatbot Assistant */}
      {currentTab !== 'admin' && (
        <>
          <WhatsAppFloatingButton />
          <AiChatbotAssistant onOpenConsultation={handleOpenConsultation} />
        </>
      )}

      {/* Site Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenConsultation={() => handleOpenConsultation()}
        onOpenAdmin={() => handleNavigate('admin')}
      />
    </div>
  );
}
