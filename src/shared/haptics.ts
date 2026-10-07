/**
 * ابزار کمکی برای لرزش لمسی تلگرام (HapticFeedback).
 * اگر خارج از تلگرام اجرا شود، بی‌صدا نادیده گرفته می‌شود.
 */
import WebApp from "@twa-dev/sdk";

export function hapticImpact(style: "light" | "medium" | "heavy" = "light") {
  try {
    WebApp.HapticFeedback.impactOccurred(style);
  } catch {
    // خارج از تلگرام
  }
}

export function hapticNotification(type: "success" | "error" | "warning" = "success") {
  try {
    WebApp.HapticFeedback.notificationOccurred(type);
  } catch {
    // خارج از تلگرام
  }
}
