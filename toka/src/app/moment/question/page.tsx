import Link from 'next/link';
import ScreenLayout from '@/components/ScreenLayout';

export default function QuestionPage() {
  return (
    <ScreenLayout
      eyebrow="Moment"
      title="Ask the core question"
      description="Write a single question you can carry gently."
    >
      <div className="space-y-4">
        <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Question
        </label>
        <textarea
          className="min-h-[140px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-inner"
          placeholder="What would make this choice feel aligned three weeks from now?"
        />
        <div className="flex items-center justify-between text-xs text-slate-500">
          <Link href="/moment/domain" className="hover:text-slate-700">
            Back
          </Link>
          <Link
            href="/moment/cast"
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700"
          >
            Cast
          </Link>
        </div>
      </div>
    </ScreenLayout>
  );
}
