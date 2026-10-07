import { HTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./GlassCard.module.css";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  glow?: boolean;
}

export default function GlassCard({
  children,
  hover = true,
  glow = false,
  className,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={clsx(
        styles.card,
        hover && styles.hover,
        glow && styles.glow,
        className
      )}
      {...props}
    >
      <div className={styles.border} />

      <div className={styles.highlight} />

      <div className={styles.noise} />

      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
