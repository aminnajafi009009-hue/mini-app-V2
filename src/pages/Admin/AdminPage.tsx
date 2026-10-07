import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import {
  BarChart3, Users, ShoppingCart, DollarSign, Radio,
  Search, Shield, TrendingUp, RefreshCw,
  Activity, Wifi, AlertCircle, CheckCircle, Clock,
  MessageSquare
} from "lucide-react";
import { apiGet, apiPost } from "@/shared/api/client";
import GlassCard from "@/shared/ui/GlassCard";
import FadeIn from "@/shared/animations/FadeIn";
import styles from "./AdminPage.module.css";

interface AdminStats {
  total_users: number;
  active_users_today: number;
  new_users_today: number;
  total_orders: number;
  orders_today: number;
  active_services: number;
  pending_orders: number;
  revenue_today: number;
  revenue_total: number;
  open_tickets: number;
}

interface RecentOrder {
  id: number;
  user_id: number;
  user_name?: string;
  plan_name: string;
  amount: number;
  status: string;
  created_at: string;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 320, damping: 28 } },
};

function StatCard({ icon, label, value, color, glow }: {
  icon: React.ReactNode; label: string; value: string | number;
  color: string; glow?: string;
}) {
  return (
    <motion.div variants={item}>
      <GlassCard className={`${styles.statCard} liquid-card`}>
        <div className={styles.statCardInner}>
          <div className={styles.statIcon} style={{
            background: color,
            boxShadow: glow || `0 0 20px ${color}60`
          }}>
            {icon}
          </div>
          <div className={styles.statText}>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
          </div>
        </div>
        <div className={styles.liquidShine} />
      </GlassCard>
    </motion.div>
  );
}

