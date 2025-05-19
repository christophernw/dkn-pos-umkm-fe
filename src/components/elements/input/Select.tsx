import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode;
  options?: { label: string; value: string }[];
}

export const Select: React.FC<SelectProps> = ({
  icon,
  options,
  children,
  className = "",
  ...props
}) => {
  return (
    <div className="relative mb-6">
      <select
        className={`w-full bg-white active:outline-none active:ring-0 focus:outline-none focus:ring-0 rounded-3xl py-4 px-4 text-sm text-[#818898] appearance-none flex items-center justify-center ${className}`}
        style={{
          paddingLeft: icon ? "56px" : undefined,
        }}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>

      {icon && (
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none bg-[#F1F6FD] p-3 flex items-center justify-center rounded-full">
          {icon}
        </div>
      )}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 text-gray-500"
            >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
        </div>
    </div>
  );
};
