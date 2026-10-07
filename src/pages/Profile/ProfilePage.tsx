import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { CalendarDays, Wallet, Lock, ShoppingCart, Package, Users, UserPlus, Settings } from "lucide-react";

import { useUserStore } from "@/shared/store/userStore";
import { ProfileIcon } from "@/shared/icons/AppIcons";
import GlassCard from "@/shared/ui/GlassCard";
import PremiumButton from "@/shared/ui/PremiumButton";
import Skeleton from "@/shared/ui/Skeleton";
import FadeIn from "@/shared/animations/FadeIn";

import styles from "./ProfilePage.module.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading, fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const skel = <Skeleton width={64} height={13} />;
  const rows = [
    {
      icon: <Wallet size={16} />,
      label: "💰 موجودی قابل استفاده",
      value: loading ? skel : `${(user?.wallet ?? 0).toLocaleString("fa-IR")} تومان`,
    },
    {
      icon: <Lock size={16} />,
      label: "🔒 موجودی در انتظار",
      value: loading ? skel : `${(user?.locked_wallet ?? 0).toLocaleString("fa-IR")} تومان`,
    },
    { icon: <Package size={16} />, label: "📦 تعداد سرویس", value: loading ? skel : user?.services_count ?? 0 },
    {
      icon: <ShoppingCart size={16} />,
      label: "🛒 کل خرید",
      value: loading ? skel : `${(user?.total_purchase ?? 0).toLocaleString("fa-IR")} تومان`,
    },
    { icon: <CalendarDays size={16} />, label: "📅 تاریخ عضویت", value: loading ? skel : user?.joined ?? "-" },
    { icon: <Users size={16} />, label: "👥 تعداد دعوت", value: loading ? skel : user?.invited_count ?? 0 },
    { icon: <UserPlus size={16} />, label: "✅ دعوت موفق", value: loading ? skel : user?.successful_invites ?? 0 },
  ];

  return (
    <div className={styles.page}>
      <FadeIn>
        <GlassCard className={styles.heroCard}>
          <div className={styles.heroInner}>
            <ProfileIcon size={72} glow />
            <span className={styles.title}>👤 پروفایل حرفه‌ای شما</span>
            <span className={styles.name}>
              📛 {loading ? <Skeleton width={110} height={14} style={{ verticalAlign: "middle" }} /> : user?.name}
            </span>
            <span className={styles.id}>🆔 آیدی: {user?.telegram_id}</span>
          </div>
        </GlassCard>
      </FadeIn>

      <FadeIn delay={0.08}>
        <GlassCard className={styles.infoCard}>
          {rows.map((row, i) => (
            <div key={row.label}>
              <div className={styles.row}>
                <span className={styles.rowLabel}>
                  {row.icon}
                  {row.label}
                </span>
                <b>{row.value}</b>
              </div>
              {i < rows.length - 1 && <div className={styles.divider} />}
            </div>
          ))}
        </GlassCard>
      </FadeIn>

      <PremiumButton
        fullWidth
        variant="ghost"
        leftIcon={<Settings size={18} />}
        onClick={() => navigate("/settings")}
      >
        تنظیمات
      </PremiumButton>
    </div>
  );
}
