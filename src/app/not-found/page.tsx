import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Teaching Not Found</h2>
        <p className="text-gray-600 mb-6">
          The teaching you're looking for doesn't exist or has been removed.
        </p>
        <Link 
          href="/teachings" 
          className="inline-block px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Back to Teachings
        </Link>
      </div>
    </div>
  );
}