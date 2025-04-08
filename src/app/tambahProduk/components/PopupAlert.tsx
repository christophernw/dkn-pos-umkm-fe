"use client";
import { useEffect } from "react";

interface PopupAlertProps {
  message: string;
  onClose: () => void;
  type?: "success" | "error";
}

export default function PopupAlert({ message, onClose, type = "error" }: PopupAlertProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";

  return (
    <div className="fixed top-5 right-5 z-50">
      <div className={`${bgColor} text-white px-4 py-2 rounded shadow-lg flex items-center justify-between min-w-[250px]`}>
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 font-bold">×</button>
      </div>
    </div>
  );
}
