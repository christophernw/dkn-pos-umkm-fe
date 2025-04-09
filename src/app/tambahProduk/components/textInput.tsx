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
}

function formatHarga(value: string): string {
  const digits = value.replace(/\D/g, ""); // Remove all non-numeric characters
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Add thousands separators
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
}: Readonly<TextInputProps>) {
  const [inputValue, setInputValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return; // Prevent changes if the field is disabled

    let newValue = e.target.value;

    if (type === "number" || currency) {
      // Remove non-numeric characters
      newValue = newValue.replace(/\D/g, "");
      const formattedValue = currency ? formatHarga(newValue) : newValue;
      setInputValue(formattedValue);
      onChange(formattedValue, newValue);
      return;
    }

    setInputValue(newValue);
    onChange(newValue, newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return; // Prevent key presses if the field is disabled

    // Prevent invalid characters (e.g., letters, special characters)
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
            type="text" // Always use text for currency to allow formatting
            inputMode="numeric"
            value={inputValue}
            placeholder={placeholder}
            onChange={handleChange}
            onKeyDown={handleKeyDown} // Prevent invalid key presses
            disabled={disabled} // Apply the disabled attribute
            className={`mt-1 block w-full rounded border-gray-300 shadow-sm pl-10 focus:border-blue-500 focus:ring-blue-500 ${
              disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
            }`}
          />
        </div>
      ) : (
        <input
          id={id}
          type={type === "number" ? "text" : type} // Use text for number to allow custom validation
          inputMode={type === "number" ? "numeric" : "text"}
          value={inputValue}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown} // Prevent invalid key presses
          disabled={disabled} // Apply the disabled attribute
          className={`mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
          }`}
        />
      )}
    </div>
  );
}