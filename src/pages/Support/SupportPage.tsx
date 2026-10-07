import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Megaphone } from "lucide-react";

import { getSupportInfo, sendTicket } from "@/shared/api/services";
import { HeadsetIcon } from "@/shared/icons/AppIcons";
import GlassCard from "@/shared/ui/GlassCard";
import PremiumButton from "@/shared/ui/PremiumButton";
import FadeIn from "@/shared/animations/FadeIn";

import styles from "./SupportPage.module.css";

export default function SupportPage() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [channelUrl, setChannelUrl] = useState("https://t.me/businesss_support");

  useEffect(() => {
    getSupportInfo()
      .then((r) => setChannelUrl(r.channel_url))
      .catch(() => {});
  }, []);

  async function submit() {
    if (!text.trim()) return;
    setBusy(true);
    try {
      await sendTicket(text.trim());
      toast.success("✅ پیام شما برای پشتیبانی ارسال شد. به‌زودی پاسخ داده می‌شود.");
      setText("");
    } catch {
      toast.error("خطا در ارسال تیکت");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <FadeIn>
        <div className={styles.hero}>
          <HeadsetIcon size={72} glow />
        </div>
      </FadeIn>

      <p className={styles.introText}>
        👨‍💻 می‌تونی مستقیم تیکت بزنی یا از کانال اصلی و پشتیبان استفاده کنی 👇
      </p>

      <PremiumButton
        fullWidth
        variant="secondary"
        leftIcon={<Megaphone size={18} />}
        onClick={() => window.open(channelUrl, "_blank")}
      >
        📢 کانال اصلی و پشتیبان
      </PremiumButton>

      <FadeIn delay={0.05}>
        <GlassCard className={styles.ticketCard}>
          <label className={styles.label}>🎫 ارسال تیکت</label>
          <textarea
            className={styles.textarea}
            rows={5}
            placeholder="پیام خود را برای پشتیبانی بنویسید..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </GlassCard>
      </FadeIn>

      <PremiumButton fullWidth disabled={!text.trim()} loading={busy} onClick={submit}>
        🎫 ارسال تیکت
      </PremiumButton>
    </div>
  );
}
