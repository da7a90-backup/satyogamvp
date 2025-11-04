import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Thank You - Donation Received',
  description: 'Thank you for your generous donation to Sat Yoga',
};

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-12 text-center">
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Thank You Message */}
        <h1
          className="text-4xl font-bold mb-4 text-gray-900"
          style={{ fontFamily: 'Optima, Georgia, serif' }}
        >
          Thank You for Your Generosity
        </h1>

        <p
          className="text-lg text-gray-700 mb-8"
          style={{ fontFamily: 'Avenir Next, sans-serif', lineHeight: '1.8' }}
        >
          Your donation has been received successfully. Your support helps us continue our mission of spiritual awakening and service to humanity.
          <br /><br />
          A confirmation email has been sent to your inbox with the details of your donation.
        </p>

        {/* Quote */}
        <div className="bg-[#FAF8F1] rounded-lg p-6 mb-8">
          <p
            className="text-[#9C7520] italic"
            style={{ fontFamily: 'Optima, Georgia, serif', fontSize: '18px', lineHeight: '1.6' }}
          >
            &quot;The joy of sharing and serving brings true abundance. Your generosity creates ripples of peace and transformation throughout the world.&quot;
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 bg-[#7D1A13] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            Return to Home
          </Link>
          <Link
            href="/teachings"
            className="px-8 py-3 bg-white border-2 border-[#7D1A13] text-[#7D1A13] rounded-lg font-semibold hover:bg-[#FAF8F1] transition-colors"
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            Explore Teachings
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p
            className="text-sm text-gray-600"
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            If you have any questions about your donation, please contact us at{' '}
            <a href="mailto:support@satyoga.org" className="text-[#7D1A13] hover:underline">
              support@satyoga.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
