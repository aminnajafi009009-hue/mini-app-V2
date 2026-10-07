import { Send, RefreshCcw, ShieldCheck } from "lucide-react";
import WebApp from "@twa-dev/sdk";

import GlassCard from "@/shared/ui/GlassCard";
import PremiumButton from "@/shared/ui/PremiumButton";
import FadeIn from "@/shared/animations/FadeIn";

import styles from "./JoinChannelsGate.module.css";

interface Channel {
  name: string;
  url: string;
}

interface JoinChannelsGateProps {
  channels: Channel[];
  checking: boolean;
  onRecheck: () => void;
}

// 🐛 فیکس: قبلاً Mini App هیچ‌وقت شرط «عضویت اجباری در کانال» را چک نمی‌کرد
// و کاربر می‌توانست بدون عضویت مستقیم از این‌جا خرید کند. این کامپوننت همان
// دروازه‌ای است که در ربات همیشه وجود داشت، حالا برای مینی‌اپ هم اضافه شده.
export default function JoinChannelsGate({ channels, checking, onRecheck }: JoinChannelsGateProps) {
  const openChannel = (url: string) => {
    try {
      WebApp.openTelegramLink(url);
    } catch {
      WebApp.openLink(url);
    }
  };

  return (
    <div className={styles.page}>
      <FadeIn>
        <GlassCard className={styles.card}>
          <div className={styles.iconWrap}>
            <ShieldCheck size={34} />
          </div>
          <h2 className={styles.title}>عضویت در کانال‌ها الزامی است</h2>
          <p className={styles.subtitle}>
            برای استفاده از امکانات ربات، ابتدا باید در کانال‌های زیر عضو شوید.
            بعد از عضویت، دکمه‌ی «بررسی مجدد» را بزنید.
          </p>

          <div className={styles.channelList}>
            {channels.map((ch) => (
              <button
                key={ch.url}
                className={styles.channelItem}
                onClick={() => openChannel(ch.url)}
              >
                <Send size={16} />
                <span>{ch.name}</span>
              </button>
            ))}
          </div>

          <PremiumButton
            fullWidth
            leftIcon={<RefreshCcw size={18} />}
            loading={checking}
            onClick={onRecheck}
          >
            بررسی مجدد عضویت
          </PremiumButton>
        </GlassCard>
      </FadeIn>
    </div>
  );
}
