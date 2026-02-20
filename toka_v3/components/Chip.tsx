import type { ReactNode } from 'react';

type ChipProps = {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
};

export default function Chip({ selected, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-md border px-3 py-1.5 text-xs transition-colors duration-calm',
        selected
          ? 'border-text bg-text text-white'
          : 'border-text/35 bg-transparent text-text/80 hover:border-text/55 hover:text-text',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
