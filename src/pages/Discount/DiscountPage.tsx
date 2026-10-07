import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { validateDiscount } from "@/shared/api/services";
import { PercentIcon } from "@/shared/icons/AppIcons";
import GlassCard from "@/shared/ui/GlassCard";
import PremiumButton from "@/shared/ui/PremiumButton";
import PremiumInput from "@/shared/ui/PremiumInput";
import FadeIn from "@/shared/animations/FadeIn";

import styles from "./DiscountPage.module.css";

export default function DiscountPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    percent?: number;
    discount_type?: "percent" | "amount";
    amount?: number;
  } | null>(null);

  async function apply() {
    if (!code.trim()) return;
    setBusy(true);
    try {
      const res = await validateDiscount(code.trim());
      setResult(res);
      if (res.valid) {
        const label =
          res.discount_type === "amount"
            ? `${(res.amount || 0).toLocaleString("fa-IR")} تومان`
            : `${res.percent}٪`;
        toast.success(`کد تخفیف ${label} معتبر است`);
      } else {
        toast.error("این کد تخفیف نامعتبر است");
      }
    } catch {
      toast.error("خطا در بررسی کد تخفیف");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <FadeIn>
        <div className={styles.hero}>
          <PercentIcon size={64} />
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <PremiumInput
          label="کد تخفیف"
          placeholder="کد تخفیف خود را وارد کنید"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </FadeIn>

      <PremiumButton fullWidth disabled={!code.trim()} loading={busy} onClick={apply}>
        بررسی اعتبار کد تخفیف
      </PremiumButton>

      {result?.valid && (
        <FadeIn>
          <GlassCard className={styles.successCard}>
            {result.discount_type === "amount"
              ? `این کد ${(result.amount || 0).toLocaleString("fa-IR")} تومان تخفیف دارد.`
              : `این کد ${result.percent}٪ تخفیف دارد.`}{" "}
            برای استفاده، آن را در صفحه‌ی خرید (روبروی پلن موردنظر) وارد کنید.
          </GlassCard>
        </FadeIn>
      )}

      <PremiumButton fullWidth variant="secondary" onClick={() => navigate("/subscription")}>
        رفتن به خرید اشتراک
      </PremiumButton>
    </div>
  );
}
