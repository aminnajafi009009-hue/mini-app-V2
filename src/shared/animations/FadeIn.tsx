import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInProps {
  key?: string | number;
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  once?: boolean;
}

export default function FadeIn({
  children,
  delay = 0,
  duration = .45,
  y = 18,
  once = true,
}: FadeInProps) {
  // 🐛 فیکس: قبلاً از whileInView + viewport (مخصوص IntersectionObserver و اسکرول واقعی
  // صفحه) استفاده می‌شد. داخل webview مینی‌اپ تلگرام (خصوصاً قبل از اینکه
  // WebApp.expand() کامل اجرا بشه و ارتفاع viewport واقعی مشخص بشه)، این
  // IntersectionObserver گاهی اصلاً عناصر رو «در دید» تشخیص نمی‌ده، پس انیمیشن
  // هیچ‌وقت start نمی‌شه و همه‌چیز با opacity:0 همیشه مخفی می‌مونه — دقیقاً
  // همون «صفحه‌ی خالی»ی که دیده می‌شد. با animate، انیمیشن همیشه فوراً بعد از
  // mount شدن اجرا می‌شه، مستقل از اینکه عنصر داخل viewport تشخیص داده بشه یا نه.
  return (
    <motion.div
      initial={{
        opacity: 0,
        y,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay,
        duration,
        ease: [0.22,1,0.36,1],
      }}
    >
      {children}
    </motion.div>
  );
}
