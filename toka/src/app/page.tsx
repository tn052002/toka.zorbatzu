import Link from 'next/link';
import ScreenLayout from '@/components/ScreenLayout';

export default function Home() {
  return (
    <ScreenLayout
      title="Start a moment"
      description="Move through a short flow designed for calm clarity."
    >
      <div className="space-y-4">
        <Link
          href="/moment/domain"
          className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-4 text-sm text-slate-700"
        >
          <span>Begin the reflection</span>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Go</span>
        </Link>
        <div className="rounded-2xl border border-slate-200/60 bg-slate-50 px-4 py-4 text-xs text-slate-500">
          No login. Just a quiet place to gather and respond.
        </div>
      </div>
    </ScreenLayout>
  );
}
