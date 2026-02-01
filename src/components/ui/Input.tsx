import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="field">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
            {props.required && <span className="has-text-danger ml-1">*</span>}
          </label>
        )}
        <div className="control">
          <input
            ref={ref}
            id={inputId}
            className={`input ${error ? "is-danger" : ""} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="help is-danger">{error}</p>}
        {helperText && !error && <p className="help">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
