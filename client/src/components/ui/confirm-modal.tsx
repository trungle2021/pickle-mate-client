import React from 'react';
import { Button } from '@/components/ui/button';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'default' | 'destructive' | 'outline';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'Xác nhận',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmVariant = 'default',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const getConfirmButtonClass = () => {
    switch (confirmVariant) {
      case 'destructive':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'outline':
        return 'bg-transparent border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          {title && (
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {title}
            </h3>
          )}
          <p className="text-gray-700 dark:text-gray-300">{message}</p>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              onClick={onCancel}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              className={getConfirmButtonClass()}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;