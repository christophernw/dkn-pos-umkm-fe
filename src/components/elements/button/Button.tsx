import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: "primary" | "secondary" | "tertiary";
}

export const Button: React.FC<ButtonProps> = ({
  className = "",
  variant = "primary",
  ...props
}) => {
  const baseStyles =
    "flex justify-center rounded-[40px] disabled:bg-gray-200 disabled:text-[#ADB5C2] disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "bg-primary-indigo text-white py-3 w-full",
    secondary: "bg-[#F1F6FD] text-primary-indigo border border-primary-indigo w-fit px-2 py-2",
    tertiary: " text-[#818898] py-3 border border-[#818898] w-full",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {props.children}
    </button>
  );
};
