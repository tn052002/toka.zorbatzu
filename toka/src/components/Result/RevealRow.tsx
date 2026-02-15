import InlineButton from '@/components/ui/InlineButton';

type RevealRowProps = {
  label: string;
  actionText: string;
  onAction: () => void;
  disabled?: boolean;
};

export default function RevealRow({
  label,
  actionText,
  onAction,
  disabled = false,
}: RevealRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 backdrop-blur">
      <span className="text-sm text-slate-700">{label}</span>
      <InlineButton onClick={onAction} disabled={disabled}>
        {actionText}
      </InlineButton>
    </div>
  );
}
