import MomentShell from '@/components/MomentShell';

export default function QuestionPage() {
  return (
    <MomentShell
      eyebrow="Moment"
      title="Ask the core question"
      description="Shape a single question you can hold with care."
      nextHref="/moment/cast"
      nextLabel="Cast"
    >
      <div className="space-y-3">
        <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Question
        </label>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          Example: What would make this decision feel aligned a month from now?
        </div>
      </div>
    </MomentShell>
  );
}
