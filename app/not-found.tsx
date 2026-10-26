import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-10 text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <p className="text-xl font-semibold text-gray-700 mb-4">Page not found</p>
          <p className="text-gray-600 mb-8">
            The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
          </p>
          <a href="/" className="inline-flex items-center gap-2 btn-primary px-6 py-2.5 rounded-lg">
            Return Home
          </a>
        </div>
      </body>
    </html>
  );
}
