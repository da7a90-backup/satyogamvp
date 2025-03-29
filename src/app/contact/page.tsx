// app/(main)/contact/page.tsx
import { Metadata } from 'next';
import Image from 'next/image';
import ContactForm from '@/components/contact/ContactForm';
import {ContactInfo} from '@/components/contact/ContactInfo';
import ContactMap from '@/components/contact/ContactMap';

export const metadata: Metadata = {
  title: 'Contact Us - Sat Yoga',
  description: 'Get in touch with the Sat Yoga community. We\'re here to help with any questions or inquiries you may have.',
};

export default function ContactPage() {
  return (
    <>
      {/* Hero section with quote */}
      <div className="bg-gray-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto italic">
            <blockquote className="text-lg">
              &ldquo;Lorem ipsum dolor sit amet consectetur. Ac risus dignissim nisi magnis. Nisi fermentum nisi porttitor amet blandit sagittis aenean. At sollicitudin ac ornare euismod neque mus aliquam condimentum. Ornare ut elit sit adipiscing placerat ullamcorper suspendisse ut.&rdquo;
            </blockquote>
          </div>
        </div>
      </div>

      {/* Contact section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <ContactInfo />
            </div>
            
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>

      {/* Map section */}
      <div className="h-[400px] w-full relative">
        <ContactMap />
      </div>
    </>
  );
}