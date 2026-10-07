import styles from "./BackgroundEffects.module.css";

import noise from "@/assets/design/noise.svg";

const DUST_COLORS = [
  "rgba(255,255,255,.9)",
  "rgba(94,245,255,.9)",
  "rgba(255,227,174,.9)",
  "rgba(241,60,255,.8)",
  "rgba(178,255,60,.8)",
];

const DUST_MOTES = Array.from({ length: 14 }, (_, i) => {
  const size = 1.5 + ((i * 7) % 5) * 0.5;
  const left = (i * 37) % 100;
  const duration = 9 + ((i * 13) % 10);
  const delay = (i * 1.7) % 12;
  const color = DUST_COLORS[i % DUST_COLORS.length];
  return { size, left, duration, delay, color, key: i };
});

export default function BackgroundEffects() {
  return (
    <div className={styles.wrapper} aria-hidden="true">
      <div className={styles.nebula} />

      <div className={styles.planet}>
        <div className={styles.planetRing} />
      </div>

      <div className={styles.moon} />

      <div className={styles.starsFar} />
      <div className={styles.starsNear} />

      <div className={styles.comet} />
      <div className={styles.comet2} />

      <div className={styles.dustField}>
        {DUST_MOTES.map((mote) => (
          <span
            key={mote.key}
            style={{
              left: `${mote.left}%`,
              bottom: "-5%",
              width: `${mote.size}px`,
              height: `${mote.size}px`,
              background: mote.color,
              boxShadow: `0 0 ${mote.size * 3}px ${mote.color}`,
              animationDuration: `${mote.duration}s`,
              animationDelay: `${mote.delay}s`,
            }}
          />
        ))}
      </div>

      <img src={noise} alt="" className={styles.noise} />

      <div className={styles.vignette} />
    </div>
  );
}
