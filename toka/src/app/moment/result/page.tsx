import MomentShell from '@/components/MomentShell';

export default function ResultPage() {
  return (
    <MomentShell
      eyebrow="Moment"
      title="Reflection"
      description="A quiet synthesis of what you have gathered."
    >
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
        <p>
          You have named the domain, shaped the question, and surfaced the cast. Let
          the signal settle before you choose the next move.
        </p>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Close the moment when ready.
        </p>
      </div>
    </MomentShell>
  );
}
