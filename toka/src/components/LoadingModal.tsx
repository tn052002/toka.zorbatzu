'use client';

type LoadingModalProps = {
  open: boolean;
  text?: string;
};

export default function LoadingModal({ open, text = 'Reflecting...' }: LoadingModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-6">
      <div className="w-full max-w-xs rounded-3xl bg-white px-6 py-5 text-center shadow-xl">
        <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
        <p className="text-sm text-slate-700">{text}</p>
      </div>
    </div>
  );
}
