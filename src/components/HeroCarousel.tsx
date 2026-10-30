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
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const totalSlides = SLIDES.length;

  // Listen to prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = useCallback((idx: number) => {
    setCurrentIdx(idx);
  }, []);

  // Automatic Slider: Advances every 5 seconds. Pauses on hover, focus, or reduced motion.
  useEffect(() => {
    // Clean up any existing timer
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (prefersReducedMotion || isHovered || isFocused || totalSlides <= 1) {
      return;
    }

    timerRef.current = window.setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentIdx, isHovered, isFocused, prefersReducedMotion, totalSlides]);

  // Keyboard navigation when user presses left/right arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide]);

  // Touch Swipe Handling for Mobile Devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
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
    <section
      className="hero-slider relative w-full overflow-hidden bg-slate-950 text-white select-none min-h-[550px] sm:min-h-[580px] lg:min-h-[640px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsFocused(false);
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="BIZORA Featured Digital Solutions"
      aria-live="polite"
    >
      {/* Slides Viewport: Fluid responsive height */}
      <div className="relative w-full h-[550px] sm:h-[580px] lg:h-[640px]">
        {SLIDES.map((slide, idx) => {
          const isActive = idx === currentIdx;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity ${
                prefersReducedMotion ? 'duration-0' : 'duration-700'
              } ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${idx + 1} of ${totalSlides}: ${slide.topic}`}
              aria-hidden={!isActive}
            >
              {/* Background Image with Fallback Container */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.headline}
                  className="w-full h-full object-cover object-center sm:object-[center_35%]"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                  }}
                />
                {/* Fallback gradient behind image */}
                <div
                  className={`absolute inset-0 -z-10 bg-gradient-to-br ${slide.fallbackGradient}`}
                />
              </div>

              {/* High-Legibility Dark Contrast Scrims */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/45" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/30" />

              {/* Slide Content: Guaranteed Safe Horizontal Padding to Prevent Any Arrow Overlap */}
              <div className="relative z-20 max-w-7xl mx-auto h-full flex flex-col justify-center px-14 sm:px-16 md:px-20 lg:px-24 pt-4 pb-16 sm:pb-14">
                <div className="max-w-2xl sm:max-w-3xl space-y-3.5 sm:space-y-5">
                  {/* Topic Kicker */}
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-400">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block shrink-0" />
                    <span>Slide 0{slide.id} of 0{totalSlides}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{slide.topic}</span>
                  </div>

                  {/* Headline with Clamp Fluid Font Size */}
                  <h1 className="hero-title font-extrabold text-white tracking-tight text-balance drop-shadow-sm">
                    {slide.headline}
                  </h1>

                  {/* Description */}
                  <p className="hero-desc text-slate-200 max-w-xl sm:max-w-2xl drop-shadow-xs">
                    {slide.description}
                  </p>

                  {/* Call-to-Action Buttons */}
                  <div className="pt-2 flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 sm:gap-4">
                    <button
                      onClick={() => handlePrimaryClick(slide)}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs sm:text-sm md:text-base shadow-lg hover:shadow-blue-600/30 transition-all cursor-pointer min-h-[44px]"
                    >
                      <span>{slide.primaryBtnText}</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 h-5 shrink-0" />
                    </button>

                    <button
                      onClick={() => handleSecondaryClick(slide)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3.5 sm:px-7 sm:py-4 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-md text-white font-semibold text-xs sm:text-sm md:text-base border border-white/20 transition-all cursor-pointer min-h-[44px]"
                    >
                      {slide.secondaryBtnText}
                    </button>

                    {/* Direct Quick Call link within hero for md+ screens */}
                    <a
                      href="tel:+918147827430"
                      className="hidden md:inline-flex items-center gap-2 px-4 py-3.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold backdrop-blur-md transition-colors min-h-[44px]"
                      title="Speak directly with founder Shashank"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Direct Call: {BIZORA_PHONE}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prev / Next Navigation Arrows: Always inside hero, vertically centered, 44x44px touch targets */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 -translate-y-1/2 left-1.5 xs:left-2.5 sm:left-4 lg:left-6 z-30 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-slate-950/70 hover:bg-slate-900 active:bg-blue-600 text-white backdrop-blur-md border border-white/20 shadow-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
        aria-label="Previous slide"
        type="button"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 h-6 shrink-0" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute top-1/2 -translate-y-1/2 right-1.5 xs:right-2.5 sm:right-4 lg:right-6 z-30 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-slate-950/70 hover:bg-slate-900 active:bg-blue-600 text-white backdrop-blur-md border border-white/20 shadow-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
        aria-label="Next slide"
        type="button"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 h-6 shrink-0" />
      </button>

      {/* Bottom Controls Bar: Accessible 44px touch-target Indicators + Slide Ticker */}
      <div className="absolute bottom-4 sm:bottom-6 inset-x-0 z-30 flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-none">
        {/* Pagination Dots */}
        <div className="flex items-center gap-1 sm:gap-2 pointer-events-auto" role="tablist" aria-label="Slide Selection">
          {SLIDES.map((slide, idx) => {
            const isActive = idx === currentIdx;
            return (
              <button
                key={slide.id}
                onClick={() => goToSlide(idx)}
                className="min-w-[32px] sm:min-w-[36px] min-h-[44px] flex items-center justify-center p-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-md"
                aria-label={`Go to slide ${idx + 1}: ${slide.topic}`}
                aria-selected={isActive}
                role="tab"
                type="button"
              >
                <span
                  className={`block transition-all duration-300 rounded-full ${
                    isActive
                      ? 'w-7 sm:w-9 h-2 sm:h-2.5 bg-blue-500 shadow-xs'
                      : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Current topic label indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 pointer-events-auto">
          <span>{currentIdx + 1} / {totalSlides}</span>
          <span className="text-slate-600">·</span>
          <span className="text-white font-medium">{SLIDES[currentIdx].topic}</span>
        </div>
      </div>
    </section>
  );
};
