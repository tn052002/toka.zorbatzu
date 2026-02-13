type ScreenLayoutProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'compact';
  tone?: 'glass' | 'solid';
};

export default function ScreenLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
  variant = 'default',
  tone = 'glass',
}: ScreenLayoutProps) {
  const padding = variant === 'compact' ? 'p-5 sm:p-6' : 'p-6 sm:p-7';
  const cardTone =
    tone === 'solid'
      ? 'bg-white border-slate-200/70'
      : 'bg-white/70 border-white/60 backdrop-blur';

  return (
    <main className="flex flex-1 flex-col">
      <section
        className={[
          'rounded-3xl shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)]',
          'border',
          cardTone,
          padding,
        ].join(' ')}
      >
        {eyebrow ? (
          <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">{eyebrow}</p>
        ) : null}

        <h2 className={`mt-2 font-[var(--font-fraunces)] text-2xl text-slate-900`}>
          {title}
        </h2>

        {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}

        <div className="mt-6">{children}</div>

        {footer ? <div className="mt-6 border-t border-slate-200/60 pt-4">{footer}</div> : null}
      </section>
    </main>
  );
}
