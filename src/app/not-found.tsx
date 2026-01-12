import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-white text-slate-900 antialiased">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-9xl font-black text-slate-200">404</h1>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Page not found</h2>
          <p className="text-slate-500">
            {/* FIX: Use &apos; instead of ' */}
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
        </div>
        
        <Link 
          href="/dashboard" 
          className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white transition-all bg-emerald-600 rounded-lg hover:bg-emerald-700 active:scale-95"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
