'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, RefreshCw, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Admin Console Error</h1>
        <p className="text-slate-600 mb-8">
          There was an error loading the admin tools. Please try again or return to the dashboard.
        </p>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => reset()} 
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Tools
          </Button>
          
          <Link href="/dashboard" className="w-full">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 text-left">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Technical Info</p>
            <pre className="text-[10px] bg-slate-50 p-3 rounded-lg border border-slate-100 text-red-500 overflow-auto max-h-32">
              {error.message}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
