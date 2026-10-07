import { useNavigate } from "react-router-dom";
import { Moon, Globe, Info, LogOut, Headphones } from "lucide-react";
import WebApp from "@twa-dev/sdk";

import GlassCard from "@/shared/ui/GlassCard";
import PremiumButton from "@/shared/ui/PremiumButton";
import { GearIcon } from "@/shared/icons/AppIcons";
import FadeIn from "@/shared/animations/FadeIn";

import styles from "./SettingsPage.module.css";

export default function SettingsPage() {
  const navigate = useNavigate();

  function closeApp() {
    try {
      WebApp.close();
    } catch {
      navigate("/");
    }
  }

  return (
    <div className={styles.page}>
      <FadeIn>
        <div className={styles.hero}>
          <GearIcon size={64} />
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <GlassCard className={styles.card}>
          <div className={styles.row}>
            <span className={styles.rowLabel}>
              <Moon size={18} /> حالت نمایش
            </span>
            <span className={styles.staticValue}>تاریک</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.row}>
            <span className={styles.rowLabel}>
              <Globe size={18} /> زبان
            </span>
            <span className={styles.staticValue}>فارسی</span>
          </div>
        </GlassCard>
      </FadeIn>

      <FadeIn delay={0.1}>
        <button className={styles.linkRow} onClick={() => navigate("/support")}>
          <Headphones size={18} /> ارتباط با پشتیبانی
        </button>
      </FadeIn>

      <FadeIn delay={0.13}>
        <GlassCard className={styles.aboutCard}>
          <div className={styles.row}>
            <span className={styles.rowLabel}>
              <Info size={18} /> درباره
            </span>
          </div>
          <p className={styles.aboutText}>
            Business VPN — ارائه‌دهنده‌ی سرویس‌های VIP و گیمینگ.
          </p>
        </GlassCard>
      </FadeIn>

      <PremiumButton
        fullWidth
        variant="ghost"
        leftIcon={<LogOut size={18} />}
        onClick={closeApp}
      >
        خروج از برنامه
      </PremiumButton>
    </div>
  );
}
