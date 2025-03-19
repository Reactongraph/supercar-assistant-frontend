import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "icon";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md transition-colors duration-200 font-semibold";

  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600 shadow-sm",
    secondary:
      "bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
    icon: "bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
  };

  const sizes = {
    primary: "px-3 py-2 text-sm",
    secondary: "px-3 py-2 text-sm",
    icon: "p-1",
  };

  const width = fullWidth ? "w-full" : "w-auto";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[variant]} ${width} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
