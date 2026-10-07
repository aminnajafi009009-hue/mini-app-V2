import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/shared/store/userStore";
import { House, Wallet, ShieldCheck, ShoppingCart, UserRound, Shield, Users } from "lucide-react";
import styles from "./PremiumBottomNavigation.module.css";

const baseItems = [
  { title: "خانه",    icon: House,        path: "/" },
  { title: "کیف پول",  icon: Wallet,       path: "/wallet" },
  { title: "سرویس‌ها", icon: ShieldCheck,  path: "/services" },
  { title: "خرید",     icon: ShoppingCart, path: "/subscription" },
  { title: "پروفایل", icon: UserRound,    path: "/profile" },
];

export default function PremiumBottomNavigation() {
  const user = useUserStore((state) => state.user);
  const isAdmin = !!user?.is_admin;
  const isReseller = !!user?.is_reseller;

  const items = [
    ...baseItems,
    ...(isReseller ? [{ title: "نماینده", icon: Users,  path: "/reseller" }] : []),
    ...(isAdmin    ? [{ title: "ادمین",   icon: Shield, path: "/admin-panel" }] : []),
  ];

  return (
    <nav className={styles.navigation}>
      <div className={styles.liquidBar} />
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink key={item.path} to={item.path} end={item.path === "/"}
            className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ""}`}>
            {({ isActive }) => (
              <>
                <motion.div className={styles.iconWrap} whileTap={{ scale: 0.82 }}>
                  <Icon size={22} />
                  {isActive && <motion.div className={styles.activeGlow} layoutId="nav-glow"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                </motion.div>
                <motion.span className={styles.label} animate={{ opacity: isActive ? 1 : 0.5 }}>
                  {item.title}
                </motion.span>
                <AnimatePresence>
                  {isActive && (
                    <motion.span className={styles.dot}
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
