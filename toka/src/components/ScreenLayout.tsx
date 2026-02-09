type ScreenLayoutProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function ScreenLayout({ eyebrow, title, description, children }: ScreenLayoutProps) {
  return (
    <main className="flex flex-1 flex-col gap-6">
      <section className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{eyebrow}</p>
        ) : null}
        <h2 className="mt-3 font-[var(--font-fraunces)] text-2xl text-slate-900">{title}</h2>
        {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}
