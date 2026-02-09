import Link from 'next/link';
import ScreenLayout from '@/components/ScreenLayout';

const sections = [
  {
    title: 'Pattern',
    body: 'The pattern suggests a steady core with soft edges. Focus on what remains true.',
  },
  {
    title: 'Movement',
    body: 'Change gathers in the third line. Release what no longer supports the question.',
  },
  {
    title: 'Relating',
    body: 'The relating hexagram invites a quieter pace and deeper listening.',
  },
  {
    title: 'Mirror',
    body: 'Notice the reflection: the more you soften your grip, the more clarity arrives.',
  },
  {
    title: 'Cold sentence',
    body: 'Let the answer be slow. Let the next step be kind.',
  },
  {
    title: 'Opening question',
    body: 'What would feel like enough support for you right now?',
  },
];

export default function ResultPage() {
  return (
    <ScreenLayout
      eyebrow="Moment"
      title="Result"
      description="A calm readout of the pattern, movement, and reflection."
    >
      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              {section.title}
            </p>
            <p className="mt-2 text-sm text-slate-700">{section.body}</p>
          </div>
        ))}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <Link href="/moment/cast" className="hover:text-slate-700">
            Back
          </Link>
          <Link
            href="/"
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700"
          >
            Home
          </Link>
        </div>
      </div>
    </ScreenLayout>
  );
}
