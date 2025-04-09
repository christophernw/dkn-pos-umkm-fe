/* eslint-disable react-hooks/rules-of-hooks */
import { useModal } from '@/contexts/ModalContext';

// Type definitions
type ModalType = 'success' | 'error' | 'info';
type ModalAction = { label: string; onClick: () => void } | null;

// Modal utility object with standalone functions
const modal = () => {
  const modalContext = useModal();
  
  return {
    show: (
      title: string,
      message: string,
      type: ModalType = 'info',
      primaryAction: ModalAction = null,
      secondaryAction: ModalAction = null
    ) => {
      modalContext.showModal(title, message, type, primaryAction, secondaryAction);
    },
    
    success: (
      title: string,
      message: string,
      primaryAction: ModalAction = null
    ) => {
      modalContext.showModal(title, message, 'success', primaryAction);
    },
    
    error: (
      title: string,
      message: string,
      primaryAction: ModalAction = null
    ) => {
      modalContext.showModal(title, message, 'error', primaryAction);
    },
    
    info: (
      title: string,
      message: string,
      primaryAction: ModalAction = null
    ) => {
      modalContext.showModal(title, message, 'info', primaryAction);
    },
    
    hide: () => {
      modalContext.hideModal();
    }
  };
};

export default modal;