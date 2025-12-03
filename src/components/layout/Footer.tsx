'use client';

import { useState } from 'react';
import Link from 'next/link';

const Footer = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    // Clear error when user starts typing
    if (emailError) {
      setEmailError('');
    }

    // Validate on blur or when email looks complete
    if (newEmail && !validateEmail(newEmail) && newEmail.includes('@')) {
      setEmailError('Please enter a valid email address');
    }
  };

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    }
  };

  const handleNewsletterSubmit = async (e: any) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      return;
    }

    // Validate email before submission
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/forms/newsletter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email })
      });

      if (response.ok) {
        setSubmitStatus('success');
        setName('');
        setEmail('');
        // Reset success message after 3 seconds
        setTimeout(() => setSubmitStatus('idle'), 3000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
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
        className="w-full flex flex-col items-start px-4 md:px-8 lg:px-16"
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
          <div className="w-full lg:w-auto">
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="px-4 py-3 bg-transparent border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/60 transition-colors"
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px',
                  minWidth: '200px'
                }}
              />
              <div className="flex flex-col">
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  required
                  className={`px-4 py-3 bg-transparent border ${emailError ? 'border-red-400' : 'border-white/30'} rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/60 transition-colors`}
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '16px',
                    minWidth: '200px'
                  }}
                />
                {emailError && (
                  <span className="text-red-300 text-xs mt-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    {emailError}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-transparent border border-white/30 rounded-lg text-white hover:bg-white/10 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px',
                  minWidth: '120px'
                }}
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="mt-3 text-green-300 text-sm" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                Thank you for subscribing to our newsletter!
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="mt-3 text-red-300 text-sm" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                Something went wrong. Please try again.
              </div>
            )}
          </div>
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
        className="hidden lg:flex w-full flex-row items-start px-4 md:px-8 lg:px-16"
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
            <Link href="/about/satyoga" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
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
            <Link href="/teachings" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Free Teachings Library
            </Link>
            <Link href="/courses" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Courses
            </Link>
          </div>
        </div>

        {/* More Column */}
        <div className="flex flex-col gap-4 flex-1">
          <h3
            className="text-white text-lg font-medium mb-2"
            style={{
              fontFamily: 'Avenir Next, sans-serif'
            }}
          >
            More
          </h3>
          <div className="flex flex-col gap-3">
            <Link href="/membership" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Membership
            </Link>
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
            <Link href="/contact?queryType=general" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor"/>
              </svg>
              Youtube
            </Link>
            <Link href="https://instagram.com" className="text-white/80 hover:text-white transition-colors flex items-center gap-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="currentColor"/>
              </svg>
              Instagram
            </Link>
            <Link href="https://facebook.com" className="text-white/80 hover:text-white transition-colors flex items-center gap-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="currentColor"/>
              </svg>
              Facebook
            </Link>
            <Link href="https://spotify.com" className="text-white/80 hover:text-white transition-colors flex items-center gap-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" fill="currentColor"/>
              </svg>
              Spotify
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Two-Pane Layout */}
      <div
        className="lg:hidden w-full flex flex-row px-4 md:px-8 gap-8"
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor"/>
              </svg>
              Youtube
            </Link>
            <Link href="https://instagram.com" className="text-white/80 hover:text-white transition-colors flex items-center gap-2" style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '14px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="currentColor"/>
              </svg>
              Instagram
            </Link>
            <Link href="https://facebook.com" className="text-white/80 hover:text-white transition-colors flex items-center gap-2" style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '14px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="currentColor"/>
              </svg>
              Facebook
            </Link>
            <Link href="https://spotify.com" className="text-white/80 hover:text-white transition-colors flex items-center gap-2" style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '14px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" fill="currentColor"/>
              </svg>
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
            <Link href="/contact?queryType=general" className="text-white/80 hover:text-white transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '14px' }}>
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
        className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 md:px-8 lg:px-16 gap-6 -mt-12"
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
            © 2025 Satyoga. All rights reserved.
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