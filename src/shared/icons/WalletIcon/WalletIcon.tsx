import IconBase from "../IconBase";

interface WalletIconProps {
  size?: number;
  active?: boolean;
  glow?: boolean;
}

export default function WalletIcon({
  size = 58,
  active = false,
  glow = true,
}: WalletIconProps) {
  return (
    <IconBase
      size={size}
      active={active}
      glow={glow}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
      >
        <defs>
          <linearGradient
            id="walletGradient"
            x1="0"
            y1="0"
            x2="24"
            y2="24"
          >
            <stop
              offset="0%"
              stopColor="#A66BFF"
            />

            <stop
              offset="55%"
              stopColor="#7C4DFF"
            />

            <stop
              offset="100%"
              stopColor="#00C2FF"
            />
          </linearGradient>

          <linearGradient
            id="walletCard"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#FFFFFF"
              stopOpacity=".95"
            />

            <stop
              offset="100%"
              stopColor="#D8E5FF"
            />
          </linearGradient>
        </defs>

        <path
          d="
          M4 8
          C4 6.4 5.4 5 7 5
          H17
          C18.7 5 20 6.3 20 8
          V16
          C20 17.7 18.7 19 17 19
          H7
          C5.4 19 4 17.6 4 16
          Z
          "
          fill="url(#walletGradient)"
        />

        <rect
          x="12.8"
          y="10"
          width="6.2"
          height="4"
          rx="2"
          fill="url(#walletCard)"
        />

        <circle
          cx="17"
          cy="12"
          r=".8"
          fill="#7C4DFF"
        />

        <path
          d="M6.2 8.3H15"
          stroke="white"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity=".55"
        />
      </svg>
    </IconBase>
  );
}
