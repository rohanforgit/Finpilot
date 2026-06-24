"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';


function HeroSplineBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Track mouse coordinates relative to window
    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2, isInside: false };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isInside = true;
    };

    const handleMouseLeave = () => {
      mouse.isInside = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle structure: spiral arms
    interface Particle {
      r: number; // radius distance from center
      theta: number; // current angle
      speed: number; // rotational speed
      size: number; // size of the particle
      color: string; // color string
      originalR: number; // to restore state during mouse distortion
      pulsePhase: number;
      pulseSpeed: number;
    }

    const particles: Particle[] = [];
    const particleCount = 350;

    // Colors matching FinPilot brand
    // Mint Green: #00E5A8
    // Purple: #9333ea
    // Cobalt/Blue: rgba(59, 130, 246)
    // White/Ice: rgba(243, 244, 246)
    const palette = [
      'rgba(0, 229, 168, 0.85)', // Mint green
      'rgba(147, 51, 234, 0.8)',  // Purple
      'rgba(59, 130, 246, 0.85)', // Cobalt blue
      'rgba(243, 244, 246, 0.9)',  // Pure white/ice
      'rgba(0, 229, 168, 0.6)',
      'rgba(147, 51, 234, 0.5)',
      'rgba(59, 130, 246, 0.6)'
    ];

    for (let i = 0; i < particleCount; i++) {
      // 2 spiral arms layout
      const arm = i % 2;
      
      // Distribute particles with a bias towards the center (using power distribution)
      const t = Math.pow(Math.random(), 1.5); 
      const maxRadius = Math.min(width, height) * 0.45;
      const r = 20 + t * (maxRadius - 20);

      // Logarithmic spiral formula: theta = a * ln(r) + offset
      const armAngle = arm * Math.PI;
      // We add some noise/dispersion to make it look like a realistic gas cloud / star cluster
      const dispersion = (Math.random() - 0.5) * 0.45;
      const theta = 0.008 * r + armAngle + dispersion;

      // Speed decreases as distance increases (Keplerian-like rotation)
      const speed = (0.015 + Math.random() * 0.012) * (1 / (1 + r * 0.0035));
      const size = Math.random() * 1.5 + 0.5;
      
      // Determine color based on position
      let color = palette[Math.floor(Math.random() * palette.length)];
      if (r < maxRadius * 0.25 && Math.random() > 0.3) {
        color = 'rgba(255, 255, 255, 0.95)'; // Bulge is bright white
      } else if (r > maxRadius * 0.6 && Math.random() > 0.5) {
        color = Math.random() > 0.5 ? 'rgba(147, 51, 234, 0.7)' : 'rgba(59, 130, 246, 0.7)'; // outer is blue/purple
      }

      particles.push({
        r,
        theta,
        speed,
        size,
        color,
        originalR: r,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03
      });
    }

    // Animation Loop
    const draw = () => {
      // Create motion blur/trails by not completely clearing the canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Smoothly interpolate mouse coordinates
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // 1. Draw glowing central core
      const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.15);
      coreGradient.addColorStop(0, 'rgba(0, 229, 168, 0.25)'); // mint green
      coreGradient.addColorStop(0.3, 'rgba(147, 51, 234, 0.18)'); // purple core
      coreGradient.addColorStop(0.6, 'rgba(59, 130, 246, 0.08)'); // blue core
      coreGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(width, height) * 0.2, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw and update particles
      particles.forEach((p) => {
        // Rotate stars
        p.theta += p.speed;

        // Pulse the sizes/opacities slightly for twinkling effect
        p.pulsePhase += p.pulseSpeed;
        const currentSize = p.size * (1 + Math.sin(p.pulsePhase) * 0.15);

        // Standard positions relative to center
        let targetX = cx + Math.cos(p.theta) * p.r;
        let targetY = cy + Math.sin(p.theta) * p.r;

        // Mouse interaction: apply gentle gravitational distortion/swirl when cursor is close
        if (mouse.isInside) {
          const dx = mouse.x - targetX;
          const dy = mouse.y - targetY;
          const dist = Math.hypot(dx, dy);
          const maxInfluence = 180;

          if (dist < maxInfluence) {
            const force = (maxInfluence - dist) / maxInfluence;
            // Swirl effect: add an angular offset
            p.theta += force * 0.015;
            // Radial push/pull
            targetX += (dx / dist) * force * 20;
            targetY += (dy / dist) * force * 20;
          }
        }

        // Draw particle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(targetX, targetY, currentSize, 0, Math.PI * 2);
        ctx.fill();

        // Add subtle glow around larger stars
        if (p.size > 1.2 && Math.random() > 0.8) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(targetX, targetY, currentSize * 1.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        pointerEvents: 'auto',
        overflow: 'hidden',
      }}
      className="bg-black"
    >
      {/* Canvas background for galaxy */}
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          zIndex: 0
        }}
      />

      {/* Deep space stars layer (CSS overlay for extra depth) */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          zIndex: 1
        }}
      />
      
      {/* Cyber grid lines layer */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(128,128,128,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(128,128,128,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
          zIndex: 2
        }}
      />

      {/* Depth shading / edge gradients */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          background: `
            linear-gradient(to right, rgba(0, 0, 0, 0.7), transparent 25%, transparent 75%, rgba(0, 0, 0, 0.7)),
            linear-gradient(to bottom, transparent 40%, rgba(0, 0, 0, 0.95))
          `,
          pointerEvents: 'none',
          zIndex: 3
        }}
      />
    </div>
  );
}



