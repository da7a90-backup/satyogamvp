'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface FooterProps {
  // Any props you might want to pass to the footer
  newsletterEnabled?: boolean;
}

const Footer: React.FC<FooterProps> = ({ newsletterEnabled = true }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle the newsletter subscription logic here
    console.log('Subscribing email:', email);
    // TODO: Connect to your API or email service
    setEmail('');
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#300001] text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        {/* Newsletter Section */}
        {newsletterEnabled && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
              <div className="max-w-md">
                <h2 
                  className="text-xl font-bold mb-2"
                  style={{ fontFamily: 'Optima, sans-serif', fontWeight: 700 }}
                >
                  Be a part of our community
                </h2>
                <p 
                  className="text-[#FAF8F1] opacity-80"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  Sign Up for our Newsletter
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="w-full md:w-auto flex flex-col md:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-3 bg-transparent border border-[#FAF8F1] border-opacity-30 rounded-md text-[#FAF8F1] placeholder-[#FAF8F1] placeholder-opacity-60 w-full md:w-auto min-w-[320px] focus:outline-none focus:ring-2 focus:ring-[#FAF8F1] focus:border-transparent"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#FAF8F1] text-[#300001] rounded-md font-medium hover:bg-white transition-colors"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  Subscribe
                </button>
              </form>
            </div>
            
            <hr className="border-[#FAF8F1] border-opacity-20 mb-12" />
          </>
        )}
        
        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* About */}
          <div>
            <h3 
              className="text-lg font-bold mb-4"
              style={{ fontFamily: 'Optima, sans-serif', fontWeight: 700 }}
            >
              About
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/about/shunyamurti" 
                  className="text-[#FAF8F1] opacity-80 hover:opacity-100 transition-opacity"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  Shunyamurti
                </Link>
              </li>
              <li>
                <Link 
                  href="/about/asharam" 
                  className="text-[#FAF8F1] opacity-80 hover:opacity-100 transition-opacity"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  Sat Yoga
                </Link>
              </li>
              <li>
                <Link 
                  href="/about/community" 
                  className="text-[#FAF8F1] opacity-80 hover:opacity-100 transition-opacity"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  Our Ashram
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Retreats */}
          <div>
            <h3 
              className="text-lg font-bold mb-4"
              style={{ fontFamily: 'Optima, sans-serif', fontWeight: 700 }}
            >
              Retreats
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/retreats/onsite" 
                  className="text-[#FAF8F1] opacity-80 hover:opacity-100 transition-opacity"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  Ashram Retreats
                </Link>
              </li>
              <li>
                <Link 
                  href="/retreats/online" 
                  className="text-[#FAF8F1] opacity-80 hover:opacity-100 transition-opacity"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  Online retreats
                </Link>
              </li>
              <li>
                <Link 
                  href="/retreats/faq" 
                  className="text-[#FAF8F1] opacity-80 hover:opacity-100 transition-opacity"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Learn Online */}
          <div>
            <h3 
              className="text-lg font-bold mb-4"
              style={{ fontFamily: 'Optima, sans-serif', fontWeight: 700 }}
            >
              Learn Online
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/teachings" 
                  className="text-[#FAF8F1] opacity-80 hover:opacity-100 transition-opacity"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  Free Teachings Library
                </Link>
              </li>
              <li>
                <Link 
                  href="/learn/courses" 
                  className="text-[#FAF8F1] opacity-80 hover:opacity-100 transition-opacity"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link 
                  href="/learn/more" 
                  className="text-[#FAF8F1] opacity-80 hover:opacity-100 transition-opacity"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  More Online Learning Options
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Membership */}
          <div>
            <h3 
              className="text-lg font-bold mb-4"
              style={{ fontFamily: 'Optima, sans-serif', fontWeight: 700 }}
            >
              Membership
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/calendar" 
                  className="text-[#FAF8F1] opacity-80 hover:opacity-100 transition-opacity"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  Calendar
                </Link>
              </li>
              <li>
                <Link 
                  href="/store" 
                  className="text-[#FAF8F1] opacity-80 hover:opacity-100 transition-opacity"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  Store
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog" 
                  className="text-[#FAF8F1] opacity-80 hover:opacity-100 transition-opacity"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="/donate" 
                  className="text-[#FAF8F1] opacity-80 hover:opacity-100 transition-opacity"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  Donate
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-[#FAF8F1] opacity-80 hover:opacity-100 transition-opacity"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  Contact us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Social Media */}
          <div>
            <h3 
              className="text-lg font-bold mb-4"
              style={{ fontFamily: 'Optima, sans-serif', fontWeight: 700 }}
            >
              Follow Us
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="https://youtube.com" 
                  className="text-[#FAF8F1] opacity-80 hover:opacity-100 transition-opacity flex items-center"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  Youtube
                </Link>
              </li>
              <li>
                <Link 
                  href="https://instagram.com" 
                  className="text-[#FAF8F1] opacity-80 hover:opacity-100 transition-opacity flex items-center"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                  Instagram
                </Link>
              </li>
              <li>
                <Link 
                  href="https://facebook.com" 
                  className="text-[#FAF8F1] opacity-80 hover:opacity-100 transition-opacity flex items-center"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                  Facebook
                </Link>
              </li>
              <li>
                <Link 
                  href="https://spotify.com" 
                  className="text-[#FAF8F1] opacity-80 hover:opacity-100 transition-opacity flex items-center"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.48.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.301.421-1.02.599-1.559.3z"/>
                  </svg>
                  Spotify
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="border-t border-[#FAF8F1] border-opacity-20 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Image
              src="/logo.png"
              alt="SAT YOGA"
              width={100}
              height={32}
              className="h-6 w-auto mr-4"
            />
            <span 
              className="text-[#FAF8F1] opacity-60"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              © {currentYear} Satyoga. All rights reserved.
            </span>
          </div>
          
          <div className="flex space-x-6">
            <Link 
              href="/privacy" 
              className="text-[#FAF8F1] opacity-60 hover:opacity-100 transition-opacity"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              Privacy Policy
            </Link>
            <Link 
              href="/booking" 
              className="text-[#FAF8F1] opacity-60 hover:opacity-100 transition-opacity"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              Booking Policy
            </Link>
            <Link 
              href="/guidelines" 
              className="text-[#FAF8F1] opacity-60 hover:opacity-100 transition-opacity"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              Guidelines
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;