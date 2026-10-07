import {
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  useState,
} from "react";

import clsx from "clsx";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

import styles from "./PremiumInput.module.css";

interface PremiumInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const PremiumInput = forwardRef<
  HTMLInputElement,
  PremiumInputProps
>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      type = "text",
      className,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] =
      useState(false);

    const inputType =
      type === "password"
        ? showPassword
          ? "text"
          : "password"
        : type;

    return (
      <div className={styles.wrapper}>
        {label && (
          <label className={styles.label}>
            {label}
          </label>
        )}

        <div
          className={clsx(
            styles.container,
            error && styles.errorState
          )}
        >
          {leftIcon && (
            <span className={styles.leftIcon}>
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            type={inputType}
            className={clsx(
              styles.input,
              className
            )}
            {...props}
          />

          {type === "password" ? (
            <button
              type="button"
              className={styles.toggle}
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          ) : (
            rightIcon && (
              <span className={styles.rightIcon}>
                {rightIcon}
              </span>
            )
          )}
        </div>

        {error && (
          <div className={styles.error}>
            <AlertCircle size={15} />

            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

PremiumInput.displayName = "PremiumInput";

export default PremiumInput;
