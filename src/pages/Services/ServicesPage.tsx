import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Copy,
  Trash2,
  ChevronLeft,
  Rocket,
  FileText,
  RefreshCw,
  List,
} from "lucide-react";

import {
  deleteService,
  getServiceConfigs,
  getServiceQrBlob,
  getServiceUsage,
  getServices,
} from "@/shared/api/services";
import type {
  ServicesResponse,
  UsageInfo,
  VipService,
} from "@/shared/api/types";
import { hapticNotification } from "@/shared/haptics";

import { ShieldSearchIcon } from "@/shared/icons/AppIcons";
import GlassCard from "@/shared/ui/GlassCard";
import PremiumButton from "@/shared/ui/PremiumButton";
import FadeIn from "@/shared/animations/FadeIn";

import styles from "./ServicesPage.module.css";

function formatBytes(n: number | null): string {
  if (n == null) return "نامشخص";
  const gb = n / 1024 ** 3;
  if (gb >= 1) return `${gb.toFixed(1)} گیگابایت`;
  return `${(n / 1024 ** 2).toFixed(0)} مگابایت`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("کپی شد");
  } catch {
    toast.error("امکان کپی خودکار نبود");
  }
}

export default function ServicesPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<ServicesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedVip, setSelectedVip] = useState<VipService | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [remainingDays, setRemainingDays] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [mirrorConfigs, setMirrorConfigs] = useState<string[] | null>(null);
  const [mirrorLoading, setMirrorLoading] = useState(false);

  function load() {
    setLoading(true);
    getServices()
      .then(setData)
      .catch(() => toast.error("خطا در دریافت سرویس‌ها"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function openVip(v: VipService) {
    setSelectedVip(v);
    setQrUrl(null);
    setUsage(null);
    setMirrorConfigs(null);
    setRemainingDays(v.remaining_days ?? null);

    if (v.has_qr) {
      try {
        const blob = await getServiceQrBlob(v.id);
        setQrUrl(URL.createObjectURL(blob));
      } catch {
        toast.error("خطا در دریافت QR کد");
      }
    }

    if (v.sub_link) {
      setUsageLoading(true);
      getServiceUsage(v.id)
        .then((r) => {
          setUsage(r.usage);
          if (r.remaining_days !== undefined) setRemainingDays(r.remaining_days);
        })
        .catch(() => {
          setUsage(null);
          toast.error("خطا در دریافت وضعیت مصرف");
        })
        .finally(() => setUsageLoading(false));
    }
  }

  async function loadMirrorConfigs(configId: number) {
    setMirrorLoading(true);
    try {
      const r = await getServiceConfigs(configId);
      setMirrorConfigs(r.configs || []);
      if (!r.configs || r.configs.length === 0) {
        toast.error("کانفیگ تکی‌ای برای این سرویس یافت نشد");
      }
    } catch {
      toast.error("خطا در دریافت کانفیگ‌های تکی");
    } finally {
      setMirrorLoading(false);
    }
  }

  async function confirmDelete() {
    if (confirmDeleteId == null) return;
    hapticNotification("warning");
    setBusy(true);
    try {
      await deleteService(confirmDeleteId);
      hapticNotification("success");
      toast.success("✅ سرویس حذف شد.");
      setSelectedVip(null);
      setConfirmDeleteId(null);
      load();
    } catch {
      hapticNotification("error");
      toast.error("خطا در حذف سرویس");
    } finally {
      setBusy(false);
    }
  }

  // ---------- VIP detail ----------
  if (selectedVip) {
    return (
      <div className={styles.page}>
        <button className={styles.backBtn} onClick={() => setSelectedVip(null)}>
          <ChevronLeft size={18} /> بازگشت به لیست
        </button>

        <FadeIn>
          <GlassCard className={styles.detailHero}>
            <div className={styles.detailHeroInner}>
              <Rocket size={30} />
              <span className={styles.detailPlan}>{selectedVip.plan}</span>
              <span className={styles.detailDate}>
                ایجاد شده در {selectedVip.created_at}
              </span>
            </div>
          </GlassCard>
        </FadeIn>

        {remainingDays !== null && (
          <FadeIn delay={0.02}>
            <GlassCard className={styles.usageCard}>
              <div className={styles.remainingRow}>
                <span>⏳ زمان باقی‌مانده سرویس</span>
                <span
                  className={`${styles.remainingBadge} ${
                    remainingDays <= 0
                      ? styles.remainingDanger
                      : remainingDays <= 3
                        ? styles.remainingWarn
                        : styles.remainingOk
                  }`}
                >
                  {remainingDays <= 0 ? "منقضی شده" : `${remainingDays} روز`}
                </span>
              </div>
            </GlassCard>
          </FadeIn>
        )}

        {usageLoading ? (
          <p className={styles.emptyState}>در حال دریافت وضعیت مصرف...</p>
        ) : usage ? (
          <FadeIn delay={0.05}>
            <GlassCard className={styles.usageCard}>
              <div className={styles.usageRow}>
                <span>حجم مصرف‌شده</span>
                <b>{formatBytes(usage.used)}</b>
              </div>
              <div className={styles.usageBarTrack}>
                <div
                  className={styles.usageBarFill}
                  style={{ width: `${Math.min(usage.percent ?? 0, 100)}%` }}
                />
              </div>
              <div className={styles.usageRow}>
                <span>باقیمانده</span>
                <b>{formatBytes(usage.remaining)}</b>
              </div>
            </GlassCard>
          </FadeIn>
        ) : null}

        {qrUrl && (
          <FadeIn delay={0.08}>
            <GlassCard className={styles.qrCard}>
              <img src={qrUrl} alt="QR" className={styles.qrImg} />
            </GlassCard>
          </FadeIn>
        )}

        {selectedVip.sub_link && (
          <PremiumButton
            fullWidth
            variant="secondary"
            leftIcon={<Copy size={18} />}
            onClick={() => copyText(selectedVip.sub_link!)}
          >
            کپی لینک اشتراک
          </PremiumButton>
        )}

        <PremiumButton
          fullWidth
          leftIcon={<RefreshCw size={18} />}
          onClick={() =>
            navigate("/custom-build", {
              state: { orderType: "renew", targetConfigId: selectedVip.id, planLabel: selectedVip.plan },
            })
          }
        >
          🔁 تمدید سرویس
        </PremiumButton>

        {(selectedVip.sub_link || selectedVip.panel_type === "marzban" || selectedVip.panel_type === "pasargad") && (
          <PremiumButton
            fullWidth
            variant="secondary"
            leftIcon={<List size={18} />}
            loading={mirrorLoading}
            onClick={() => loadMirrorConfigs(selectedVip.id)}
          >
            دریافت کانفیگ‌های تکی
          </PremiumButton>
        )}

        {mirrorConfigs && mirrorConfigs.length > 0 && (
          <FadeIn>
            <div className={styles.mirrorList}>
              {mirrorConfigs.map((cfg, i) => (
                <GlassCard key={i} className={styles.fileRow}>
                  <div className={styles.fileRowInner}>
                    <FileText size={18} />
                    <span className={styles.mirrorConfigText}>{cfg}</span>
                    <button className={styles.downloadBtn} onClick={() => copyText(cfg)}>
                      <Copy size={16} />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </FadeIn>
        )}

        <PremiumButton
          fullWidth
          variant="danger"
          leftIcon={<Trash2 size={18} />}
          onClick={() => setConfirmDeleteId(selectedVip.id)}
        >
          حذف سرویس
        </PremiumButton>

        {confirmDeleteId === selectedVip.id && (
          <FadeIn>
            <GlassCard className={styles.confirmCard}>
              <p>
                ⚠️ مطمئنی می‌خوای «{selectedVip.plan}» رو حذف کنی؟
                <br />
                این سرویس از لیست «سرویس‌های من» شما پاک می‌شه (ولی اطلاعاتش
                نزد پشتیبانی می‌مونه).
              </p>
              <div className={styles.confirmActions}>
                <PremiumButton
                  fullWidth
                  variant="danger"
                  loading={busy}
                  onClick={confirmDelete}
                >
                  بله، حذف کن
                </PremiumButton>
                <PremiumButton
                  fullWidth
                  variant="ghost"
                  onClick={() => setConfirmDeleteId(null)}
                >
                  انصراف
                </PremiumButton>
              </div>
            </GlassCard>
          </FadeIn>
        )}
      </div>
    );
  }

  // ---------- List ----------
  const vipList = data?.vip ?? [];
  const list = vipList;

  return (
    <div className={styles.page}>
      <FadeIn><div className={styles.hero}><ShieldSearchIcon size={64} /></div></FadeIn>
      <GlassCard className={styles.usageCard}>
        <div style={{fontWeight:700}}>⭐ سرویس‌های VIP من</div>
        <div style={{opacity:.7,fontSize:13,marginTop:6}}>اطلاعات مصرف و وضعیت سرویس مستقیماً از پنل مربوطه دریافت می‌شود.</div>
      </GlassCard>
      {loading ? (
        <p className={styles.emptyState}>در حال بارگذاری سرویس‌ها...</p>
      ) : list.length === 0 ? (
        <div className={styles.emptyBox}><p>هنوز سرویس فعالی ندارید.</p><PremiumButton fullWidth onClick={() => navigate("/subscription")}>خرید اشتراک</PremiumButton></div>
      ) : list.map((s,i) => (
        <FadeIn key={s.id} delay={0.04*i}>
          <GlassCard className={styles.serviceRow} onClick={() => openVip(s)}>
            <div className={styles.serviceRowInner}>
              <div className={`${styles.serviceIcon} sphere-3d float`}><Rocket size={20}/></div>
              <div className={styles.serviceText}><span className={styles.serviceTitle}>{s.plan}</span><span className={styles.serviceDate}>{s.created_at}</span></div>
              <ChevronLeft size={18} className={styles.chevron}/>
            </div>
          </GlassCard>
        </FadeIn>
      ))}
    </div>
  );
}
