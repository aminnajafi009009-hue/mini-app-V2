import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import {
  TrendingUp, Users, DollarSign, Copy, CheckCircle,
  ShoppingCart, Star, Gift, BarChart3, Zap
} from "lucide-react";
import { apiGet } from "@/shared/api/client";
import GlassCard from "@/shared/ui/GlassCard";
import FadeIn from "@/shared/animations/FadeIn";
import styles from "./ResellerPage.module.css";

interface ResellerStats {
  balance: number;
  locked_balance: number;
  total_earned: number;
  customers_count: number;
  orders_count: number;
  orders_today: number;
  commission_percent: number;
  referral_link: string;
  recent_sales: Array<{
    plan: string;
    amount: number;
    commission: number;
    date: string;
  }>;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};

export default function ResellerPage() {
  const [stats, setStats] = useState<ResellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiGet("/reseller/stats")
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copyLink = () => {
    if (!stats?.referral_link) return;
    navigator.clipboard.writeText(stats.referral_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.page}>
      {/* Liquid BG */}
      <div className={`${styles.blob1} liquid-blob`} />
      <div className={`${styles.blob2} liquid-blob`} />

      {/* Header */}
      <FadeIn>
        <div className={styles.header}>
          <div>
            <div className={styles.resellerBadge}>
              <Star size={13} fill="currentColor" /> نماینده
            </div>
            <h1 className="gradient-text-gold">پنل نمایندگی</h1>
            <p className={styles.subtitle}>کمیسیون: <strong>{stats?.commission_percent ?? 0}٪</strong></p>
          </div>
          <motion.div
            className={`${styles.earnIcon} pulse-glow-gold`}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <DollarSign size={24} />
          </motion.div>
        </div>
      </FadeIn>

      {/* Balance Card */}
      <FadeIn delay={0.1}>
        <GlassCard className={`${styles.balanceCard} glass-premium shimmer-auto`}>
          <div className={styles.balanceTop}>
            <div className={styles.balanceMain}>
              <span className={styles.balLabel}>موجودی قابل برداشت</span>
              <span className={`${styles.balValue} gradient-text-gold`}>
                {loading ? "..." : (stats?.balance ?? 0).toLocaleString("fa-IR")} تومان
              </span>
            </div>
            <motion.div
              className={`${styles.balCoin} sphere-3d float-slow`}
              whileHover={{ scale: 1.15 }}
            >
              💰
            </motion.div>
          </div>
          <div className={styles.balanceRow}>
            <div className={styles.balMini}>
              <span>در انتظار</span>
              <strong>{(stats?.locked_balance ?? 0).toLocaleString("fa-IR")} ت</strong>
            </div>
            <div className={styles.balMini}>
              <span>کل درآمد</span>
              <strong>{(stats?.total_earned ?? 0).toLocaleString("fa-IR")} ت</strong>
            </div>
          </div>
        </GlassCard>
      </FadeIn>

      {/* Stats Row */}
      <motion.div
        className={styles.statsRow}
        variants={container} initial="hidden" animate="show"
      >
        <motion.div variants={item}>
          <GlassCard className={`${styles.miniStat} liquid-card`}>
            <Users size={20} style={{ color: "#00D9FF" }} />
            <span className={styles.miniVal}>{stats?.customers_count ?? 0}</span>
            <span className={styles.miniLabel}>مشتری</span>
          </GlassCard>
        </motion.div>
        <motion.div variants={item}>
          <GlassCard className={`${styles.miniStat} liquid-card`}>
            <ShoppingCart size={20} style={{ color: "#39FFB0" }} />
            <span className={styles.miniVal}>{stats?.orders_count ?? 0}</span>
            <span className={styles.miniLabel}>سفارش</span>
          </GlassCard>
        </motion.div>
        <motion.div variants={item}>
          <GlassCard className={`${styles.miniStat} liquid-card`}>
            <Zap size={20} style={{ color: "#FFC94A" }} />
            <span className={styles.miniVal}>{stats?.orders_today ?? 0}</span>
            <span className={styles.miniLabel}>امروز</span>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Referral Link */}
      <FadeIn delay={0.25}>
        <div className={styles.sectionTitle}>🔗 لینک اختصاصی شما</div>
        <GlassCard className={styles.linkCard}>
          <div className={styles.linkRow}>
            <span className={styles.linkText}>
              {stats?.referral_link || "در حال بارگذاری..."}
            </span>
            <motion.button
              className={`${styles.copyBtn} liquid-button`}
              whileTap={{ scale: 0.9 }}
              onClick={copyLink}
            >
              {copied
                ? <><CheckCircle size={16} /> کپی شد!</>
                : <><Copy size={16} /> کپی</>}
            </motion.button>
          </div>
          <p className={styles.linkNote}>
            ✨ هر خریدی که از این لینک انجام شود، کمیسیون به والت شما اضافه می‌شود
          </p>
        </GlassCard>
      </FadeIn>

      {/* Recent Sales */}
      <FadeIn delay={0.3}>
        <div className={styles.sectionTitle}>📈 فروش‌های اخیر</div>
        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={`${styles.loadBlob} liquid-blob`} />
          </div>
        ) : !stats?.recent_sales?.length ? (
          <GlassCard className={styles.emptyCard}>
            <Gift size={32} style={{ opacity: 0.35, marginBottom: 8 }} />
            <p>هنوز فروشی ثبت نشده</p>
            <small>لینک خود را به اشتراک بگذارید</small>
          </GlassCard>
        ) : (
          <motion.div
            variants={container} initial="hidden" animate="show"
            className={styles.salesList}
          >
            {stats.recent_sales.map((sale, i) => (
              <motion.div key={i} variants={item}>
                <GlassCard className={`${styles.saleCard} liquid-card`}>
                  <div className={styles.saleLeft}>
                    <span className={styles.salePlan}>{sale.plan}</span>
                    <span className={styles.saleDate}>{sale.date}</span>
                  </div>
                  <div className={styles.saleRight}>
                    <span className={styles.saleAmount}>{sale.amount.toLocaleString("fa-IR")} ت</span>
                    <span className={styles.saleCommission}>
                      +{sale.commission.toLocaleString("fa-IR")} ت
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </FadeIn>

      {/* How it works */}
      <FadeIn delay={0.4}>
        <GlassCard className={styles.howCard}>
          <div className={styles.howTitle}>
            <BarChart3 size={16} /> نحوه کار نمایندگی
          </div>
          <div className={styles.howSteps}>
            <div className={styles.howStep}>
              <div className={styles.howNum}>۱</div>
              <span>لینک اختصاصی خود را کپی کنید</span>
            </div>
            <div className={styles.howStep}>
              <div className={styles.howNum}>۲</div>
              <span>در کانال یا گروه خود به اشتراک بگذارید</span>
            </div>
            <div className={styles.howStep}>
              <div className={styles.howNum}>۳</div>
              <span>از هر خرید، {stats?.commission_percent ?? "؟"}٪ کمیسیون دریافت کنید</span>
            </div>
          </div>
        </GlassCard>
      </FadeIn>
    </div>
  );
}
