"use client";
import React from "react";

interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
}

export default function TextInput({
  id,
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: TextInputProps) {
  const actualType = type === "number" ? "text" : type;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: newValue } = e.target;

    if (type === "number") {
      const numericValue = parseFloat(newValue);

      if (Number.isNaN(numericValue)) {
        onChange(newValue);
        return;
      }
      if (numericValue < 0) {
        onChange("0");
        return;
      }
    }

    onChange(newValue);
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type={actualType}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  );
}
