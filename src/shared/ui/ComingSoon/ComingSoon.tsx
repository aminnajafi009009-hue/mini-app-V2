import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import GlassCard from "@/shared/ui/GlassCard";
import PremiumButton from "@/shared/ui/PremiumButton";
import FadeIn from "@/shared/animations/FadeIn";

import styles from "./ComingSoon.module.css";

interface ComingSoonProps {
  title: string;
  icon: ReactNode;
  subtitle?: string;
}

export default function ComingSoon({ title, icon, subtitle }: ComingSoonProps) {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <FadeIn>
        <GlassCard className={styles.card}>
          <div className={styles.iconWrap}>{icon}</div>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>
            {subtitle || "این قابلیت هنوز فعال نشده. به محض فعال شدن اطلاع‌رسانی می‌شود."}
          </p>
          <PremiumButton
            variant="ghost"
            fullWidth
            leftIcon={<ArrowRight size={18} />}
            onClick={() => navigate("/")}
          >
            بازگشت به خانه
          </PremiumButton>
        </GlassCard>
      </FadeIn>
    </div>
  );
}
