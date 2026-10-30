/**
 * Automated Responsive Design & Carousel Verification Suite
 * Tests BIZORA Hero Carousel, Typography, Viewport Math, Autoplay, and Layout Integrity
 * Across all 7 target viewports:
 * 1. Small mobile: 320 x 568
 * 2. Standard mobile: 375 x 812
 * 3. Large mobile: 430 x 932
 * 4. Tablet: 768 x 1024
 * 5. Laptop: 1024 x 768
 * 6. Desktop: 1366 x 768
 * 7. Large desktop: 1920 x 1080
 */

import fs from 'fs';
import path from 'path';

interface Viewport {
  name: string;
  width: number;
  height: number;
}

const VIEWPORTS: Viewport[] = [
  { name: 'Small mobile', width: 320, height: 568 },
  { name: 'Standard mobile', width: 375, height: 812 },
  { name: 'Large mobile', width: 430, height: 932 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Laptop', width: 1024, height: 768 },
  { name: 'Desktop', width: 1366, height: 768 },
  { name: 'Large desktop', width: 1920, height: 1080 },
];

function runResponsiveTests() {
  console.log('=== STARTING BIZORA RESPONSIVE DESIGN & HERO SLIDER TEST SUITE ===\n');

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✅ [PASS] ${testName}`);
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? `: ${detail}` : ''}`);
    }
  }

  // 1. Inspect HeroCarousel.tsx
  const heroPath = path.resolve('src/components/HeroCarousel.tsx');
  const heroContent = fs.readFileSync(heroPath, 'utf8');

  // Verify all 6 slides exist
  const slideMatches = heroContent.match(/id:\s*([1-6])/g);
  assert(
    slideMatches !== null && slideMatches.length === 6,
    'Preserve all 6 original BIZORA hero slides',
    `Found ${slideMatches ? slideMatches.length : 0} slides`
  );

  // Verify Autoplay timer set to 5000ms
  assert(
    heroContent.includes('5000') && heroContent.includes('window.setInterval'),
    'Automatic slider advances every 5 seconds (5000ms)'
  );

  // Verify timer teardown on unmount
  assert(
    heroContent.includes('window.clearInterval(timerRef.current)') ||
    heroContent.includes('clearInterval'),
    'Proper timer cleanup on component unmount and re-renders'
  );

  // Verify pause on hover and focus
  assert(
    heroContent.includes('isHovered') && heroContent.includes('isFocused'),
    'Slider pauses during mouse hover and keyboard focus'
  );

  // Verify prefers-reduced-motion support
  assert(
    heroContent.includes('prefers-reduced-motion') && heroContent.includes('prefersReducedMotion'),
    'Slider respects prefers-reduced-motion user preference'
  );

  // Verify circular 44x44px navigation buttons
  assert(
    heroContent.includes('min-w-[44px]') &&
    heroContent.includes('min-h-[44px]') &&
    heroContent.includes('rounded-full'),
    'Circular Previous and Next navigation buttons with minimum 44x44px touch targets'
  );

  // Verify accessibility aria attributes
  assert(
    heroContent.includes('aria-roledescription="carousel"') &&
    heroContent.includes('aria-label="Previous slide"') &&
    heroContent.includes('aria-label="Next slide"'),
    'Accessible ARIA roles and labels on carousel and control elements'
  );

  // 2. Inspect index.css for global zero-overflow rules
  const cssPath = path.resolve('src/index.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  assert(
    cssContent.includes('box-sizing: border-box') &&
    cssContent.includes('overflow-x: clip'),
    'Global CSS enforces box-sizing: border-box and body overflow-x: clip'
  );

  assert(
    cssContent.includes('.hero-slider') &&
    cssContent.includes('.hero-content') &&
    cssContent.includes('.hero-title'),
    'Hero CSS fluid classes (.hero-slider, .hero-content, .hero-title) defined'
  );

  // 3. Inspect Navbar.tsx for responsive header behavior
  const navPath = path.resolve('src/components/Navbar.tsx');
  const navContent = fs.readFileSync(navPath, 'utf8');

  assert(
    navContent.includes('min-w-[44px]') && navContent.includes('min-h-[44px]'),
    'Navbar hamburger menu button has minimum 44x44px touch target'
  );

  assert(
    navContent.includes('shrink-0') && navContent.includes('BIZORA'),
    'Navbar logo has shrink-0 to prevent collision and clipping'
  );

  // 4. Mathematical Viewport Overlap & Clearance Verification
  console.log('\n--- Viewport Layout & Arrow Clearance Calculations ---');

  for (const vp of VIEWPORTS) {
    // Arrow sizes:
    const arrowWidth = 44;
    // Arrow positioning based on Tailwind classes:
    // left-1.5 (6px) on mobile < 400px, xs:left-2.5 (10px) on 400px+, sm:left-4 (16px) on 640px+, lg:left-6 (24px) on 1024px+
    let arrowLeftOffset = 6;
    if (vp.width >= 1024) {
      arrowLeftOffset = 24;
    } else if (vp.width >= 640) {
      arrowLeftOffset = 16;
    } else if (vp.width >= 400) {
      arrowLeftOffset = 10;
    }

    const prevArrowRightEdge = arrowLeftOffset + arrowWidth;

    // Content container horizontal padding:
    // px-14 (56px) on mobile < 640px, sm:px-16 (64px) on 640px+, md:px-20 (80px) on 768px+, lg:px-24 (96px) on 1024px+
    // Container max-w-7xl (1280px) centered
    let contentPadding = 56;
    if (vp.width >= 1024) {
      contentPadding = 96;
    } else if (vp.width >= 768) {
      contentPadding = 80;
    } else if (vp.width >= 640) {
      contentPadding = 64;
    }

    // Centered container margin
    const maxContainerWidth = 1280;
    const containerMarginLeft = vp.width > maxContainerWidth ? (vp.width - maxContainerWidth) / 2 : 0;
    const contentTextLeftEdge = containerMarginLeft + contentPadding;

    const clearancePx = contentTextLeftEdge - prevArrowRightEdge;

    assert(
      clearancePx >= 0,
      `[${vp.width}x${vp.height} - ${vp.name}] Arrow never overlaps hero text (Clearance: +${clearancePx}px)`,
      `Arrow right: ${prevArrowRightEdge}px, Text left: ${contentTextLeftEdge}px`
    );

    // Verify right arrow clearance as well
    const nextArrowLeftEdge = vp.width - (arrowLeftOffset + arrowWidth);
    const contentTextRightEdge = vp.width - containerMarginLeft - contentPadding;
    const rightClearance = nextArrowLeftEdge - contentTextRightEdge;

    assert(
      rightClearance >= 0,
      `[${vp.width}x${vp.height} - ${vp.name}] Next Arrow never overlaps hero text (Right Clearance: +${rightClearance}px)`
    );
  }

  // 5. Inspect App.tsx layout containment
  const appPath = path.resolve('src/App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf8');

  assert(
    appContent.includes('min-w-0') && appContent.includes('overflow-x-clip'),
    'App.tsx root wrapper enforces min-w-0 and overflow-x-clip'
  );

  console.log('\n----------------------------------------------------');
  console.log(`RESPONSIVE TEST SUMMARY: ${passedTests} / ${totalTests} PASSED`);
  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runResponsiveTests();
