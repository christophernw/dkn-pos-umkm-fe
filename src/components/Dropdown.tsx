import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

interface DropdownProps {
  selected: string;
  options: string[];
  label: string;
  onSelect: (val: string) => void;
  showLabel?: boolean; // New prop to control label visibility
}

export default function Dropdown({
  selected,
  options,
  label,
  onSelect,
  showLabel = true, // Default to showing the label
}: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full">
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full rounded-md border border-gray-300 px-4 py-2 bg-white hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <span className={selected ? "text-black" : "text-gray-400"}>
          {selected || `${label}`}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>
      {open && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
          {options.map((option) => (
            <li
              key={option}
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
              className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                selected === option ? "bg-gray-100 font-semibold" : ""
              }`}
            >
              {option}
              {selected === option && <Check className="w-4 h-4" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}