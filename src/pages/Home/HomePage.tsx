import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Wallet as WalletIcon,
  Gift,
  Search,
  Users,
  Headphones,
  UserRound,
} from "lucide-react";

import { useUserStore } from "@/shared/store/userStore";
import GlassCard from "@/shared/ui/GlassCard";
import PremiumHeader from "@/shared/ui/PremiumHeader";
import MenuAction from "@/shared/ui/MenuAction";
import Skeleton from "@/shared/ui/Skeleton";
import FadeIn from "@/shared/animations/FadeIn";

import styles from "./HomePage.module.css";

type Tone = "purple" | "blue" | "green" | "gold" | "pink" | "cyan";

function QuickTile({
  icon,
  tone,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  tone: Tone;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <GlassCard glow className={styles.tile} onClick={onClick}>
      <div className={`${styles.tileIcon} ${styles[tone]} sphere-3d float`}>{icon}</div>
      <div className={styles.tileText}>
        <span className={styles.tileTitle}>{title}</span>
        <span className={styles.tileSubtitle}>{subtitle}</span>
      </div>
    </GlassCard>
  );
}

// ترتیب و متن این منو دقیقاً همون چیزیه که در main_menu ربات
// (keyboards.py) و منوی پایین صفحه‌ی ربات (main_reply_keyboard) هست.
export default function HomePage() {
  const navigate = useNavigate();
  const { user, loading, error, fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const balance = user?.wallet ?? 0;

  return (
    <div className={styles.page}>
      <FadeIn>
        <PremiumHeader
          title={`👋 سلام ${user?.name ? user.name : ""}`}
          subtitle="خوش اومدی به پنل کاربری بیزنس"
        />
      </FadeIn>

      {user && !user.orders_enabled && (
        <FadeIn delay={0.05}>
          <GlassCard className={styles.noticeCard}>
            <div className={styles.noticeInner}>
              <span className={styles.noticeDot} />
              ربات به دلیل حجم سفارشات بالا موقتاً بسته می‌باشد. روشن شدن دوباره‌ی
              آن اطلاع‌رسانی خواهد شد.
            </div>
          </GlassCard>
        </FadeIn>
      )}

      <FadeIn delay={0.1}>
        <GlassCard glow className={`${styles.balanceCard} pulse-glow-gold`} onClick={() => navigate("/wallet")}>
          <div className={styles.balanceInner}>
            <div className={`${styles.balanceIcon} sphere-3d float`}>
              <WalletIcon size={26} />
            </div>
            <div className={styles.balanceText}>
              <span className={styles.balanceLabel}>موجودی قابل استفاده</span>
              <span className={styles.balanceValue}>
                {loading ? (
                  <Skeleton width={90} height={18} style={{ verticalAlign: "middle" }} />
                ) : (
                  `${balance.toLocaleString("fa-IR")} تومان`
                )}
              </span>
            </div>
          </div>
        </GlassCard>
      </FadeIn>

      {error && (
        <FadeIn delay={0.12}>
          <GlassCard className={styles.errorCard}>{error}</GlassCard>
        </FadeIn>
      )}

      <div className={styles.sectionLabel}>دسترسی سریع</div>

      <FadeIn delay={0.14}>
        <GlassCard glow className={`${styles.heroAction} glass-premium`} onClick={() => navigate("/subscription")}>
          <div className={`${styles.heroIcon} sphere-3d float`}>
            <ShoppingCart size={24} />
          </div>
          <div className={styles.heroText}>
            <span className={styles.heroTitle}>🛒 خرید اشتراک</span>
            <span className={styles.heroSubtitle}>اشتراک مورد نظر خود را انتخاب کنید</span>
          </div>
          <span className={styles.heroArrow}>‹</span>
        </GlassCard>
      </FadeIn>

      <div className={styles.tileGrid}>
        <FadeIn delay={0.18}>
          <QuickTile
            icon={<Search size={22} />}
            tone="blue"
            title="سرویس‌های من"
            subtitle="مدیریت سرویس‌ها"
            onClick={() => navigate("/services")}
          />
        </FadeIn>
        <FadeIn delay={0.21}>
          <QuickTile
            icon={<WalletIcon size={22} />}
            tone="gold"
            title="کیف پول"
            subtitle="شارژ و تراکنش‌ها"
            onClick={() => navigate("/wallet")}
          />
        </FadeIn>
        <FadeIn delay={0.24}>
          <QuickTile
            icon={<Users size={22} />}
            tone="green"
            title="دعوت دوستان"
            subtitle="کسب درآمد"
            onClick={() => navigate("/referral")}
          />
        </FadeIn>
        <FadeIn delay={0.27}>
          <QuickTile
            icon={<UserRound size={22} />}
            tone="pink"
            title="پروفایل من"
            subtitle="اطلاعات حساب"
            onClick={() => navigate("/profile")}
          />
        </FadeIn>
      </div>

      <div className={styles.sectionLabel}>بیشتر</div>

      <div className={styles.menuList}>
        <FadeIn delay={0.3}>
          <MenuAction
            icon={<Headphones />}
            tone="purple"
            title="👨‍💻 پشتیبانی"
            subtitle="ارتباط با تیم پشتیبانی"
            onClick={() => navigate("/support")}
          />
        </FadeIn>

        <FadeIn delay={0.33}>
          <MenuAction
            icon={<Gift />}
            tone="pink"
            title="🎁 تست رایگان"
            subtitle="دریافت سرویس تست رایگان"
            onClick={() => navigate("/free-trial")}
          />
        </FadeIn>
      </div>
    </div>
  );
}
