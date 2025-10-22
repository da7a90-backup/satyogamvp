'use client';

import { useState } from 'react';
import Link from 'next/link';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: any) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <footer 
      className="relative w-full flex flex-col items-center"
      style={{
        background: 'linear-gradient(180deg, #7D1A13 0%, #4E2223 100%)',
        padding: '64px 0px 48px',
        gap: '64px'
      }}
    >
      {/* Newsletter Signup Section */}
      <div 
        className="w-full flex flex-col items-start px-8"
        style={{
          maxWidth: '1280px',
          gap: '16px'
        }}
      >
        <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Newsletter Content */}
          <div className="flex flex-col gap-2">
            <h2 
              className="text-white text-xl lg:text-2xl font-medium"
              style={{
                fontFamily: 'Avenir Next, sans-serif'
              }}
            >
              Be a part of our community
            </h2>
            <p 
              className="text-white/80 text-base"
              style={{
                fontFamily: 'Avenir Next, sans-serif'
              }}
            >
              Sign Up for our Newsletter
            </p>
          </div>

          {/* Newsletter Form */}
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="px-4 py-3 bg-transparent border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/60 transition-colors"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '16px',
                minWidth: '280px'
              }}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-transparent border border-white/30 rounded-lg text-white hover:bg-white/10 transition-colors font-medium"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '16px',
                minWidth: '120px'
              }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Border Separator */}
      <div 
        className="w-full h-px"
        style={{
          background: 'rgba(233, 234, 235, 0.2)',
          maxWidth: '1280px',
          margin: '0 32px'
        }}
      />

      {/* Desktop Links Section */}
      <div 
        className="hidden lg:flex w-full flex-row items-start px-8"
        style={{
          maxWidth: '1280px',
          gap: '40px',
          paddingBottom: '30px'
        }}
      >
        {/* About Column */}
        <div className="flex flex-col gap-4 flex-1">
          <h3 
            className="text-white text-lg font-medium mb-2"
            style={{
              fontFamily: 'Avenir Next, sans-serif'
            }}
          >
            About
          </h3>
          <div className="flex flex-col gap-3">
            <Link href="/about/shunyamurti" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Shunyamurti
            </Link>
            <Link href="/about" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Sat Yoga
            </Link>
            <Link href="/about/ashram" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Our Ashram
            </Link>
          </div>
        </div>

        {/* Retreats Column */}
        <div className="flex flex-col gap-4 flex-1">
          <h3 
            className="text-white text-lg font-medium mb-2"
            style={{
              fontFamily: 'Avenir Next, sans-serif'
            }}
          >
            Retreats
          </h3>
          <div className="flex flex-col gap-3">
            <Link href="/retreats/ashram" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Ashram Retreats
            </Link>
            <Link href="/retreats/online" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Online retreats
            </Link>
            <Link href="/faq" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              FAQs
            </Link>
          </div>
        </div>

        {/* Learn Online Column */}
        <div className="flex flex-col gap-4 flex-1">
          <h3 
            className="text-white text-lg font-medium mb-2"
            style={{
              fontFamily: 'Avenir Next, sans-serif'
            }}
          >
            Learn Online
          </h3>
          <div className="flex flex-col gap-3">
            <Link href="/teachings/free" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Free Teachings Library
            </Link>
            <Link href="/courses" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Courses
            </Link>
            <Link href="/learn" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              More Online Learning Options
            </Link>
          </div>
        </div>

        {/* Membership Column */}
        <div className="flex flex-col gap-4 flex-1">
          <h3 
            className="text-white text-lg font-medium mb-2"
            style={{
              fontFamily: 'Avenir Next, sans-serif'
            }}
          >
            Membership
          </h3>
          <div className="flex flex-col gap-3">
            <Link href="/calendar" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Calendar
            </Link>
            <Link href="/store" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Store
            </Link>
            <Link href="/blog" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Blog
            </Link>
            <Link href="/donate" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Donate
            </Link>
            <Link href="/contact" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Contact us
            </Link>
          </div>
        </div>

        {/* Follow Us Column */}
        <div className="flex flex-col gap-4 flex-1">
          <h3 
            className="text-white text-lg font-medium mb-2"
            style={{
              fontFamily: 'Avenir Next, sans-serif'
            }}
          >
            Follow Us
          </h3>
          <div className="flex flex-col gap-3">
            <Link href="https://youtube.com" className="text-white/80 hover:text-white transition-colors flex items-center gap-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              <span className="text-lg">📺</span>
              Youtube
            </Link>
            <Link href="https://instagram.com" className="text-white/80 hover:text-white transition-colors flex items-center gap-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              <span className="text-lg">📷</span>
              Instagram
            </Link>
            <Link href="https://facebook.com" className="text-white/80 hover:text-white transition-colors flex items-center gap-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              <span className="text-lg">👥</span>
              Facebook
            </Link>
            <Link href="https://spotify.com" className="text-white/80 hover:text-white transition-colors flex items-center gap-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              <span className="text-lg">🎵</span>
              Spotify
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Two-Pane Layout */}
      <div 
        className="lg:hidden w-full flex flex-row px-8 gap-8"
        style={{
          maxWidth: '430px'
        }}
      >
        {/* Left Pane - Social Links */}
        <div className="flex-1 flex flex-col gap-4">
          <h3 
            className="text-white text-lg font-medium mb-2"
            style={{
              fontFamily: 'Avenir Next, sans-serif'
            }}
          >
            Follow Us
          </h3>
          <div className="flex flex-col gap-3">
            <Link href="https://youtube.com" className="text-white/80 hover:text-white transition-colors flex items-center gap-2" style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '14px' }}>
              <span className="text-base">📺</span>
              Youtube
            </Link>
            <Link href="https://instagram.com" className="text-white/80 hover:text-white transition-colors flex items-center gap-2" style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '14px' }}>
              <span className="text-base">📷</span>
              Instagram
            </Link>
            <Link href="https://facebook.com" className="text-white/80 hover:text-white transition-colors flex items-center gap-2" style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '14px' }}>
              <span className="text-base">👥</span>
              Facebook
            </Link>
            <Link href="https://spotify.com" className="text-white/80 hover:text-white transition-colors flex items-center gap-2" style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '14px' }}>
              <span className="text-base">🎵</span>
              Spotify
            </Link>
          </div>
        </div>

        {/* Right Pane - Essential Links */}
        <div className="flex-1 flex flex-col gap-4">
          <h3 
            className="text-white text-lg font-medium mb-2"
            style={{
              fontFamily: 'Avenir Next, sans-serif'
            }}
          >
            Quick Links
          </h3>
          <div className="flex flex-col gap-2">
            <Link href="/about/satyoga" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '14px' }}>
              About
            </Link>
            <Link href="/retreats/online" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '14px' }}>
              Retreats
            </Link>
            <Link href="/teachings" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '14px' }}>
              Free Teachings
            </Link>
            <Link href="/membership" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '14px' }}>
              Membership
            </Link>
            <Link href="/courses" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '14px' }}>
              Courses
            </Link>
            <Link href="/donate" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '14px' }}>
              Donate
            </Link>
            <Link href="/contact" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '14px' }}>
              Contact
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Divider */}
      <div 
        className="w-full h-px"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          maxWidth: '1280px',
          margin: '0 32px'
        }}
      />

      {/* Bottom Section */}
      <div 
        className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between px-8 gap-6 -mt-12"
        style={{
          maxWidth: '1280px'
        }}
      >
        {/* Logo and Copyright */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo_white.svg"
              alt="Sat Yoga Logo"
              className="w-76 h-28 object-contain"
            />
         
          </div>
          <p 
            className="text-white text-sm"
            style={{
              fontFamily: 'Avenir Next, sans-serif'
            }}
          >
            © 2024 Satyoga. All rights reserved.
          </p>
        </div>

        {/* Footer Links */}
        <div className="flex flex-row items-center gap-6">
          <Link 
            href="/privacy" 
            className="text-white hover:text-white/80 transition-colors text-sm"
            style={{
              fontFamily: 'Avenir Next, sans-serif'
            }}
          >
            Privacy Policy
          </Link>
          <Link 
            href="/booking-policy" 
            className="text-white hover:text-white/80 transition-colors text-sm"
            style={{
              fontFamily: 'Avenir Next, sans-serif'
            }}
          >
            Booking Policy
          </Link>
          <Link 
            href="/guidelines" 
            className="text-white hover:text-white/80 transition-colors text-sm"
            style={{
              fontFamily: 'Avenir Next, sans-serif'
            }}
          >
            Guidelines
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;