'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';

interface MenuItem {
  label: string;
  url: string;
  children?: {
    title: string;
    description: string;
    url: string;
  }[];
}

interface HeaderProps {
  navigation?: MenuItem[];
}

const Header: React.FC<HeaderProps> = ({ navigation }) => {
  const [showBanner, setShowBanner] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const pathname = usePathname();

  // Default navigation
  const defaultNavigation: MenuItem[] = [
    {
      label: 'About',
      url: '/about',
      children: [
        {
          title: 'Sat Yoga',
          description: 'Lorem ipsum dolor sit amet consectetur elit',
          url: '/about/satyoga',
        },
        {
          title: 'Shunyamurti',
          description: 'Lorem ipsum dolor sit amet consectetur elit',
          url: '/about/shunyamurti',
        },
        {
          title: 'Our Ashram',
          description: 'Lorem ipsum dolor sit amet consectetur elit',
          url: '/about/ashram',
        },
      ],
    },
    {
      label: 'Retreats',
      url: '/retreats',
      children: [
        {
          title: 'Ashram Retreats',
          description: 'Lorem ipsum dolor sit amet consectetur elit',
          url: '/retreats/ashram',
        },
        {
          title: 'Online retreats',
          description: 'Lorem ipsum dolor sit amet consectetur elit',
          url: '/retreats/online',
        },
      ],
    },
    {
      label: 'Learn Online',
      url: '/learn-online',
      children: [
        {
          title: 'Free Teachings Library',
          description: 'Explore a curated library of foundational teachings.',
          url: '/learn-online/teachings',
        },
        {
          title: 'Courses',
          description: 'Dive deeper with structured learning opportunities.',
          url: '/learn-online/courses',
        },
      ],
    },
    {
      label: 'Membership',
      url: '/membership',
    },
    {
      label: 'Calendar',
      url: '/calendar',
    },
    {
      label: 'Store',
      url: '/store',
    },
    {
      label: 'Blog',
      url: '/blog',
    },
  ];

  const navItems = navigation || defaultNavigation;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target || (!target.closest('.dropdown-container') && !target.closest('.mobile-menu-container'))) {
        setActiveDropdown(null);
      }
    };

    // Only add click outside listener if mobile menu is closed
    if (!isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleDropdownToggle = (label: string) => {
    setActiveDropdown(prevState => (prevState === label ? null : label));
  };

  const handleDropdownLinkClick = () => {
    // Small delay to ensure navigation completes before closing dropdown
    setTimeout(() => {
      setActiveDropdown(null);
    }, 100);
  };

  const handleMobileLinkClick = (e: React.MouseEvent, url: string) => {
    // Don't prevent default - let Next.js handle the navigation
    e.stopPropagation(); // Prevent event bubbling
    // Close menu after a small delay to allow navigation
    setTimeout(() => {
      setIsMenuOpen(false);
      setActiveDropdown(null);
    }, 50);
  };

  const ChevronDownIcon = ({ isOpen }: { isOpen: boolean }) => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 20 20" 
      fill="none" 
      className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
    >
      <path 
        d="M5 7.5L10 12.5L15 7.5" 
        stroke="currentColor" 
        strokeWidth="1.67" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );

  const SearchIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );

  const HamburgerIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  return (
    <header className="relative z-30 font-sans">
      {/* Promotional Banner */}
      {showBanner && (
        <div 
          className="px-4 md:px-16 h-12 flex items-center justify-center relative text-white"
          style={{ backgroundColor: '#7D1A13' }}
        >
          <div className="flex items-center gap-4 w-full max-w-screen-xl justify-center">
            <p className="text-white text-base font-normal leading-6 m-0 text-center">
              Free Meditation Course{' '}
              <Link 
                href="/enroll" 
                className="text-white underline font-semibold hover:no-underline"
              >
                Enroll Now
              </Link>
            </p>
            <button
              onClick={() => setShowBanner(false)}
              className="absolute right-4 bg-transparent border-none text-white cursor-pointer p-1 hover:opacity-80"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="border-b border-black dropdown-container" style={{ backgroundColor: '#FAF8F1' }}>
        <div className="px-4 md:px-16 h-16 flex items-center justify-between max-w-screen-2xl mx-auto py-8">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center no-underline"
          >
            <img width={186} height={43} src='/logo_black.svg'/>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.url || pathname.startsWith(item.url + '/');
              return (
                <div key={item.label} className="relative">
                  {item.children ? (
                    <button
                      onClick={() => handleDropdownToggle(item.label)}
                      className={`flex items-center gap-1 bg-transparent border-none cursor-pointer text-base py-1 leading-6 transition-colors ${
                        isActive || activeDropdown === item.label 
                          ? 'font-bold' 
                          : 'font-normal'
                      }`}
                      style={{ 
                        color: isActive || activeDropdown === item.label ? '#7D1A13' : '#000000',
                        fontFamily: 'Avenir Next, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
                      }}
                    >
                      {item.label}
                      <ChevronDownIcon isOpen={activeDropdown === item.label} />
                    </button>
                  ) : (
                    <Link
                      href={item.url}
                      className={`text-base no-underline py-1 leading-6 transition-colors hover:opacity-80 ${
                        isActive ? 'font-bold' : 'font-normal'
                      }`}
                      style={{ 
                        color: isActive ? '#7D1A13' : '#000000',
                        fontFamily: 'Avenir Next, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
                      }}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Search Button */}
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="bg-transparent border-none cursor-pointer px-3 py-2 flex items-center text-black hover:opacity-70 transition-opacity"
              aria-label="Search"
            >
              <SearchIcon />
            </button>
            
            {/* Cart Button */}
            <button 
              className="bg-transparent border-none cursor-pointer px-3 py-2 flex items-center text-black hover:opacity-70 transition-opacity"
              aria-label="Cart"
            >
              <ShoppingCart />
            </button>

            {/* Donate Button */}
            <Link 
              href="/donate"
              className="hidden md:block border-none outline-none bg-transparent text-black rounded-lg px-4 py-2.5 text-base font-semibold no-underline hover:opacity-90 transition-opacity"
              style={{
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              Donate
            </Link>

            {/* Login Button */}
            <Link 
              href="/login"
              className="hidden md:block bg-white text-black border-none rounded-lg px-4 py-2.5 text-base font-semibold no-underline hover:opacity-90 transition-opacity"
              style={{
                boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              Login
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden bg-white border-none rounded-lg cursor-pointer p-2 flex items-center justify-center hover:opacity-80 transition-opacity"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ color: '#414651' }}
              aria-label="Menu"
            >
              <HamburgerIcon />
            </button>
          </div>
        </div>
      </nav>

      {/* Search Bar */}
      {showSearch && (
        <div className="absolute left-0 right-0 bg-white border-b border-black px-3 py-6 z-10" style={{ top: '100%' }}>
          <div className="max-w-screen-2xl mx-auto relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search courses"
              className="w-full pl-12 pr-3 py-3 text-base border-none outline-none bg-transparent text-black focus:ring-0"
            />
          </div>
        </div>
      )}

      {/* Dropdown Menu */}
      {activeDropdown && (
        <div className="absolute left-0 right-0 bg-white z-10 dropdown-container" style={{ top: '100%' }}>
          <div className="pt-8 px-4 md:px-16 max-w-screen-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 mb-8">
              {navItems.find(item => item.label === activeDropdown)?.children?.map((child, index) => (
                <Link 
                  key={index} 
                  href={child.url}
                  className="no-underline block hover:opacity-80 transition-opacity"
                  onClick={handleDropdownLinkClick}
                >
                  <div className="py-2">
                    <h3 
                      className="text-base font-semibold text-black m-0 mb-1 leading-6"
                      style={{ fontFamily: 'Avenir Next, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}
                    >
                      {child.title}
                    </h3>
                    <p 
                      className="text-sm font-normal text-black m-0 leading-5"
                      style={{ fontFamily: 'Avenir Next, -apple-system, BlinkMacSystemFont, Segue UI, sans-serif' }}
                    >
                      {child.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Newsletter Banner in Dropdown */}
          <div 
            className="border-b border-black py-4 text-center w-full"
            style={{ backgroundColor: '#323030' }}
          >
            <p className="text-white m-0 text-base leading-6">
              Receive Our Newsletter{' '}
              <Link 
                href="/subscribe" 
                className="text-white underline font-semibold hover:no-underline"
              >
                Subscribe
              </Link>
            </p>
          </div>
        </div>
      )}
        
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div 
          className="md:hidden absolute left-0 right-0 bg-white z-20 max-h-screen overflow-y-auto mobile-menu-container"
          style={{ 
            top: '100%',
            boxShadow: '0px 12px 16px -4px rgba(10, 13, 18, 0.08), 0px 4px 6px -2px rgba(10, 13, 18, 0.03), 0px 2px 2px -1px rgba(10, 13, 18, 0.04)'
          }}
        >
          <div 
            className="py-5 border-b" 
            style={{ 
              backgroundColor: '#FAF8F1', 
              borderColor: '#E9EAEB' 
            }}
          >
            {navItems.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => handleDropdownToggle(item.label)}
                      className="flex items-center justify-between w-full px-4 py-3 bg-transparent border-none text-base font-semibold text-left cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ 
                        color: '#181D27',
                        fontFamily: 'Avenir Next, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
                      }}
                    >
                      {item.label}
                      <ChevronDownIcon isOpen={activeDropdown === item.label} />
                    </button>
                    {activeDropdown === item.label && (
                      <div className="pb-5">
                        {item.children.map((child, childIndex) => (
                          <Link
                            key={childIndex}
                            href={child.url}
                            className="block px-4 py-3 text-base font-medium no-underline hover:opacity-80 transition-opacity"
                            style={{ 
                              color: '#404040',
                              fontFamily: 'Avenir Next, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
                            }}
                            onClick={(e) => handleMobileLinkClick(e, child.url)}
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.url}
                    className={`block px-4 py-3 text-base no-underline hover:opacity-80 transition-opacity ${
                      pathname === item.url ? 'font-semibold' : 'font-medium'
                    }`}
                    style={{ 
                      color: pathname === item.url ? '#7D1A13' : '#404040',
                      fontFamily: 'Avenir Next, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
                    }}
                    onClick={(e) => handleMobileLinkClick(e, item.url)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
          
          {/* Mobile Footer Actions */}
          <div 
            className="px-4 py-6" 
            style={{ backgroundColor: '#FAF8F1' }}
          >
            <div className="flex flex-col gap-3">
              <Link 
                href="/donate"
                className="bg-white text-black border-none rounded-lg px-4 py-2.5 text-base font-semibold no-underline text-center hover:opacity-90 transition-opacity"
                style={{
                  boxShadow: 'inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)',
                  filter: 'drop-shadow(0px 1px 2px rgba(16, 24, 40, 0.05))',
                  fontFamily: 'Montserrat, sans-serif'
                }}
                onClick={(e) => handleMobileLinkClick(e, "/donate")}
              >
                Donate
              </Link>
              <Link 
                href="/login"
                className="bg-white text-black border-none rounded-lg px-4 py-2.5 text-base font-semibold no-underline text-center hover:opacity-90 transition-opacity"
                style={{
                  boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)',
                  fontFamily: 'Montserrat, sans-serif'
                }}
                onClick={(e) => handleMobileLinkClick(e, "/login")}
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;