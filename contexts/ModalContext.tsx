/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React, { createContext, useState, useContext, ReactNode } from 'react';
import AlertModal from '@/src/components/AlertModal';

type ModalType = 'success' | 'error' | 'info';

interface ModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  type: ModalType;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export interface ModalContextType {
  showModal: (
    title: string,
    message: string,
    type?: ModalType,
    primaryAction?: { label: string; onClick: () => void } | null,
    secondaryAction?: { label: string; onClick: () => void } | null
  ) => void;
  hideModal: () => void;
}

const initialModalState: ModalConfig = {
  isOpen: false,
  title: '',
  message: '',
  type: 'info',
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalConfig, setModalConfig] = useState<ModalConfig>(initialModalState);

  const showModal = (
    title: string,
    message: string,
    type: ModalType = 'info',
    primaryAction: { label: string; onClick: () => void } | null = null,
    secondaryAction: { label: string; onClick: () => void } | null = null
  ) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      primaryAction: primaryAction || undefined,
      secondaryAction: secondaryAction || undefined,
    });
  };

  const hideModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <AlertModal
        isOpen={modalConfig.isOpen}
        onClose={hideModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        primaryAction={modalConfig.primaryAction}
        secondaryAction={modalConfig.secondaryAction}
      />
    </ModalContext.Provider>
  );
};

// Custom hook for using the modal context
export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

// Helper functions to make usage even simpler
export const alertModal = {
  success: (
    title: string,
    message: string,
    primaryAction?: { label: string; onClick: () => void }
  ) => {
    const modal = useModal();
    modal.showModal(title, message, 'success', primaryAction);
  },
  
  error: (
    title: string,
    message: string,
    primaryAction?: { label: string; onClick: () => void }
  ) => {
    const modal = useModal();
    modal.showModal(title, message, 'error', primaryAction);
  },
  
  info: (
    title: string,
    message: string,
    primaryAction?: { label: string; onClick: () => void }
  ) => {
    const modal = useModal();
    modal.showModal(title, message, 'info', primaryAction);
  }
};