// app/(main)/contact/page.tsx
import { Contact } from '@/components/contact/Contact';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - Sat Yoga',
  description: 'Get in touch with the Sat Yoga community. We\'re here to help with any questions or inquiries you may have.',
};

export const dynamic = 'force-dynamic';

export default function ContactPage() {
  return (
    <>
      <Contact/>
    </>
  );
}
