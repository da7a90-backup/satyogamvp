'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';

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
  const pathname = usePathname();

  // Default navigation if none provided
  const defaultNavigation: MenuItem[] = [
    {
      label: 'Home',
      url: '/',
    },
    {
      label: 'About',
      url: '/about',
      children: [
        {
          title: 'Shunyamurti',
          description: 'Lorem ipsum dolor sit amet consectetur elit',
          url: '/about/shunyamurti',
          icon: 'CubeIcon',
        },
        {
          title: 'The Asharam',
          description: 'Lorem ipsum dolor sit amet consectetur elit',
          url: '/about/asharam',
          icon: 'CubeIcon',
        },
        {
          title: 'The community',
          description: 'Lorem ipsum dolor sit amet consectetur elit',
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
          title: 'Online retreats',
          description: 'Lorem ipsum dolor sit amet consectetur elit',
          url: '/retreats/online',
          icon: 'CubeIcon',
        },
        {
          title: 'Onsite retreats',
          description: 'Lorem ipsum dolor sit amet consectetur elit',
          url: '/retreats/onsite',
          icon: 'CubeIcon',
        },
        {
          title: 'FAQs',
          description: 'Lorem ipsum dolor sit amet consectetur elit',
          url: '/retreats/faqs',
          icon: 'CubeIcon',
        },
      ],
    },
    {
      label: 'Study online',
      url: '/study-online',
      children: [
        {
          title: 'Teachings (SatYoga Tube)',
          description: 'Lorem ipsum dolor sit amet consectetur elit',
          url: '/study-online/teachings',
          icon: 'CubeIcon',
        },
        {
          title: 'Courses',
          description: 'Lorem ipsum dolor sit amet consectetur elit',
          url: '/study-online/courses',
          icon: 'CubeIcon',
        },
        {
          title: 'More',
          description: 'Lorem ipsum dolor sit amet consectetur elit',
          url: '/study-online/more',
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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close if clicking outside the navigation area
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
    <header className="relative z-30">
      {/* Promotional Banner */}
      {showBanner && (
        <div className="relative bg-white text-center py-3 px-4 border-b">
          <p className="text-sm font-medium">
            Discove our Free courses <Link href="/courses" className="font-bold underline ml-1">available now</Link>
          </p>
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2"
            onClick={() => setShowBanner(false)}
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Main Navigation */}
      <div className="bg-white border-b py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-serif italic">Logo</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.label} className="relative">
                {item.children ? (
                  // Item with dropdown
                  <button
                    onClick={() => handleDropdownToggle(item.label)}
                    className={`flex items-center py-2 ${
                      activeDropdown === item.label || pathname.startsWith(item.url)
                        ? 'text-purple-700'
                        : 'text-gray-700 hover:text-purple-700'
                    }`}
                    aria-expanded={activeDropdown === item.label}
                  >
                    {item.label}
                    {renderDropdownIcon(item.label)}
                  </button>
                ) : (
                  // Regular link
                  <Link
                    href={item.url}
                    className={`py-2 ${
                      pathname === item.url
                        ? 'text-purple-700'
                        : 'text-gray-700 hover:text-purple-700'
                    }`}
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
              className="p-2 text-gray-500 hover:text-purple-700" 
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            {/* Donate Button */}
            <Link 
              href="/donate" 
              className="hidden md:block bg-white text-gray-700 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Donate
            </Link>
            
            {/* Login Button */}
            <Link 
              href="/login" 
              className="hidden md:block bg-gray-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800"
            >
              Login
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-gray-500 hover:text-purple-700" 
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

      {/* Dropdown Menus - Full Width */}
      {activeDropdown && (
        <div className="absolute left-0 right-0 bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-3 gap-12">
              {navItems.find(item => item.label === activeDropdown)?.children?.map((child, index) => (
                <Link 
                  key={index} 
                  href={child.url}
                  className="flex items-start gap-4 group"
                >
                  <div className="flex-shrink-0 mt-1">
                    {renderIcon(child.icon)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-purple-700">
                      {child.title}
                    </p>
                    {child.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {child.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Sign Up Banner inside dropdown */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm">
                Ready to get started? <Link href="/signup" className="font-medium text-purple-700 hover:text-purple-800">Sign up for free</Link>
              </p>
            </div>
          </div>
        </div>
      )}
        
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <nav className="flex flex-col px-4 py-3 space-y-3">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => handleDropdownToggle(item.label)}
                      className="flex items-center justify-between w-full py-2 text-left"
                      aria-expanded={activeDropdown === item.label}
                    >
                      <span className={activeDropdown === item.label ? 'text-purple-700' : 'text-gray-700'}>
                        {item.label}
                      </span>
                      {renderDropdownIcon(item.label)}
                    </button>
                    {activeDropdown === item.label && (
                      <div className="pl-4 mt-2 mb-2 space-y-3 border-l border-gray-200">
                        {item.children.map((child, index) => (
                          <Link
                            key={index}
                            href={child.url}
                            className="flex py-2 text-gray-600 hover:text-purple-700"
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
                    className={`block py-2 ${
                      pathname === item.url ? 'text-purple-700' : 'text-gray-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            
            <div className="flex space-x-2 pt-3 border-t">
              <Link 
                href="/donate" 
                className="bg-white text-gray-700 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-50 flex-1 text-center"
              >
                Donate
              </Link>
              <Link 
                href="/login" 
                className="bg-gray-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 flex-1 text-center"
              >
                Login
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Search Bar - Only shown when needed */}
      {!activeDropdown && (pathname === '/courses' || pathname === '/search') && (
        <div className="border-b py-4">
          <div className="container mx-auto px-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search courses"
                className="pl-10 py-2 w-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-purple-500 border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Sign Up Banner has been moved inside the dropdown panel */}
    </header>
  );
};

export default Header;