import type { ReactNode } from 'react';

type SectionCardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export default function SectionCard({ title, children, className = '' }: SectionCardProps) {
  return (
    <section className={`rounded-md border border-text/15 bg-white/40 p-4 ${className}`.trim()}>
      {title ? <h3 className="mb-3 font-serif text-base text-text">{title}</h3> : null}
      {children}
    </section>
  );
}
