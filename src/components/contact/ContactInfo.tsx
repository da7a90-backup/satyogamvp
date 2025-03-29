'use client';

import { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';

// Contact Info Component
interface ContactInfoProps {
  email?: string;
  phone?: string;
  address?: string;
  subheading?: string;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({
  email = 'hello@satyoga.com',
  phone = '+1 (000) 000-0000',
  address = 'Fila San Marcos, Rio Nuevo, Perez Zeledon, Costa Rica',
  subheading = 'Do you need more information?'
}) => {
  return (
    <div className="max-w-lg">
      {subheading && (
        <p className="text-purple-600 mb-2">{subheading}</p>
      )}
      <h2 className="text-3xl font-bold mb-4">Contact us</h2>
      <p className="text-gray-700 mb-8">
        We'd love to hear from you! Whether you have questions, need 
        assistance, or simply want to connect, we're here to help.
      </p>
      
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 text-gray-500 mr-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <Link href={`mailto:${email}`} className="text-gray-700 hover:text-purple-700">
              {email}
            </Link>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex-shrink-0 text-gray-500 mr-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <Link href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="text-gray-700 hover:text-purple-700">
              {phone}
            </Link>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex-shrink-0 text-gray-500 mr-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <address className="text-gray-700 not-italic">
              {address}
            </address>
          </div>
        </div>
      </div>
    </div>
  );
};
