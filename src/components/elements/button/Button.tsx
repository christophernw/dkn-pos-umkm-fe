import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const Button = ({ className, ...props }: ButtonProps) => {
  return (
    <button
        className={`bg-primary-indigo text-white flex justify-center py-3 rounded-[40px] w-full ${className}
          disabled:bg-gray-200 disabled:text-[#ADB5C2] disabled:cursor-not-allowed`}
        {...props}
      >
        {props.children}
    </button>
  )
}
