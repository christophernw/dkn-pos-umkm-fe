"use client"

import { CloseIcon } from '@/public/icons/CloseIcon';
import React, { useState } from 'react'
import { twMerge } from 'tailwind-merge'


interface Props {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

export const Modal = ({children, className, onClose} : Props) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="flex justify-center">
        <div className={`fixed mx-auto w-full sm:w-[420px] h-screen z-[100] bg-black/40 top-0 flex justify-center items-center ${!isOpen && 'hidden'}`}>
            <div onClick={e => e.stopPropagation()} className={twMerge("absolute bg-white rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.1)] w-4/5 max-w-[320px] h-[245px]px-8 flex flex-col py-5 px-5 pb-7", className)}>
                <button onClick={handleClose} className="self-end">
                <CloseIcon />
                </button>
                <div className="flex flex-col text-center items-center gap-4 px-3">
                    {children}
                </div>
            </div>
        </div>
    </div>
  )
}