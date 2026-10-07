import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Share2 } from "lucide-react";
import WebApp from "@twa-dev/sdk";

import { getReferral } from "@/shared/api/services";
import type { ReferralStats } from "@/shared/api/types";
import { hapticImpact } from "@/shared/haptics";

import { GiftIcon, UsersIcon } from "@/shared/icons/AppIcons";
import GlassCard from "@/shared/ui/GlassCard";
import PremiumButton from "@/shared/ui/PremiumButton";
import FadeIn from "@/shared/animations/FadeIn";

import styles from "./ReferralPage.module.css";

export default function ReferralPage() {
  const [data, setData] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReferral()
      .then(setData)
      .catch(() => toast.error("خطا در دریافت اطلاعات دعوت"))
      .finally(() => setLoading(false));
  }, []);

  async function copyLink() {
    if (!data) return;
    hapticImpact("light");
    try {
      await navigator.clipboard.writeText(data.invite_link);
      toast.success("لینک دعوت کپی شد");
    } catch {
      toast.error("امکان کپی خودکار نبود");
    }
  }

  function shareLink() {
    if (!data) return;
    hapticImpact("medium");
    const url = data.invite_link;
    const text = "با این لینک عضو شو و تست رایگان بگیر 🎁";
    try {
      if (WebApp.openTelegramLink) {
        WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
      } else if (navigator.share) {
        navigator.share({ url, text });
      } else {
        copyLink();
      }
    } catch {
      copyLink();
    }
  }

  if (loading || !data) {
    return <p className={styles.loading}>در حال بارگذاری...</p>;
  }

  return (
    <div className={styles.page}>
      <FadeIn>
        <GlassCard glow className={styles.heroCard}>
          <div className={styles.heroInner}>
            <GiftIcon size={64} />
            <h2 className={styles.heroTitle}>👥 دعوت دوستان و کسب درآمد 💸</h2>
            <p>
              دوستاتو دعوت کن و به‌ازای هر دعوت موفق،{" "}
              <b>{data.reward_amount.toLocaleString("fa-IR")} تومان</b> پاداش
              نقدی بگیر! 🎁
            </p>
            <p className={styles.heroSubNote}>
              (به شرط خرید حجم {data.min_purchase_gb.toLocaleString("fa-IR")}{" "}
              گیگ یا بیشتر توسط دوستتون)
            </p>
          </div>
        </GlassCard>
      </FadeIn>

      <FadeIn delay={0.06}>
        <GlassCard className={styles.codeCard}>
          <div className={styles.codeInner}>
            <span className={styles.codeLabel}>🔑 کد اختصاصی شما</span>
            <div className={styles.codeRow}>
              <code className={styles.code}>{data.invite_code}</code>
              <button className={styles.copyBtn} onClick={copyLink}>
                <Copy size={16} />
              </button>
            </div>
          </div>
        </GlassCard>
      </FadeIn>

      <PremiumButton fullWidth leftIcon={<Share2 size={18} />} onClick={shareLink}>
        🔗 اشتراک‌گذاری لینک دعوت
      </PremiumButton>

      <div className={styles.statsRow}>
        <FadeIn delay={0.1}>
          <GlassCard className={styles.statCard}>
            <div className={styles.statInner}>
              <UsersIcon size={40} />
              <span className={styles.statValue}>{data.invited_count}</span>
              <span className={styles.statLabel}>👤 تعداد دعوت</span>
            </div>
          </GlassCard>
        </FadeIn>

        <FadeIn delay={0.13}>
          <GlassCard className={styles.statCard}>
            <div className={styles.statInner}>
              <UsersIcon size={40} />
              <span className={styles.statValue}>{data.successful_invites}</span>
              <span className={styles.statLabel}>✅ دعوت‌های موفق</span>
            </div>
          </GlassCard>
        </FadeIn>
      </div>

      <FadeIn delay={0.16}>
        <GlassCard className={styles.earningsCard}>
          <div className={styles.earningsRow}>
            <span>🔓 مبلغ آزاد شده</span>
            <b className={styles.positive}>
              {data.released_amount.toLocaleString("fa-IR")} تومان
            </b>
          </div>
          {data.locked_wallet > 0 && (
            <div className={styles.earningsRow}>
              <span>🔒 مبلغ در انتظار</span>
              <b>{data.locked_wallet.toLocaleString("fa-IR")} تومان</b>
            </div>
          )}
        </GlassCard>
      </FadeIn>

      <FadeIn delay={0.2}>
        <p className={styles.footNote}>
          ℹ️ به‌ازای هر دوستی که با لینک شما عضو شود و یک خرید حجم{" "}
          {data.min_purchase_gb.toLocaleString("fa-IR")} گیگ یا بیشتر انجام
          دهد، {data.reward_amount.toLocaleString("fa-IR")} تومان به‌صورت
          خودکار به کیف پول شما آزاد می‌شود. (تست رایگان و خریدهای کمتر از{" "}
          {data.min_purchase_gb.toLocaleString("fa-IR")} گیگ پاداش را آزاد
          نمی‌کنند)
        </p>
      </FadeIn>
    </div>
  );
}
