"use client";
import React, { useState } from "react";

interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (formatted: string, raw: string) => void;
  placeholder?: string;
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  currency?: boolean;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  readOnly?: boolean;
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
  readOnly = false,
  disabled = false,
  required = false,
}: TextInputProps) {
  const [inputValue, setInputValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    if (type === "number" && currency) {
      newValue = newValue.replace(/\D/g, "");
      const formattedValue = formatHarga(newValue);
      setInputValue(formattedValue);
      onChange(formattedValue, newValue);
      return;
    }

    setInputValue(newValue);
    onChange(newValue, newValue);
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
            value={inputValue}
            placeholder={placeholder}
            onChange={handleChange}
            readOnly={readOnly}
            disabled={disabled}
            required={required}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm pl-10 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      ) : (
      <input
        id={id}
        type={type === "number" ? "text" : type}
        inputMode={type === "number" ? "numeric" : "text"}
        value={inputValue}
        placeholder={placeholder}
        onChange={handleChange}
        readOnly={readOnly}
        disabled={disabled}
        required={required}
        className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
      )}
    </div>
  );
}
