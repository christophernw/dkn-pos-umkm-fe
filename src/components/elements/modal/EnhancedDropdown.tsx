import { useState, useEffect } from "react";
import { ChevronDown, Check, Plus } from "lucide-react";
import { Modal } from "@/src/components/elements/modal/Modal";

interface DropdownProps {
  selected: string;
  options: string[];
  label: string;
  onSelect: (val: string) => void;
  onAddCustom?: (val: string) => void;
  showLabel?: boolean;
}

export default function EnhancedDropdown({
  selected,
  options,
  label,
  onSelect,
  onAddCustom,
  showLabel = true,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");
  
  const [internalOptions, setInternalOptions] = useState<string[]>(options);

  useEffect(() => {
    const mergedOptions = [...new Set([...internalOptions, ...options])];
    setInternalOptions(mergedOptions);
  }, [options]);

  const handleAddCustom = () => {
    setOpen(false);
    setIsModalOpen(true);
  };

  const handleSubmitCustom = () => {
    if (customValue.trim() && onAddCustom) {
      // Add the new value to internal options first
      if (!internalOptions.includes(customValue.trim())) {
        setInternalOptions([...internalOptions, customValue.trim()]);
      }
      // Then call the parent handler
      onAddCustom(customValue.trim());
      setCustomValue("");
      setIsModalOpen(false);
    }
  };

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
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Use internalOptions instead of options from props */}
          {internalOptions.map((option) => (
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
          {onAddCustom && (
            <li
              onClick={handleAddCustom}
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-blue-50 text-blue-600 border-t"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Tambah {label} Baru</span>
            </li>
          )}
        </ul>
      )}

      {/* Modal for adding custom option */}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-4">Tambah {label} Baru</h3>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">
                Nama {label}
              </label>
              <input
                type="text"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Masukkan ${label.toLowerCase()} baru`}
              />
            </div>
            
            <div className="flex justify-between gap-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmitCustom}
                disabled={!customValue.trim()}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Simpan
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}