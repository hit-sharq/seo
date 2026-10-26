import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SEO Command Center',
  description: 'Unified SEO intelligence for your brands',
};

export default function GlobalError() {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Application Error</h2>
            <p className="text-gray-600 mb-6">
              An unexpected error occurred. Please refresh the page.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
