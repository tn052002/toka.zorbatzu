import Link from 'next/link';

const steps = [
  {
    title: 'Define the domain',
    description: 'Name the space you are exploring right now.',
    href: '/moment/domain',
  },
  {
    title: 'Ask the core question',
    description: 'What are you truly seeking to understand?',
    href: '/moment/question',
  },
  {
    title: 'Cast the moment',
    description: 'Collect the signals, people, and emotions that matter.',
    href: '/moment/cast',
  },
  {
    title: 'Read the result',
    description: 'A quiet summary to reflect on.',
    href: '/moment/result',
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-6">
      <section className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
        <h2 className="font-[var(--font-fraunces)] text-2xl">Start a moment</h2>
        <p className="mt-2 text-sm text-slate-600">
          Follow a gentle flow designed for clarity and calm focus.
        </p>
        <div className="mt-5 flex flex-col gap-3">
          {steps.map((step) => (
            <Link
              key={step.href}
              href={step.href}
              className="group flex flex-col rounded-2xl border border-slate-200/60 bg-white px-4 py-3 transition"
            >
              <span className="text-sm font-semibold text-slate-900">
                {step.title}
              </span>
              <span className="text-xs text-slate-500 group-hover:text-slate-600">
                {step.description}
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="rounded-3xl border border-slate-200/60 bg-white/80 p-6">
        <h3 className="text-sm uppercase tracking-[0.3em] text-slate-500">Daily cue</h3>
        <p className="mt-3 text-lg text-slate-800">
          "Notice what is steady before you respond to what is loud."
        </p>
      </section>
    </main>
  );
}
