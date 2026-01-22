export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#7D1A13] mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">The page you are looking for does not exist.</p>
        <a href="/" className="bg-[#7D1A13] text-white px-6 py-3 rounded-lg hover:bg-[#942017] transition-colors">
          Go Home
        </a>
      </div>
    </div>
  );
}
