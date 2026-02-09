import MomentShell from '@/components/MomentShell';

const castItems = [
  'Signals: What evidence do I have right now?',
  'People: Who is affected or present in this story?',
  'Emotions: What feeling is asking to be heard?',
];

export default function CastPage() {
  return (
    <MomentShell
      eyebrow="Moment"
      title="Cast the moment"
      description="Collect the elements that are shaping your perspective."
      nextHref="/moment/result"
      nextLabel="Result"
    >
      <ul className="space-y-3 text-sm text-slate-600">
        {castItems.map((item) => (
          <li
            key={item}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
          >
            {item}
          </li>
        ))}
      </ul>
    </MomentShell>
  );
}