function HeroContent() {
  return (
    <div className="text-left text-white pt-16 sm:pt-24 md:pt-32 px-4 max-w-3xl">
      <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 leading-tight tracking-wide font-display">
        Elevate your <br className="sm:hidden" />financial life <br className="sm:hidden" />to an art form.
      </h1>
      <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-80 max-w-xl">
        Manage all of your wealth and assets — bank balances, stocks, mutual funds, gold, debts, and EMIs — on a single secure surface with Gemini AI integration.
      </p>
      <div className="flex pointer-events-auto flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-3">
        <Link href="/login" className="bg-accent hover:bg-accent/80 text-[#09090b] font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-full transition duration-300 w-full sm:w-auto border border-accent/20 text-center flex items-center justify-center shadow-lg shadow-accent/15">
          Launch Sandbox
        </Link>
        <Link href="/login" className="pointer-events-auto bg-[#0009] border border-gray-600 hover:border-gray-400 text-gray-200 hover:text-white font-medium py-2 sm:py-3 px-6 sm:px-8 rounded-full transition duration-300 flex items-center justify-center w-full sm:w-auto text-center">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-accent animate-pulse" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Explore AI Coach
        </Link>
      </div>
    </div>
  );
}

function Navbar() {
  const [hoveredNavItem, setHoveredNavItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileDropdowns, setMobileDropdowns] = useState({
    features: false,
    enterprise: false,
    resources: false,
  });

  const handleMouseEnterNavItem = (item: string) => setHoveredNavItem(item);
  const handleMouseLeaveNavItem = () => setHoveredNavItem(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isMobileMenuOpen) {
      setMobileDropdowns({ features: false, enterprise: false, resources: false });
    }
  };

  const toggleMobileDropdown = (key: keyof typeof mobileDropdowns) => {
    setMobileDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const navLinkClass = (itemName: string, extraClasses = '') => {
    const isCurrentItemHovered = hoveredNavItem === itemName;
    const isAnotherItemHovered = hoveredNavItem !== null && !isCurrentItemHovered;

    const colorClass = isCurrentItemHovered
      ? 'text-white'
      : isAnotherItemHovered
        ? 'text-gray-500'
        : 'text-gray-300';

     return `text-sm transition duration-150 ${colorClass} ${extraClasses}`;
  };

   useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
         setMobileDropdowns({ features: false, enterprise: false, resources: false });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-20" style={{ backgroundColor: 'rgba(13, 13, 24, 0.3)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderRadius: '0 0 15px 15px' }}>
      <div className="container mx-auto px-4 py-4 md:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-6 lg:space-x-8">
         <div className="flex items-center space-x-2.5">
          <div className="text-accent" style={{ width: '28px', height: '28px' }}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32ZM12.4306 9.70695C12.742 9.33317 13.2633 9.30058 13.6052 9.62118L19.1798 14.8165C19.4894 15.1054 19.4894 15.5841 19.1798 15.873L13.6052 21.0683C13.2633 21.3889 12.742 21.3563 12.4306 19.9991V9.70695Z" fill="currentColor" />
            </svg>
          </div>
          <span className="font-display font-extrabold text-sm tracking-wider text-white">FINPILOT</span>
         </div>

          <div className="hidden lg:flex items-center space-x-6">
            <div className="relative group" onMouseEnter={() => handleMouseEnterNavItem('features')} onMouseLeave={handleMouseLeaveNavItem}>
              <a href="#" className={navLinkClass('features', 'flex items-center')}>
                Features
                <svg className="ml-1 w-3 h-3 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </a>
              <div className="absolute left-0 mt-2 w-48 bg-black bg-opacity-50 rounded-md shadow-lg py-2 border border-gray-700/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-30" style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
                <Link href="/login" className="block px-4 py-2 text-sm text-gray-300 hover:text-gray-100 hover:bg-gray-800/30 transition duration-150">Net Worth HUD</Link>
                <Link href="/login" className="block px-4 py-2 text-sm text-gray-300 hover:text-gray-100 hover:bg-gray-800/30 transition duration-150">Gemini Vision OCR</Link>
                <Link href="/login" className="block px-4 py-2 text-sm text-gray-300 hover:text-gray-100 hover:bg-gray-800/30 transition duration-150">AI Coach Advice</Link>
              </div>
            </div>

            <div className="relative group" onMouseEnter={() => handleMouseEnterNavItem('enterprise')} onMouseLeave={handleMouseLeaveNavItem}>
              <a href="#" className={navLinkClass('enterprise', 'flex items-center')}>
                Solutions
                 <svg className="ml-1 w-3 h-3 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </a>
              <div className="absolute left-0 mt-2 w-48 bg-black bg-opacity-50 rounded-md shadow-lg py-2 border border-gray-700/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-30" style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
                <Link href="/login" className="block px-4 py-2 text-sm text-gray-300 hover:text-gray-100 hover:bg-gray-800/30 transition duration-150">Budget Planner</Link>
                <Link href="/login" className="block px-4 py-2 text-sm text-gray-300 hover:text-gray-100 hover:bg-gray-800/30 transition duration-150">Cash Flow Forecast</Link>
                <Link href="/login" className="block px-4 py-2 text-sm text-gray-300 hover:text-gray-100 hover:bg-gray-800/30 transition duration-150">Saving Goals</Link>
              </div>
            </div>

            <div className="relative group" onMouseEnter={() => handleMouseEnterNavItem('resources')} onMouseLeave={handleMouseLeaveNavItem}>
              <a href="#" className={navLinkClass('resources', 'flex items-center')}>
                Resources
                 <svg className="ml-1 w-3 h-3 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </a>
               <div className="absolute left-0 mt-2 w-48 bg-black bg-opacity-50 rounded-md shadow-lg py-2 border border-gray-700/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-30" style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
                <Link href="/login" className="block px-4 py-2 text-sm text-gray-300 hover:text-gray-100 hover:bg-gray-800/30 transition duration-150">Security Protocol</Link>
                <Link href="/login" className="block px-4 py-2 text-sm text-gray-300 hover:text-gray-100 hover:bg-gray-800/30 transition duration-150">Database Schema</Link>
              </div>
            </div>

            <Link href="/login" className={navLinkClass('pricing')} onMouseEnter={() => handleMouseEnterNavItem('pricing')} onMouseLeave={handleMouseLeaveNavItem}>
                Free Sandbox
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4 md:space-x-6">
          <span className="hidden md:block text-accent text-xs font-semibold uppercase tracking-wider bg-accent/5 px-2.5 py-1 rounded border border-accent/20">Sandbox Mode</span>
          <Link href="/login" className="hidden sm:block text-gray-300 hover:text-white text-sm">Sign In</Link>
          <Link href="/login" className="bg-accent hover:bg-accent/80 text-[#09090b] font-bold py-2 px-5 rounded-full text-sm border border-accent/20 text-center flex items-center justify-center shadow-lg shadow-accent/15" style={{ backdropFilter: 'blur(8px)' }}>Launch Sandbox</Link>
          <button className="lg:hidden text-white p-2" onClick={toggleMobileMenu} aria-label="Toggle mobile menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
        </div>
      </div>

      <div className={`lg:hidden bg-black bg-opacity-50 border-t border-gray-700/30 absolute top-full left-0 right-0 z-30
           overflow-hidden transition-all duration-300 ease-in-out
           ${isMobileMenuOpen ? 'max-h-screen opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'}
           `}
           style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      >
        <div className="px-4 py-6 flex flex-col space-y-4">
          <div className="relative">
            <button className="text-gray-300 hover:text-gray-100 flex items-center justify-between w-full text-left text-sm py-2" onClick={() => toggleMobileDropdown('features')} aria-expanded={mobileDropdowns.features}>
              Features
              <svg className={`ml-2 w-3 h-3 transition-transform duration-200 ${mobileDropdowns.features ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className={`pl-4 space-y-2 mt-2 overflow-hidden transition-all duration-300 ease-in-out ${mobileDropdowns.features ? 'max-h-[200px] opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'}`}>
              <Link href="/login" className="block text-gray-300 hover:text-gray-100 text-sm py-1 transition duration-150" onClick={toggleMobileMenu}>Net Worth HUD</Link>
              <Link href="/login" className="block text-gray-300 hover:text-gray-100 text-sm py-1 transition duration-150" onClick={toggleMobileMenu}>Gemini Vision OCR</Link>
              <Link href="/login" className="block text-gray-300 hover:text-gray-100 text-sm py-1 transition duration-150" onClick={toggleMobileMenu}>AI Coach Advice</Link>
            </div>
          </div>
          <div className="relative">
             <button className="text-gray-300 hover:text-gray-100 flex items-center justify-between w-full text-left text-sm py-2" onClick={() => toggleMobileDropdown('enterprise')} aria-expanded={mobileDropdowns.enterprise}>
              Solutions
              <svg className={`ml-2 w-3 h-3 transition-transform duration-200 ${mobileDropdowns.enterprise ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className={`pl-4 space-y-2 mt-2 overflow-hidden transition-all duration-300 ease-in-out ${mobileDropdowns.enterprise ? 'max-h-[200px] opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'}`}>
              <Link href="/login" className="block text-gray-300 hover:text-gray-100 text-sm py-1 transition duration-150" onClick={toggleMobileMenu}>Budget Planner</Link>
              <Link href="/login" className="block text-gray-300 hover:text-gray-100 text-sm py-1 transition duration-150" onClick={toggleMobileMenu}>Cash Flow Forecast</Link>
              <Link href="/login" className="block text-gray-300 hover:text-gray-100 text-sm py-1 transition duration-150" onClick={toggleMobileMenu}>Saving Goals</Link>
            </div>
          </div>
          <div className="relative">
            <button className="text-gray-300 hover:text-gray-100 flex items-center justify-between w-full text-left text-sm py-2" onClick={() => toggleMobileDropdown('resources')} aria-expanded={mobileDropdowns.resources}>
              Resources
              <svg className={`ml-2 w-3 h-3 transition-transform duration-200 ${mobileDropdowns.resources ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
             <div className={`pl-4 space-y-2 mt-2 overflow-hidden transition-all duration-300 ease-in-out ${mobileDropdowns.resources ? 'max-h-[250px] opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'}`}>
              <Link href="/login" className="block text-gray-300 hover:text-gray-100 text-sm py-1 transition duration-150" onClick={toggleMobileMenu}>Security Protocol</Link>
              <Link href="/login" className="block text-gray-300 hover:text-gray-100 text-sm py-1 transition duration-150" onClick={toggleMobileMenu}>Database Schema</Link>
            </div>
          </div>
          <Link href="/login" className="text-gray-300 hover:text-gray-100 text-sm py-2 transition duration-150" onClick={toggleMobileMenu}>Free Sandbox</Link>
          <Link href="/login" className="text-gray-300 hover:text-gray-100 text-sm py-2 transition duration-150" onClick={toggleMobileMenu}>Sign In</Link>
        </div>
      </div>
    </nav>
  );
}

export const HeroSection = () => {
  const heroContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroContentRef.current) {
        requestAnimationFrame(() => {
          const scrollPosition = window.pageYOffset;
          const maxScroll = 400;
          const opacity = 1 - Math.min(scrollPosition / maxScroll, 1);
          if (heroContentRef.current) {
            heroContentRef.current.style.opacity = opacity.toString();
          }
        });
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative">
      <Navbar />

      <div className="relative min-h-screen">
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <HeroSplineBackground />
        </div>

        <div ref={heroContentRef} style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh',
          display: 'flex', justifyContent: 'flex-start', alignItems: 'center', zIndex: 10, pointerEvents: 'none'
        }}>
          <div className="container mx-auto">
            <HeroContent />
          </div>
        </div>
      </div>
    </div>
  );
};
