import styles from "./Skeleton.module.css";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * یک بلوکِ خاکستریِ در حال چشمک‌زدن، برای نمایش حالت لودینگ به‌جای «...» یا
 * مقدار صفر/خالی گمراه‌کننده. عرض/ارتفاع/گردی گوشه رو می‌شه از بیرون ست کرد
 * تا دقیقاً جای متن واقعی رو بگیره.
 */
export default function Skeleton({ width = "100%", height = 16, radius = 8, className, style }: SkeletonProps) {
  return (
    <span
      className={`${styles.skeleton} ${className ?? ""}`}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}
