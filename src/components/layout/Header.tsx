'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import UserNavigation from './UserNavigation';

interface MenuItem {
  label: string;
  url: string;
  children?: {
    title: string;
    description: string;
    url: string;
    icon?: string;
  }[];
}

interface HeaderProps {
  navigation?: MenuItem[];
}

const Header: React.FC<HeaderProps> = ({ navigation }) => {
  const [showBanner, setShowBanner] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Check if we're on the homepage
  const isHomepage = pathname === '/';

  // Default navigation if none provided
  const defaultNavigation: MenuItem[] = [
    {
      label: 'About',
      url: '/about',
      children: [
        {
          title: 'Shunyamurti',
          description: 'Meet our spiritual teacher and founder',
          url: '/about/shunyamurti',
          icon: 'CubeIcon',
        },
        {
          title: 'The Ashram',
          description: 'Discover our spiritual community in Costa Rica',
          url: '/about/ashram',
          icon: 'CubeIcon',
        },
        {
          title: 'The Community',
          description: 'Join our global sangha of seekers',
          url: '/about/community',
          icon: 'CubeIcon',
        },
      ],
    },
    {
      label: 'Retreats',
      url: '/retreats',
      children: [
        {
          title: 'Online Retreats',
          description: 'Transform from the comfort of your home',
          url: '/retreats/online',
          icon: 'CubeIcon',
        },
        {
          title: 'Ashram Retreats',
          description: 'Immersive experiences in Costa Rica',
          url: '/retreats/ashram',
          icon: 'CubeIcon',
        },
        {
          title: 'FAQs',
          description: 'Common questions about our retreats',
          url: '/retreats/faqs',
          icon: 'CubeIcon',
        },
      ],
    },
    {
      label: 'Learn Online',
      url: '/online',
      children: [
        {
          title: 'Free Teachings',
          description: 'Start your journey with free wisdom',
          url: '/teachings',
          icon: 'CubeIcon',
        },
        {
          title: 'Courses',
          description: 'Structured learning paths',
          url: '/courses',
          icon: 'CubeIcon',
        },
        {
          title: 'Membership',
          description: 'Access premium content and community',
          url: '/membership',
          icon: 'CubeIcon',
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

  // Handle scroll effect for homepage transparency
  useEffect(() => {
    if (!isHomepage) return;
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomepage]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!event.target || !(event.target as Element).closest('nav')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle dropdown menu
  const handleDropdownToggle = (label: string) => {
    setActiveDropdown(prevState => (prevState === label ? null : label));
  };

  // Determine header styles based on homepage state
  const isTransparent = isHomepage && !isScrolled;
  const headerBg = isTransparent ? 'bg-transparent' : 'bg-[#FAF8F1]';
  const headerPosition = isHomepage ? 'fixed' : 'relative';
  const headerBorder = isTransparent ? '' : 'border-b border-gray-200';
  const textColor = isTransparent ? 'text-white' : 'text-[#300001]';
  const textColorHover = isTransparent ? 'hover:text-gray-200' : 'hover:text-[#4a0002]';
  const logoFilter = isTransparent ? 'brightness-0 invert' : '';

  // Function to render the dropdown chevron
  const renderDropdownIcon = (label: string) => {
    const isOpen = activeDropdown === label;
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-4 w-4 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path 
          fillRule="evenodd" 
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
          clipRule="evenodd" 
        />
      </svg>
    );
  };

  // Function to render the cube icon
  const renderIcon = (iconName?: string) => {
    if (iconName === 'CubeIcon') {
      return (
        <svg
          className="w-6 h-6 text-gray-800"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      );
    }
    return null;
  };

  return (
    <header className={`${headerPosition} top-0 left-0 right-0 z-50 transition-all duration-300`}>
      {/* Promotional Banner - Only show if not transparent */}
      {showBanner && !isTransparent && (
        <div className="relative bg-[#300001] text-center py-3 px-4 border-b border-[#4a0002]">
          <p className="text-sm font-medium text-[#FAF8F1]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Free Meditation Course <Link href="/courses" className="font-bold underline ml-1 text-[#FAF8F1]">Enroll Now</Link>
          </p>
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FAF8F1] hover:text-white"
            onClick={() => setShowBanner(false)}
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Main Navigation */}
      <div className={`${headerBg} ${headerBorder} py-4 ${isTransparent ? 'shadow-none' : 'shadow-sm'}`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="SAT YOGA"
              width={120}
              height={40}
              className={`h-8 w-auto transition-all duration-300 ${logoFilter}`}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.label} className="relative">
                {item.children ? (
                  // Item with dropdown
                  <button
                    onClick={() => handleDropdownToggle(item.label)}
                    className={`flex items-center py-2 text-sm font-medium transition-colors ${
                      activeDropdown === item.label || pathname.startsWith(item.url)
                        ? textColor
                        : `${textColor} ${textColorHover}`
                    }`}
                    style={{ fontFamily: 'Avenir Next, sans-serif' }}
                    aria-expanded={activeDropdown === item.label}
                  >
                    {item.label}
                    {renderDropdownIcon(item.label)}
                  </button>
                ) : (
                  // Regular link
                  <Link
                    href={item.url}
                    className={`py-2 text-sm font-medium transition-colors ${
                      pathname === item.url
                        ? textColor
                        : `${textColor} ${textColorHover}`
                    }`}
                    style={{ fontFamily: 'Avenir Next, sans-serif' }}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <button 
              className={`p-2 transition-colors ${textColor} ${textColorHover}`}
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            {/* Donate Button */}
            <Link 
              href="/donate" 
              className={`px-4 py-2 text-sm font-medium transition-colors border rounded-md ${
                isTransparent 
                  ? 'border-white text-white hover:bg-white hover:text-gray-900' 
                  : 'border-[#300001] text-[#300001] hover:bg-[#300001] hover:text-white'
              }`}
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              Donate
            </Link>
            
            {/* Login Button */}
            <Link 
              href="/login" 
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isTransparent 
                  ? 'bg-white text-gray-900 hover:bg-gray-100' 
                  : 'bg-[#300001] text-white hover:bg-[#4a0002]'
              }`}
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              Login
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              className={`md:hidden p-2 transition-colors ${textColor} ${textColorHover}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
              aria-expanded={isMenuOpen}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown Menus - Only show if not on mobile and not transparent */}
      {activeDropdown && !isTransparent && (
        <div className="absolute left-0 right-0 bg-[#FAF8F1] border-b border-gray-200 shadow-lg z-40">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-3 gap-12">
              {navItems.find(item => item.label === activeDropdown)?.children?.map((child, index) => (
                <Link 
                  key={index} 
                  href={child.url}
                  className="flex items-start gap-4 group"
                  onClick={() => setActiveDropdown(null)}
                >
                  <div className="flex-shrink-0 mt-1">
                    {renderIcon(child.icon)}
                  </div>
                  <div>
                    <p className="font-medium text-[#300001] group-hover:text-[#4a0002] transition-colors" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                      {child.title}
                    </p>
                    {child.description && (
                      <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                        {child.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Sign Up Banner inside dropdown */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                Ready to get started? <Link href="/signup" className="font-medium text-[#300001] hover:text-[#4a0002] transition-colors">Sign up for free</Link>
              </p>
            </div>
          </div>
        </div>
      )}
        
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#FAF8F1] border-t border-gray-200 shadow-lg">
          <nav className="flex flex-col px-4 py-3 space-y-3">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => handleDropdownToggle(item.label)}
                      className="flex items-center justify-between w-full py-2 text-left text-[#300001]"
                      style={{ fontFamily: 'Avenir Next, sans-serif' }}
                      aria-expanded={activeDropdown === item.label}
                    >
                      <span className={activeDropdown === item.label ? 'text-[#4a0002]' : 'text-[#300001]'}>
                        {item.label}
                      </span>
                      {renderDropdownIcon(item.label)}
                    </button>
                    {activeDropdown === item.label && (
                      <div className="pl-4 mt-2 mb-2 space-y-3 border-l border-gray-300">
                        {item.children.map((child, index) => (
                          <Link
                            key={index}
                            href={child.url}
                            className="flex py-2 text-gray-600 hover:text-[#300001] transition-colors"
                            style={{ fontFamily: 'Avenir Next, sans-serif' }}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <div>
                              <p className="font-medium">{child.title}</p>
                              {child.description && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {child.description}
                                </p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.url}
                    className={`block py-2 transition-colors ${
                      pathname === item.url ? 'text-[#300001]' : 'text-[#300001] hover:text-[#4a0002]'
                    }`}
                    style={{ fontFamily: 'Avenir Next, sans-serif' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            
            <div className="flex space-x-2 pt-3 border-t border-gray-300">
              <Link 
                href="/donate" 
                className="bg-white text-[#300001] border border-[#300001] rounded-md px-4 py-2 text-sm font-medium hover:bg-[#300001] hover:text-white transition-colors flex-1 text-center"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                Donate
              </Link>
              <Link 
                href="/login" 
                className="bg-[#300001] text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-[#4a0002] transition-colors flex-1 text-center"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                Login
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;