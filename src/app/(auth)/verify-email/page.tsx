import Link from 'next/link';
import { MailCheck, ArrowRight } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto mb-4">
          <MailCheck className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
          Verify Your Email
        </h1>
        <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto mb-6">
          We&apos;ve sent a verification link to your email address. Please click the link in the message to confirm your account and activate profile publishing.
        </p>

        <div className="space-y-3">
          <Link
            href="/login"
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="block text-xs text-slate-400 hover:text-slate-600"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
