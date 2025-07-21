import React, { createContext, useState, useContext, ReactNode } from 'react';
import ConfirmModal from '@/components/ui/confirm-modal';

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'default' | 'destructive' | 'outline';
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: 'Xác nhận',
    message: '',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    confirmVariant: 'default'
  });
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setOptions({
        title: options.title || 'Xác nhận',
        message: options.message,
        confirmText: options.confirmText || 'Xác nhận',
        cancelText: options.cancelText || 'Hủy',
        confirmVariant: options.confirmVariant || 'default'
      });
      setResolveRef(() => resolve);
      setIsOpen(true);
    });
  };

  const handleConfirm = () => {
    if (resolveRef) {
      resolveRef(true);
      setIsOpen(false);
      setResolveRef(null);
    }
  };

  const handleCancel = () => {
    if (resolveRef) {
      resolveRef(false);
      setIsOpen(false);
      setResolveRef(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmModal
        isOpen={isOpen}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        confirmVariant={options.confirmVariant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
};