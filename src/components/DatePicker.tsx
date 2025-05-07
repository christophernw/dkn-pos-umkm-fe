// components/DatePicker.tsx
"use client"

import { FC } from "react"

interface DatePickerProps {
  label: string
  value: string
  onChange: (value: string) => void
}

const DatePicker: FC<DatePickerProps> = ({ label, value, onChange }) => {
  return (
    <div className="w-full relative">
      <p className="text-sm mb-1">{label}</p>
      <div className="relative">
        <div className="flex items-center border border-gray-300 rounded-md px-3 bg-white h-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full outline-none"
          />
        </div>
      </div>
    </div>
  )
}

export default DatePicker