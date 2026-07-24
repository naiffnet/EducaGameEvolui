import React from "react";
import type { RpgClass } from "../types";

interface RpgAvatarProps {
  rpgClass: RpgClass | null;
  level: number;
  size?: number;
  ariaLabel?: string;
  avatarStyle?: 'EPIC_ADULT' | 'JUNIOR';
  birthDate?: string;
}

export const RpgAvatar: React.FC<RpgAvatarProps> = ({ 
  rpgClass, 
  level, 
  size = 120, 
  ariaLabel, 
}) => {
  const label = ariaLabel || "Heroi " + (rpgClass || "?") + " nv" + level;
  const aura = level >= 3;

  if (!rpgClass) {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={label} style={{ overflow: "visible" }}>
        <circle cx="60" cy="60" r="56" fill="#12131a" stroke="#5e3aee" strokeWidth="3" />
        <text x="60" y="76" textAnchor="middle" fill="#818cf8" fontSize="54" fontWeight="bold">?</text>
      </svg>
    );
  }

  const strokeColor = 
    rpgClass === "MAGE" ? "#818cf8" :
    rpgClass === "WARRIOR" ? "#f87171" :
    rpgClass === "RANGER" ? "#34d399" :
    rpgClass === "NECROMANCER" ? "#a78bfa" :
    rpgClass === "QUEEN" ? "#fbbf24" :
    rpgClass === "SCHOLAR" ? "#60a5fa" :
    rpgClass === "SMITH" ? "#fb923c" :
    rpgClass === "PYROMANCER" ? "#ef4444" :
    rpgClass === "PIRATE" ? "#f59e0b" : "#eab308";

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 120 120" 
      role="img" 
      aria-label={label} 
      style={{ overflow: "visible", filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.5))" }}
    >
      <defs>
        <clipPath id="avatar-clip">
          <circle cx="60" cy="60" r="54" />
        </clipPath>
      </defs>

      {/* Background Frame with Ring */}
      <circle cx="60" cy="60" r="58" fill="#090a0f" stroke={strokeColor} strokeWidth="3" />
      {aura && (
        <circle 
          cx="60" 
          cy="60" 
          r="57" 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="3.5" 
          strokeDasharray="6 3" 
          opacity="0.8" 
        />
      )}

      {/* Pixel Art Character Image Portrait */}
      <image 
        href={`/pixel_art/${rpgClass}.png`} 
        x="6" 
        y="6" 
        width="108" 
        height="108" 
        clipPath="url(#avatar-clip)" 
        preserveAspectRatio="xMidYMid slice" 
      />

      {/* Outer Border Polish Ring */}
      <circle cx="60" cy="60" r="54" fill="none" stroke={strokeColor} strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
};
