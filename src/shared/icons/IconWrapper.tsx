import { ReactNode } from "react";

interface IconWrapperProps {
  children: ReactNode;
  size?: number;
  glow?: boolean;
  className?: string;
}

export default function IconWrapper({
  children,
  size = 58,
  glow = true,
  className = "",
}: IconWrapperProps) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: 18,

        background: `
        linear-gradient(
        145deg,
        rgba(255,255,255,.12),
        rgba(255,255,255,.04)
        )`,

        border: "1px solid rgba(255,255,255,.08)",

        backdropFilter: "blur(20px)",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        boxShadow: glow
          ? `
          0 10px 25px rgba(124,77,255,.20),
          0 0 30px rgba(0,194,255,.12)
          `
          : undefined,

        transition: ".35s",
      }}
    >
      {children}
    </div>
  );
}
