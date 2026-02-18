import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '../lib/utils';
import { X } from 'lucide-react';
import type { PropsWithChildren } from 'react';

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('rounded-xl border border-slate-200 bg-white p-4 shadow-sm', className)}>{children}</div>;
}

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn('rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-50', className)}
      {...props}
    />
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('w-full rounded-md border border-slate-300 px-3 py-2 text-sm', props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn('w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white', props.className)} />;
}

export function Modal({ open, onOpenChange, title, children }: PropsWithChildren<{ open: boolean; onOpenChange: (v: boolean) => void; title: string }>) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button>
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