function QuickAction({ icon, label, color, onClick }: {
  icon: React.ReactNode; label: string; color: string; onClick: () => void;
}) {
  return (
    <motion.button
      variants={item}
      whileTap={{ scale: 0.93 }}
      whileHover={{ y: -4 }}
      className={`${styles.quickAction} liquid-button`}
      onClick={onClick}
      style={{ "--action-color": color } as React.CSSProperties}
    >
      <div className={styles.qaIcon} style={{ background: color }}>{icon}</div>
      <span className={styles.qaLabel}>{label}</span>
      <div className={styles.liquidRipple} />
    </motion.button>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUid, setSearchUid] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [tab, setTab] = useState<"dashboard" | "orders" | "users" | "broadcast">("dashboard");
  const [bcMsg, setBcMsg] = useState("");
  const [bcSending, setBcSending] = useState(false);

  const loadDashboard = () => {
    setLoading(true);
    Promise.all([
      apiGet("/admin/stats").catch(() => null),
      apiGet("/admin/orders/recent").catch(() => []),
    ]).then(([s, o]) => {
      if (s) setStats(s);
      if (o) setOrders(Array.isArray(o) ? o : []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSearch = async () => {
    if (!searchUid.trim()) return;
    setSearching(true);
    try {
      const r = await apiGet(`/admin/user/${searchUid.trim()}`);
      setSearchResult(r);
    } catch { setSearchResult({ error: "کاربر یافت نشد" }); }
    setSearching(false);
  };

  const handleBroadcast = async () => {
    if (!bcMsg.trim()) return;
    setBcSending(true);
    try {
      await apiPost("/admin/broadcast", { message: bcMsg });
      setBcMsg("");
      alert("✅ پیام همگانی ارسال شد");
    } catch { alert("❌ خطا در ارسال"); }
    setBcSending(false);
  };

  return (
    <div className={styles.page}>
      {/* Liquid BG blobs */}
      <div className={`${styles.blob1} liquid-blob`} />
      <div className={`${styles.blob2} liquid-blob`} />

      {/* Header */}
      <FadeIn>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.adminBadge}>
              <Shield size={14} />
              <span>ادمین</span>
            </div>
            <h1 className="gradient-text">پنل مدیریت</h1>
          </div>
          <motion.div
            className={styles.headerIcon}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Activity size={22} />
          </motion.div>
        </div>
      </FadeIn>

      {/* Tabs */}
      <FadeIn delay={0.05}>
        <div className={styles.tabs}>
          {(["dashboard", "orders", "users", "broadcast"] as const).map((t) => (
            <motion.button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`}
              onClick={() => setTab(t)}
              whileTap={{ scale: 0.95 }}
            >
              {t === "dashboard" ? "📊 داشبورد" : t === "orders" ? "📦 سفارشات" : t === "users" ? "👤 کاربران" : "📢 همگانی"}
            </motion.button>
          ))}
        </div>
      </FadeIn>

      {/* === DASHBOARD === */}
      {tab === "dashboard" && (
        <>
          {/* Stats Grid */}
          <motion.div
            className={styles.statsGrid}
            variants={container}
            initial="hidden"
            animate="show"
          >
            <StatCard icon={<Users size={18} />} label="کل کاربران"
              value={stats?.total_users?.toLocaleString("fa-IR") ?? "—"}
              color="linear-gradient(135deg,#8B5CF6,#6D3EF4)" />
            <StatCard icon={<TrendingUp size={18} />} label="عضو امروز"
              value={stats?.new_users_today?.toLocaleString("fa-IR") ?? "—"}
              color="linear-gradient(135deg,#00D9FF,#0097D9)" />
            <StatCard icon={<ShoppingCart size={18} />} label="سفارش امروز"
              value={stats?.orders_today?.toLocaleString("fa-IR") ?? "—"}
              color="linear-gradient(135deg,#39FFB0,#00B87A)" />
            <StatCard icon={<Clock size={18} />} label="در انتظار"
              value={stats?.pending_orders?.toLocaleString("fa-IR") ?? "—"}
              color="linear-gradient(135deg,#FFC94A,#E0973C)" />
            <StatCard icon={<Wifi size={18} />} label="سرویس فعال"
              value={stats?.active_services?.toLocaleString("fa-IR") ?? "—"}
              color="linear-gradient(135deg,#5EF5FF,#00C2FF)" />
            <StatCard icon={<MessageSquare size={18} />} label="تیکت باز"
              value={stats?.open_tickets?.toLocaleString("fa-IR") ?? "—"}
              color="linear-gradient(135deg,#FF5470,#CC1A38)" />
          </motion.div>

          {/* Revenue Cards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard className={`${styles.revenueCard} glass-premium shimmer-auto`}>
              <div className={styles.revenueRow}>
                <div className={styles.revenueItem}>
                  <DollarSign size={16} className={styles.revIcon} />
                  <span className={styles.revLabel}>درآمد امروز</span>
                  <span className={`${styles.revValue} gradient-text-gold`}>
                    {stats?.revenue_today?.toLocaleString("fa-IR") ?? "—"} ت
                  </span>
                </div>
                <div className={styles.revDivider} />
                <div className={styles.revenueItem}>
                  <BarChart3 size={16} className={styles.revIcon} />
                  <span className={styles.revLabel}>کل درآمد</span>
                  <span className={`${styles.revValue} gradient-text-gold`}>
                    {stats?.revenue_total?.toLocaleString("fa-IR") ?? "—"} ت
                  </span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Quick Actions */}
          <FadeIn delay={0.35}>
            <div className={styles.sectionTitle}>⚡ دسترسی سریع</div>
          </FadeIn>
          <motion.div
            className={styles.quickActions}
            variants={container} initial="hidden" animate="show"
          >
            <QuickAction icon={<BarChart3 size={18} />} label="داشبورد"
              color="linear-gradient(135deg,#8B5CF6,#6D3EF4)"
              onClick={() => setTab("dashboard")} />
            <QuickAction icon={<ShoppingCart size={18} />} label="سفارشات"
              color="linear-gradient(135deg,#00D9FF,#0097D9)"
              onClick={() => setTab("orders")} />
            <QuickAction icon={<Users size={18} />} label="کاربران"
              color="linear-gradient(135deg,#39FFB0,#00B87A)"
              onClick={() => setTab("users")} />
            <QuickAction icon={<Radio size={18} />} label="پیام همگانی"
              color="linear-gradient(135deg,#8B5CF6,#6D3EF4)"
              onClick={() => setTab("broadcast")} />
            <QuickAction icon={<Search size={18} />} label="جستجو"
              color="linear-gradient(135deg,#FF5470,#CC1A38)"
              onClick={() => setTab("users")} />
            <QuickAction icon={<RefreshCw size={18} />} label="بروزرسانی"
              color="linear-gradient(135deg,#FFC94A,#E0973C)"
              onClick={loadDashboard} />
          </motion.div>

          {/* Broadcast Box */}
          <FadeIn delay={0.4}>
            <div className={styles.sectionTitle}>📢 پیام همگانی سریع</div>
            <GlassCard className={styles.broadcastCard}>
              <textarea
                className={styles.bcTextarea}
                placeholder="متن پیام همگانی را وارد کنید..."
                value={bcMsg}
                onChange={(e) => setBcMsg(e.target.value)}
                rows={3}
              />
              <motion.button
                className={`${styles.bcBtn} liquid-button`}
                whileTap={{ scale: 0.96 }}
                onClick={handleBroadcast}
                disabled={bcSending || !bcMsg.trim()}
              >
                {bcSending ? "در حال ارسال..." : "📤 ارسال به همه"}
              </motion.button>
            </GlassCard>
          </FadeIn>
        </>
      )}

      {/* === ORDERS === */}
      {tab === "orders" && (
        <FadeIn delay={0.1}>
          <div className={styles.sectionTitle}>📦 آخرین سفارش‌ها</div>
          {loading ? (
            <div className={styles.loadingWrap}>
              <div className={`${styles.loadingBlob} liquid-blob`} />
              <span>در حال بارگذاری...</span>
            </div>
          ) : orders.length === 0 ? (
            <GlassCard className={styles.emptyCard}>
              <AlertCircle size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
              <p>سفارشی یافت نشد</p>
            </GlassCard>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className={styles.ordersList}>
              {orders.map((order) => (
                <motion.div key={order.id} variants={item}>
                  <GlassCard className={`${styles.orderCard} liquid-card`}>
                    <div className={styles.orderTop}>
                      <span className={styles.orderPlan}>{order.plan_name}</span>
                      <span className={`${styles.orderStatus} ${styles[order.status]}`}>
                        {order.status === "active" ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {order.status}
                      </span>
                    </div>
                    <div className={styles.orderBot}>
                      <span className={styles.orderUser}>👤 {order.user_name || order.user_id}</span>
                      <span className={styles.orderAmount}>{order.amount.toLocaleString("fa-IR")} ت</span>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </FadeIn>
      )}

      {/* === USERS === */}
      {tab === "users" && (
        <FadeIn delay={0.1}>
          <div className={styles.sectionTitle}>🔍 جستجوی کاربر</div>
          <GlassCard className={styles.searchCard}>
            <div className={styles.searchRow}>
              <input
                className={styles.searchInput}
                placeholder="آیدی یا یوزرنیم کاربر"
                value={searchUid}
                onChange={(e) => setSearchUid(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <motion.button
                className={`${styles.searchBtn} liquid-button`}
                whileTap={{ scale: 0.93 }}
                onClick={handleSearch}
                disabled={searching}
              >
                {searching ? <Activity size={18} className={styles.spin} /> : <Search size={18} />}
              </motion.button>
            </div>

            {searchResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className={styles.searchResult}
              >
                {searchResult.error ? (
                  <div className={styles.searchError}>
                    <AlertCircle size={16} /> {searchResult.error}
                  </div>
                ) : (
                  <div className={styles.userInfo}>
                    <div className={styles.uiRow}>
                      <span className={styles.uiLabel}>آیدی</span>
                      <span className={styles.uiVal}>{searchResult.id}</span>
                    </div>
                    <div className={styles.uiRow}>
                      <span className={styles.uiLabel}>نام</span>
                      <span className={styles.uiVal}>{searchResult.name || "—"}</span>
                    </div>
                    <div className={styles.uiRow}>
                      <span className={styles.uiLabel}>والت</span>
                      <span className={styles.uiVal}>{(searchResult.wallet || 0).toLocaleString("fa-IR")} ت</span>
                    </div>
                    <div className={styles.uiRow}>
                      <span className={styles.uiLabel}>VIP</span>
                      <span className={styles.uiVal}>{searchResult.is_vip ? "✅" : "❌"}</span>
                    </div>
                    <div className={styles.uiRow}>
                      <span className={styles.uiLabel}>بلاک</span>
                      <span className={styles.uiVal}>{searchResult.is_blocked ? "🚫" : "✅"}</span>
                    </div>
                    <div className={styles.uiActions}>
                      <motion.button whileTap={{ scale: 0.93 }} className={styles.uiBtn}
                        onClick={async () => {
                          await apiPost("/admin/user/toggle-block", { user_id: searchResult.id });
                          handleSearch();
                        }}>🚫 بلاک/آنبلاک</motion.button>
                      <motion.button whileTap={{ scale: 0.93 }} className={`${styles.uiBtn} ${styles.uiBtnGold}`}
                        onClick={async () => {
                          const v = prompt("مبلغ والت (تومان):");
                          if (v) await apiPost("/admin/user/add-wallet", { user_id: searchResult.id, amount: Number(v) });
                        }}>💰 شارژ والت</motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </GlassCard>
        </FadeIn>
      )}

      {/* === BROADCAST === */}
      {tab === "broadcast" && (
        <FadeIn delay={0.1}>
          <div className={styles.sectionTitle}>📢 پیام همگانی</div>
          <GlassCard className={styles.broadcastCard}>
            <textarea
              className={styles.bcTextarea}
              placeholder="متن پیام همگانی را وارد کنید..."
              value={bcMsg}
              onChange={(e) => setBcMsg(e.target.value)}
              rows={6}
            />
            <motion.button
              className={`${styles.bcBtn} liquid-button`}
              whileTap={{ scale: 0.96 }}
              onClick={handleBroadcast}
              disabled={bcSending || !bcMsg.trim()}
            >
              {bcSending ? "در حال ارسال..." : "📤 ارسال به همه"}
            </motion.button>
          </GlassCard>
        </FadeIn>
      )}
    </div>
  );
}
