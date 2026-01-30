import { useEffect } from 'react';
import { AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'danger',
}: ConfirmDialogProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const Icon = variant === 'danger' ? AlertTriangle : AlertCircle;

  return (
    <div className="modal-backdrop animate-fade-in">
      {/* Dialog */}
      <div className="modal max-w-md animate-scale-in relative z-10">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={clsx(
              'p-3',
              variant === 'danger' ? 'bg-danger-100' : 'bg-warning-100'
            )}>
              <Icon className={clsx(
                'w-6 h-6',
                variant === 'danger' ? 'text-danger-600' : 'text-warning-600'
              )} />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-lg font-display font-semibold text-primary-900">{title}</h3>
              <p className="mt-2 text-sm text-primary-600 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn-secondary"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={clsx(
              variant === 'danger' ? 'btn-danger' : 'btn-primary',
              'min-w-[100px]'
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
