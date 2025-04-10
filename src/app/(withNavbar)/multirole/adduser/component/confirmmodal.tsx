import React from "react";

interface ConfirmModalProps {
  name: string;
  role: string;
  email: string;
  onClose: () => void;
  onConfirm: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  name,
  role,
  email,
  onClose,
  onConfirm,
}) => {
  return (
    <div className="w-full max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm(e);
        }}
      >
        <div role="dialog">
          <h2 className="text-base font-semibold text-center mb-4">
            Ringkasan Pengguna Baru
          </h2>

          <div className="space-y-3 w-full text-left text-sm">
            <div>
              <p className="text-gray-500">Nama</p>
              <p className="font-semibold break-words">{name}</p>
            </div>
            <div>
              <p className="text-gray-500">Role</p>
              <p className="font-semibold">{role}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-semibold break-words">{email}</p>
            </div>
          </div>

          <div className="flex justify-between gap-4 w-full mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl bg-gray-300 hover:bg-gray-400"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              Ya, kirim
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};