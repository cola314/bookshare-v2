import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variantMap: Record<string, string> = {
  primary: "is-primary",
  secondary: "is-dark",
  outline: "is-outlined",
  ghost: "is-ghost",
  danger: "is-danger",
};

const sizeMap: Record<string, string> = {
  sm: "is-small",
  md: "",
  lg: "is-medium",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", isLoading = false, disabled, children, ...props }, ref) => {
    const bulmaVariant = variantMap[variant] || "is-primary";
    const bulmaSize = sizeMap[size] || "";
    const loadingClass = isLoading ? "is-loading" : "";

    return (
      <button
        ref={ref}
        className={`button ${bulmaVariant} ${bulmaSize} ${loadingClass} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
