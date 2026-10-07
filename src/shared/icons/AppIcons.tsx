import IconBase from "./IconBase";

interface IconProps {
  size?: number;
  active?: boolean;
  glow?: boolean;
}

function Wrap({
  size = 58,
  active,
  glow,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <IconBase size={size} active={active} glow={glow}>
      <svg viewBox="0 0 24 24" fill="none">
        {children}
      </svg>
    </IconBase>
  );
}

export function CartIcon(props: IconProps) {
  return (
    <Wrap {...props}>
      <defs>
        <linearGradient id="cartG" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#A66BFF" />
          <stop offset="100%" stopColor="#6A45FF" />
        </linearGradient>
      </defs>
      <path
        d="M4 5h2l1.6 9.6a2 2 0 0 0 2 1.7h6.8a2 2 0 0 0 2-1.6L20 8H6.4"
        stroke="url(#cartG)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="19.5" r="1.4" fill="url(#cartG)" />
      <circle cx="16.5" cy="19.5" r="1.4" fill="url(#cartG)" />
    </Wrap>
  );
}

export function GiftIcon(props: IconProps) {
  return (
    <Wrap {...props}>
      <defs>
        <linearGradient id="giftG" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#FF8AD4" />
          <stop offset="100%" stopColor="#FF4FA0" />
        </linearGradient>
      </defs>
      <rect x="4" y="10" width="16" height="9" rx="1.6" fill="url(#giftG)" />
      <rect x="3.4" y="7" width="17.2" height="3.6" rx="1.2" fill="url(#giftG)" opacity=".85" />
      <rect x="11.1" y="7" width="1.8" height="12" fill="white" opacity=".55" />
      <path
        d="M12 7c-2-3.6-6.5-3-6 .3M12 7c2-3.6 6.5-3 6 .3"
        stroke="url(#giftG)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Wrap>
  );
}

export function ShieldSearchIcon(props: IconProps) {
  return (
    <Wrap {...props}>
      <defs>
        <linearGradient id="shieldG" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#6FA8FF" />
          <stop offset="100%" stopColor="#2C58F5" />
        </linearGradient>
      </defs>
      <path
        d="M12 3.5 5 6v5.2c0 4.4 2.9 7.7 7 8.8 4.1-1.1 7-4.4 7-8.8V6z"
        fill="url(#shieldG)"
      />
      <circle cx="11" cy="11" r="2.6" stroke="white" strokeWidth="1.3" opacity=".85" />
      <path d="M13 13l2 2" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity=".85" />
    </Wrap>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <Wrap {...props}>
      <defs>
        <linearGradient id="usersG" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#5FF5B8" />
          <stop offset="100%" stopColor="#0FBE7E" />
        </linearGradient>
      </defs>
      <circle cx="9" cy="9" r="3" fill="url(#usersG)" />
      <path d="M3.5 19c.6-3.4 3-5.2 5.5-5.2s4.9 1.8 5.5 5.2" stroke="url(#usersG)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="16.5" cy="8.5" r="2.3" fill="url(#usersG)" opacity=".7" />
      <path d="M15 13.6c2-.3 4.3.9 5.5 4" stroke="url(#usersG)" strokeWidth="1.6" strokeLinecap="round" opacity=".7" fill="none" />
    </Wrap>
  );
}

export function HeadsetIcon(props: IconProps) {
  return (
    <Wrap {...props}>
      <defs>
        <linearGradient id="headG" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#A66BFF" />
          <stop offset="100%" stopColor="#6A45FF" />
        </linearGradient>
      </defs>
      <path d="M5 13v-1a7 7 0 0 1 14 0v1" stroke="url(#headG)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <rect x="3.5" y="12.5" width="3.4" height="5.5" rx="1.5" fill="url(#headG)" />
      <rect x="17.1" y="12.5" width="3.4" height="5.5" rx="1.5" fill="url(#headG)" />
      <path d="M17.1 17.6v.9a2 2 0 0 1-2 2h-2.4" stroke="url(#headG)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </Wrap>
  );
}

export function TrophyIcon(props: IconProps) {
  return (
    <Wrap {...props}>
      <defs>
        <linearGradient id="trophyG" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#FFDA79" />
          <stop offset="100%" stopColor="#FF9F1C" />
        </linearGradient>
      </defs>
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" fill="url(#trophyG)" />
      <path d="M7 5.5H4.5a3 3 0 0 0 3 4M17 5.5h2.5a3 3 0 0 1-3 4" stroke="url(#trophyG)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <rect x="10.6" y="14" width="2.8" height="3" fill="url(#trophyG)" />
      <rect x="8" y="17.3" width="8" height="1.8" rx=".9" fill="url(#trophyG)" />
    </Wrap>
  );
}

export function PercentIcon(props: IconProps) {
  return (
    <Wrap {...props}>
      <defs>
        <linearGradient id="percentG" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#5FF5B8" />
          <stop offset="100%" stopColor="#0FBE7E" />
        </linearGradient>
      </defs>
      <circle cx="7.5" cy="7.5" r="2.6" fill="url(#percentG)" />
      <circle cx="16.5" cy="16.5" r="2.6" fill="url(#percentG)" />
      <path d="M17 6.5 6.5 17.5" stroke="url(#percentG)" strokeWidth="1.8" strokeLinecap="round" />
    </Wrap>
  );
}

export function GearIcon(props: IconProps) {
  return (
    <Wrap {...props}>
      <defs>
        <linearGradient id="gearG" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#A66BFF" />
          <stop offset="100%" stopColor="#6A45FF" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="3.2" fill="url(#gearG)" />
      <path
        d="M12 3.6v2.1M12 18.3v2.1M20.4 12h-2.1M5.7 12H3.6M17.5 6.5l-1.5 1.5M8 16l-1.5 1.5M17.5 17.5 16 16M8 8 6.5 6.5"
        stroke="url(#gearG)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Wrap>
  );
}

export function ProfileIcon(props: IconProps) {
  return (
    <Wrap {...props}>
      <defs>
        <linearGradient id="profG" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#FF8AD4" />
          <stop offset="100%" stopColor="#FF4FA0" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="8.5" r="3.5" fill="url(#profG)" />
      <path d="M5 19c.8-3.8 3.6-5.8 7-5.8s6.2 2 7 5.8" stroke="url(#profG)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </Wrap>
  );
}
