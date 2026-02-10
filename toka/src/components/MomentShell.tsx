'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n/useI18n';

type MomentShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  nextHref?: string;
  nextLabel?: string;
};

export default function MomentShell({
  eyebrow,
  title,
  description,
  children,
  nextHref,
  nextLabel,
}: MomentShellProps) {
  const { t } = useI18n();

  return (
    <main className="flex flex-1 flex-col gap-6">
      <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.35)]">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-[var(--font-fraunces)] text-2xl text-slate-900">
          {title}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        {children ? <div className="mt-5">{children}</div> : null}
      </section>
      <section className="flex items-center justify-between text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-700">
          {t('nav_back_home')}
        </Link>
        {nextHref ? (
          <Link
            href={nextHref}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700"
          >
            {nextLabel ?? t('nav_next')}
          </Link>
        ) : null}
      </section>
    </main>
  );
}
