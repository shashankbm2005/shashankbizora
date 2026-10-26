import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Phone, MessageSquare } from 'lucide-react';
import { BIZORA_PHONE, getWhatsAppUrl } from '../data/servicesData.ts';

export interface SlideData {
  id: number;
  topic: string;
  image: string;
  fallbackGradient: string;
  headline: string;
  description: string;
  primaryBtnText: string;
  primaryAction: 'consultation' | 'service';
  serviceTarget?: string;
  secondaryBtnText: string;
  secondaryAction: 'navigate' | 'call' | 'whatsapp' | 'consultation';
  navigateTarget?: string;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    topic: 'Digital Transformation',
    image: '/images/slide1.jpg',
    fallbackGradient: 'from-blue-900 via-slate-900 to-slate-950',
    headline: 'Transform Your Business for the Digital World',
    description: 'Bring your business online, reach more customers and grow with BIZORA.',
    primaryBtnText: 'Get Started',
    primaryAction: 'consultation',
    secondaryBtnText: 'Explore Solutions',
    secondaryAction: 'navigate',
    navigateTarget: 'services',
  },
  {
    id: 2,
    topic: 'Local Business Growth',
    image: '/images/slide2.jpg',
    fallbackGradient: 'from-amber-900 via-slate-900 to-slate-950',
    headline: 'Your Business Deserves to Be Seen',
    description: 'Build your online presence and help customers discover your business.',
    primaryBtnText: 'Create Your Business Profile',
    primaryAction: 'consultation',
    secondaryBtnText: 'Learn More',
    secondaryAction: 'navigate',
    navigateTarget: 'how-it-works',
  },
  {
    id: 3,
    topic: 'Smart Booking and Appointments',
    image: '/images/slide3.jpg',
    fallbackGradient: 'from-emerald-900 via-slate-900 to-slate-950',
    headline: 'Simplify Bookings. Save Time.',
    description: 'Make it easier for customers to discover your services and request appointments.',
    primaryBtnText: 'Explore Booking Solutions',
    primaryAction: 'service',
    serviceTarget: 'appointment_enquiry',
    secondaryBtnText: 'Get Started',
    secondaryAction: 'consultation',
  },
  {
    id: 4,
    topic: 'Digital Retail and Products',
    image: '/images/slide4.jpg',
    fallbackGradient: 'from-indigo-900 via-slate-900 to-slate-950',
    headline: 'Take Your Products Online',
    description: 'Showcase your products, share prices and connect with potential buyers.',
    primaryBtnText: 'Showcase Your Products',
    primaryAction: 'service',
    serviceTarget: 'digital_catalogue',
    secondaryBtnText: 'Join BIZORA',
    secondaryAction: 'consultation',
  },
  {
    id: 5,
    topic: 'Technology and Innovation',
    image: '/images/slide5.jpg',
    fallbackGradient: 'from-purple-900 via-slate-900 to-slate-950',
    headline: 'Technology That Helps Businesses Grow',
    description: 'Discover smarter digital tools designed for the needs of modern businesses.',
    primaryBtnText: 'Discover BIZORA',
    primaryAction: 'service',
    serviceTarget: 'custom_software',
    secondaryBtnText: 'Our Solutions',
    secondaryAction: 'navigate',
    navigateTarget: 'services',
  },
  {
    id: 6,
    topic: 'Start Your Digital Journey',
    image: '/images/slide6.jpg',
    fallbackGradient: 'from-cyan-900 via-slate-900 to-slate-950',
    headline: 'Your Digital Journey Starts Here',
    description: 'Take the next step towards building a stronger online presence with BIZORA.',
    primaryBtnText: 'Start Today',
    primaryAction: 'consultation',
    secondaryBtnText: 'Contact Us',
    secondaryAction: 'navigate',
    navigateTarget: 'contact',
  },
];

