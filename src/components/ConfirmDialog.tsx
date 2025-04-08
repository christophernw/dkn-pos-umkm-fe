// components/ConfirmDialog.tsx
"use client";
import React from "react";

interface ConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg">
        <p>Apakah Anda yakin ingin menyimpan perubahan?</p>
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">Batal</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-blue-600 text-white rounded">Ya</button>
        </div>
      </div>
    </div>
  );
}
