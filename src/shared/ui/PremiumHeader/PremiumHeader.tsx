import { ReactNode } from "react";
import { Bot } from "lucide-react";
import GlassCard from "../GlassCard";
import styles from "./PremiumHeader.module.css";

interface PremiumHeaderProps {
  title: string;
  subtitle?: string;
  avatar?: string;
  rightAction?: ReactNode;
}

export default function PremiumHeader({
  title,
  subtitle,
  avatar,
  rightAction,
}: PremiumHeaderProps) {
  return (
    <GlassCard className={styles.header}>
      <div className={styles.left}>
        <div className={styles.orbitWrap}>
          {avatar ? (
            <img src={avatar} alt={title} className={styles.avatar} />
          ) : (
            <div className={`${styles.avatarFallback} sphere-3d float`}>
              <Bot size={26} />
            </div>
          )}
        </div>

        <div>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>

      {rightAction && <div className={styles.right}>{rightAction}</div>}
    </GlassCard>
  );
}
