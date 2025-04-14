// textInput.tsx
"use client";
import React from "react";

interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  currency?: boolean;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
}

function formatHarga(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function TextInput({
  id,
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  currency = false,
  disabled = false,
  error = false,
  errorMessage = "This field should not be empty",
}: Readonly<TextInputProps>) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    let newValue = e.target.value;

    if (type === "number" || currency) {
      newValue = newValue.replace(/\D/g, "");
      const formattedValue = currency ? formatHarga(newValue) : newValue;
      onChange(formattedValue);
      return;
    }

    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (type === "number" || currency) {
      const invalidKeys = ["e", "E", "+", "-", "."];
      if (invalidKeys.includes(e.key)) {
        e.preventDefault();
      }
    }
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {currency ? (
        <div className="relative mt-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            Rp
          </span>
          <input
            id={id}
            type="text"
            inputMode="numeric"
            value={value}
            placeholder={placeholder}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={`mt-1 block w-full rounded pl-10 shadow-sm focus:ring-blue-500 ${
              disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed " : ""
            } ${
              error
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
          />
        </div>
      ) : (
        <input
          id={id}
          type={type === "number" ? "text" : type}
          inputMode={type === "number" ? "numeric" : "text"}
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`mt-1 block w-full rounded shadow-sm focus:ring-blue-500 ${
            disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed " : ""
          } ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-gray-300 focus:border-blue-500"
          }`}
        />
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}