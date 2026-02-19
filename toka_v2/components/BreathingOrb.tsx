'use client';

import type { CSSProperties } from 'react';

type BreathingOrbProps = {
  size?: string;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
};

export default function BreathingOrb({ size, onClick, ariaLabel, className, disabled = false }: BreathingOrbProps) {
  const classes = className ? `breathing-orb ${className}` : 'breathing-orb';
  const style = size ? ({ ['--orb-size' as string]: size } as CSSProperties) : undefined;

  if (onClick) {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        aria-disabled={disabled}
        disabled={disabled}
        className={classes}
        onClick={onClick}
        style={style}
      >
        <span className="orb-halo" />
        <span className="orb-core" />
      </button>
    );
  }

  return (
    <div className={classes} aria-hidden="true" style={style}>
      <span className="orb-halo" />
      <span className="orb-core" />
    </div>
  );
}