interface HeroCarouselProps {
  onOpenConsultation: (serviceId?: string) => void;
  onNavigate: (tab: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  onOpenConsultation,
  onNavigate,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = SLIDES.length;

  const nextSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Autoplay 5 seconds
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide]);

  // Swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const diff = touchStartX - touchEndX;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handlePrimaryClick = (slide: SlideData) => {
    if (slide.primaryAction === 'service') {
      onOpenConsultation(slide.serviceTarget);
    } else {
      onOpenConsultation();
    }
  };

  const handleSecondaryClick = (slide: SlideData) => {
    if (slide.secondaryAction === 'navigate' && slide.navigateTarget) {
      onNavigate(slide.navigateTarget);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (slide.secondaryAction === 'call') {
      window.location.href = `tel:+918147827430`;
    } else if (slide.secondaryAction === 'whatsapp') {
      window.open(getWhatsAppUrl(), '_blank');
    } else {
      onOpenConsultation();
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-slate-950 text-white select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="BIZORA Featured Digital Solutions"
    >
      {/* Slides Viewport: Responsive height */}
      <div className="relative w-full h-[520px] sm:h-[580px] lg:h-[660px]">
        {SLIDES.map((slide, idx) => {
          const isActive = idx === currentIdx;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
              aria-hidden={!isActive}
            >
              {/* Background Image with Fallback Container */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.headline}
                  className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-7000 ease-out"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  onError={(e) => {
                    // Fallback to gradient if image ever fails to load
                    const target = e.currentTarget;
                    target.style.display = 'none';
                  }}
                />
                {/* Fallback gradient behind image */}
                <div
                  className={`absolute inset-0 -z-10 bg-gradient-to-br ${slide.fallbackGradient}`}
                />
              </div>

              {/* High-Legibility Dark Contrast Scrim & Subtle Blue Tint */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/30" />

              {/* Slide Content Overlay */}
              <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
                <div className="max-w-2xl sm:max-w-3xl space-y-4 sm:space-y-6 pt-4">
                  {/* Topic Kicker (Anti-slop clean unboxed metadata) */}
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                    <span>Slide 0{slide.id} of 0{totalSlides}</span>
                    <span aria-hidden="true">·</span>
                    <span>{slide.topic}</span>
                  </div>

                  {/* Headline */}
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] text-balance drop-shadow-sm">
                    {slide.headline}
                  </h1>

                  {/* Description */}
                  <p className="text-sm sm:text-lg text-slate-200 max-w-xl sm:max-w-2xl leading-relaxed drop-shadow-xs">
                    {slide.description}
                  </p>

                  {/* Call-to-action buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                    <button
                      onClick={() => handlePrimaryClick(slide)}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-blue-600/30 transition-all cursor-pointer"
                    >
                      {slide.primaryBtnText}
                      <ArrowRight className="w-4 h-4 sm:w-5 h-5" />
                    </button>

                    <button
                      onClick={() => handleSecondaryClick(slide)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3.5 sm:px-7 sm:py-4 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-md text-white font-semibold text-sm sm:text-base border border-white/20 transition-all cursor-pointer"
                    >
                      {slide.secondaryBtnText}
                    </button>

                    {/* Direct Quick Call link within hero */}
                    <a
                      href="tel:+918147827430"
                      className="hidden md:inline-flex items-center gap-2 px-4 py-3.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold backdrop-blur-md transition-colors"
                      title="Speak with founder Shashank"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      Direct Call: {BIZORA_PHONE}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prev / Next Navigation Arrows */}
      <div className="absolute inset-y-0 left-0 right-0 z-30 pointer-events-none flex items-center justify-between px-2 sm:px-6">
        <button
          onClick={prevSlide}
          className="pointer-events-auto p-2.5 sm:p-3.5 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white/90 hover:text-white backdrop-blur-md border border-white/10 shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 h-6" />
        </button>

        <button
          onClick={nextSlide}
          className="pointer-events-auto p-2.5 sm:p-3.5 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white/90 hover:text-white backdrop-blur-md border border-white/10 shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 h-6" />
        </button>
      </div>

      {/* Bottom Bar: 6 Clickable Dots + Slide Ticker */}
      <div className="absolute bottom-5 inset-x-0 z-30 flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Pagination Dots */}
        <div className="flex items-center gap-2 sm:gap-3">
          {SLIDES.map((slide, idx) => {
            const isActive = idx === currentIdx;
            return (
              <button
                key={slide.id}
                onClick={() => setCurrentIdx(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                  isActive
                    ? 'w-8 sm:w-10 h-2 sm:h-2.5 bg-blue-500 shadow-xs'
                    : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}: ${slide.topic}`}
                aria-current={isActive}
              />
            );
          })}
        </div>

        {/* Current topic label indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          <span>{currentIdx + 1} / {totalSlides}</span>
          <span className="text-slate-600">·</span>
          <span className="text-white font-medium">{SLIDES[currentIdx].topic}</span>
        </div>
      </div>
    </div>
  );
};
