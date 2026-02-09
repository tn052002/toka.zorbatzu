import MomentShell from '@/components/MomentShell';

export default function DomainPage() {
  return (
    <MomentShell
      eyebrow="Moment"
      title="Name the domain"
      description="Identify the area of life or work that holds your attention."
      nextHref="/moment/question"
      nextLabel="Question"
    >
      <div className="space-y-3">
        <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Domain
        </label>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Example: Creative direction, relationships, leadership, personal energy.
        </div>
      </div>
    </MomentShell>
  );
}
