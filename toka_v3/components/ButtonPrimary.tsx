import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonPrimaryProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export default function ButtonPrimary({ children, className = '', ...props }: ButtonPrimaryProps) {
  return (
    <button
      {...props}
      className={[
        'rounded-md bg-text px-4 py-2.5 text-sm font-medium text-white transition-opacity duration-calm',
        'disabled:cursor-not-allowed disabled:opacity-40',
        'hover:opacity-90 active:opacity-85',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}
