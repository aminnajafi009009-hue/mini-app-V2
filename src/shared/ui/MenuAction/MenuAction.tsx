import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import clsx from "clsx";
import styles from "./MenuAction.module.css";

type Tone = "purple" | "blue" | "green" | "gold" | "pink" | "cyan";

interface MenuActionProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  tone?: Tone;
  badge?: string;
  onClick?: () => void;
}

export default function MenuAction({
  icon,
  title,
  subtitle,
  tone = "purple",
  badge,
  onClick,
}: MenuActionProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={styles.row}
      onClick={onClick}
    >
      <div className={clsx(styles.iconBadge, styles[tone], "sphere-3d", "float")}>{icon}</div>

      <div className={styles.textBlock}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>

      {badge && <span className={styles.badge}>{badge}</span>}

      <ChevronLeft size={18} className={styles.chevron} />
    </motion.button>
  );
}
