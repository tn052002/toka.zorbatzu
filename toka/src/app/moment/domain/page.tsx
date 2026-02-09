import Link from 'next/link';
import ScreenLayout from '@/components/ScreenLayout';

const domains = [
  'Creative direction',
  'Relationships',
  'Leadership',
  'Personal energy',
  'Home + space',
  'Work rhythm',
];

export default function DomainPage() {
  return (
    <ScreenLayout
      eyebrow="Moment"
      title="Name the domain"
      description="Pick the space that holds your attention."
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {domains.map((domain) => (
            <button
              key={domain}
              type="button"
              className="rounded-2xl border border-slate-200 bg-white px-3 py-4 text-left text-slate-700"
            >
              {domain}
            </button>
          ))}
          <button
            type="button"
            className="col-span-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-left text-slate-500"
          >
            Other domain...
          </button>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-700">
            Back home
          </Link>
          <Link
            href="/moment/question"
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700"
          >
            Question
          </Link>
        </div>
      </div>
    </ScreenLayout>
  );
}
