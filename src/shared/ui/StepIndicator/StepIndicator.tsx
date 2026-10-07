import clsx from "clsx"
import styles from "./StepIndicator.module.css"

type Props = {
  step: number
  total: number
  label?: string
}

export function StepIndicator({ step, total, label }: Props) {
  const clamped = Math.max(1, Math.min(step, total))
  const percent = (clamped / total) * 100

  return (
    <div className={styles.wrap}>
      <div className={styles.label}>
        {label ? `${label} — ` : ""}مرحله {clamped} از {total}
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
      <div className={styles.dots}>
        {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
          <span
            key={n}
            className={clsx(styles.dot, n < clamped && styles.dotDone, n === clamped && styles.dotActive)}
          />
        ))}
      </div>
    </div>
  )
}
