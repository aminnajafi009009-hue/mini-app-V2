import { ReactNode } from "react";
import clsx from "clsx";
import { motion, HTMLMotionProps } from "framer-motion";
import styles from "./PremiumButton.module.css";

type Variant =
  | "primary"
  | "secondary"
  | "glass"
  | "danger"
  | "ghost";

type Size =
  | "sm"
  | "md"
  | "lg";

interface PremiumButtonProps
  extends HTMLMotionProps<"button"> {
  children: ReactNode;

  leftIcon?: ReactNode;
  rightIcon?: ReactNode;

  loading?: boolean;

  fullWidth?: boolean;

  variant?: Variant;

  size?: Size;
}

export default function PremiumButton({
  children,

  leftIcon,

  rightIcon,

  loading = false,

  disabled,

  fullWidth = false,

  variant = "primary",

  size = "md",

  className,

  ...props
}: PremiumButtonProps) {
  return (
    <motion.button
      whileTap={{
        scale: .97
      }}

      whileHover={{
        y: -2
      }}

      transition={{
        type: "spring",
        stiffness: 450,
        damping: 20,
      }}

      disabled={disabled || loading}

      className={clsx(

        styles.button,

        styles[variant],

        styles[size],

        fullWidth && styles.full,

        loading && styles.loading,

        className

      )}

      {...props}
    >
      <span className={styles.shine} />

      <span className={styles.glow} />

      <span className={styles.content}>
        {loading ? (
          <>
            <span className={styles.spinner} />

            <span>در حال بارگذاری...</span>
          </>
        ) : (
          <>
            {leftIcon && (
              <span className={styles.icon}>
                {leftIcon}
              </span>
            )}

            <span className={styles.text}>
              {children}
            </span>

            {rightIcon && (
              <span className={styles.icon}>
                {rightIcon}
              </span>
            )}
          </>
        )}
      </span>
    </motion.button>
  );
}
