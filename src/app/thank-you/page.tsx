// app/thank-you/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Thank You - Sat Yoga',
  description: 'Thank you for your generous contribution to Sat Yoga.',
};

export const dynamic = 'force-dynamic';

export default function ThankYouPage() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <svg className="w-16 h-16 text-green-500 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <h1 className="text-4xl font-bold mb-4">Thank You for Your Donation!</h1>
      <p className="text-xl mb-8 max-w-2xl mx-auto">
        Your generous contribution will help support our mission to create a more spiritual and ecological culture and foster human and planetary rebirth.
      </p>
      <p className="text-lg mb-12 max-w-2xl mx-auto">
        A confirmation email has been sent with details of your donation. If you have any questions, please contact us at support@satyoga.org.
      </p>
      <Link href="/" className="inline-block bg-gray-900 text-white rounded-md px-6 py-3 font-medium hover:bg-gray-800">
        Return to Home
      </Link>
    </div>
  );
}
