import { CSSProperties, ReactNode } from "react";
import clsx from "clsx";
import styles from "./IconBase.module.css";

interface IconBaseProps {
  children: ReactNode;
  size?: number;
  active?: boolean;
  glow?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

export default function IconBase({
  children,
  size = 58,
  active = false,
  glow = true,
  className,
  style,
  onClick,
}: IconBaseProps) {
  return (
    <div
      className={clsx(
        styles.icon,
        active && styles.active,
        glow && styles.glow,
        className
      )}
      style={{
        width: size,
        height: size,
        ...style,
      }}
      onClick={onClick}
    >
      <span className={styles.highlight} />

      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
