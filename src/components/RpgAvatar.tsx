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
  avatarStyle = 'EPIC_ADULT',
  birthDate 
}) => {
  const label = ariaLabel || "Heroi " + (rpgClass || "?") + " nv" + level;
  const aura = level >= 3;

  // Auto-detect age: if student is >= 10 years old or avatarStyle is EPIC_ADULT, use Epic Adult RPG art
  let isAdultStyle = avatarStyle === 'EPIC_ADULT';
  if (birthDate) {
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
    if (age >= 10) isAdultStyle = true;
  }

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
      {/* Background Frame with Gradient Ring */}
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

      {/* ⚔️ WARRIOR / CRUZADO ÉPICO */}
      {rpgClass === "WARRIOR" && (
        <>
          {/* Armor Mantle / Cape */}
          <path d="M 18 118 Q 30 65 60 58 Q 90 65 102 118 Z" fill="#1e293b" />
          <path d="M 28 118 Q 36 72 60 66 Q 84 72 92 118 Z" fill="#991b1b" />
          
          {/* Heavy Steel Pauldrons with Gold Trim */}
          <path d="M 16 78 Q 28 54 44 68 L 34 88 Z" fill="#475569" stroke="#fbbf24" strokeWidth="1.5" />
          <path d="M 104 78 Q 92 54 76 68 L 86 88 Z" fill="#475569" stroke="#fbbf24" strokeWidth="1.5" />
          
          {/* Mature Hero Face / Helmet */}
          {isAdultStyle ? (
            <>
              {/* Full Knight Visor Helmet */}
              <path d="M 36 48 Q 38 18 60 16 Q 82 18 84 48 L 80 64 Q 60 70 40 64 Z" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
              <path d="M 40 44 L 80 44 L 76 52 L 44 52 Z" fill="#0f172a" />
              {/* Glowing Visor Slit */}
              <line x1="44" y1="48" x2="76" y2="48" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="46" y1="48" x2="74" y2="48" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
              {/* Golden Crest */}
              <polygon points="60,10 65,22 55,22" fill="#fbbf24" />
            </>
          ) : (
            <>
              <circle cx="60" cy="50" r="22" fill="#f5cba7" />
              <path d="M 38 44 Q 60 24 82 44 L 78 36 Q 60 20 42 36 Z" fill="#374151" />
            </>
          )}

          {/* Flame Greatsword */}
          <line x1="90" y1="108" x2="108" y2="44" stroke="#cbd5e1" strokeWidth={aura ? 6 : 5} strokeLinecap="round" />
          <line x1="90" y1="108" x2="108" y2="44" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          <circle cx="108" cy="42" r="5" fill="#fbbf24" />
        </>
      )}

      {/* 🧙‍♂️ MAGE / ARCANISTA SUPREMO */}
      {rpgClass === "MAGE" && (
        <>
          {/* Arch-Mage Robes */}
          <path d="M 22 118 Q 32 68 60 60 Q 88 68 98 118 Z" fill="#2e1065" />
          <path d="M 32 118 Q 40 74 60 68 Q 80 74 88 118 Z" fill="#4c1d95" />

          {/* Hood and Mystic Face */}
          <path d="M 32 48 Q 34 10 60 8 Q 86 10 88 48 Q 78 62 60 64 Q 42 62 32 48 Z" fill="#3b0764" stroke="#818cf8" strokeWidth="2" />
          <ellipse cx="60" cy="48" rx="20" ry="16" fill="#0f172a" />
          
          {/* Glowing Arcane Eyes */}
          <circle cx="52" cy="48" r="4" fill="#60a5fa" />
          <circle cx="68" cy="48" r="4" fill="#60a5fa" />
          <circle cx="52" cy="48" r="2" fill="#ffffff" />
          <circle cx="68" cy="48" r="2" fill="#ffffff" />

          {/* Floating Spell Orb Staff */}
          <line x1="88" y1="110" x2="98" y2="42" stroke="#6b21a8" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="98" cy="38" r="10" fill="#818cf8" opacity="0.9" />
          <circle cx="98" cy="38" r="6" fill="#e0e7ff" />
          {aura && <circle cx="98" cy="38" r="15" fill="none" stroke="#c7d2fe" strokeWidth="2" strokeDasharray="4 2" />}
        </>
      )}

      {/* 👑 QUEEN / SOBERANA REAL */}
      {rpgClass === "QUEEN" && (
        <>
          <path d="M 18 118 Q 30 64 60 56 Q 90 64 102 118 Z" fill="#581c87" />
          <path d="M 28 118 Q 38 70 60 62 Q 82 70 92 118 Z" fill="#7e22ce" />
          
          {/* Sovereign Face and Crown */}
          <circle cx="60" cy="46" r="21" fill="#fde8d0" />
          <path d="M 36 34 L 40 18 L 50 28 L 60 12 L 70 28 L 80 18 L 84 34 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
          <circle cx="60" cy="14" r="3.5" fill="#ef4444" />
          <circle cx="40" cy="20" r="2.5" fill="#3b82f6" />
          <circle cx="80" cy="20" r="2.5" fill="#3b82f6" />

          {/* Eyes & Royal Expression */}
          <ellipse cx="52" cy="46" rx="3.5" ry="4" fill="#0f172a" />
          <ellipse cx="68" cy="46" rx="3.5" ry="4" fill="#0f172a" />
          <circle cx="53" cy="45" r="1.2" fill="#ffffff" />
          <circle cx="69" cy="45" r="1.2" fill="#ffffff" />
          <path d="M 54 54 Q 60 58 66 54" fill="none" stroke="#be185d" strokeWidth="2" strokeLinecap="round" />
        </>
      )}

      {/* 🏴‍☠️ PIRATE / CORSÁRIO LENDÁRIO */}
      {rpgClass === "PIRATE" && (
        <>
          <path d="M 24 118 Q 32 68 60 60 Q 88 68 96 118 Z" fill="#451a03" />
          <path d="M 34 118 Q 40 74 60 66 Q 80 74 86 118 Z" fill="#78350f" />
          
          {/* Pirate Face and Eye Patch */}
          <circle cx="60" cy="46" r="22" fill="#d4956a" />
          <path d="M 28 36 Q 60 22 92 36 L 86 44 Q 60 32 34 44 Z" fill="#0f172a" />
          <rect x="36" y="24" width="48" height="14" rx="2" fill="#0f172a" />
          
          {/* Eye Patch */}
          <ellipse cx="50" cy="46" rx="6" ry="5" fill="#0f172a" />
          <line x1="38" y1="38" x2="62" y2="52" stroke="#0f172a" strokeWidth="2.5" />
          
          {/* Open Eye */}
          <ellipse cx="70" cy="46" rx="4" ry="4.5" fill="#ffffff" />
          <circle cx="71" cy="46" r="2.5" fill="#78350f" />
          <path d="M 54 56 Q 60 62 66 56" fill="none" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />

          {/* Dual Cutlass */}
          <line x1="88" y1="106" x2="106" y2="52" stroke="#e2e8f0" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 106 52 Q 112 44 108 38" fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        </>
      )}

      {/* 🏹 RANGER / CAÇADOR */}
      {rpgClass === "RANGER" && (
        <>
          <path d="M 24 118 Q 32 70 60 62 Q 88 70 96 118 Z" fill="#064e3b" />
          <circle cx="60" cy="48" r="21" fill="#d4a574" />
          <path d="M 34 48 Q 60 18 86 48 Q 78 58 60 58 Q 42 58 34 48 Z" fill="#047857" />
          
          <ellipse cx="52" cy="47" rx="3.5" ry="4" fill="#ffffff" />
          <ellipse cx="68" cy="47" rx="3.5" ry="4" fill="#ffffff" />
          <circle cx="53" cy="47" r="2.2" fill="#065f46" />
          <circle cx="69" cy="47" r="2.2" fill="#065f46" />
          
          {/* Longbow */}
          <path d="M 22 96 Q 12 60 22 24" fill="none" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
          <line x1="22" y1="24" x2="22" y2="96" stroke="#a7f3d0" strokeWidth="1.2" />
        </>
      )}

      {/* 💀 NECROMANCER / NECROMANTE */}
      {rpgClass === "NECROMANCER" && (
        <>
          <path d="M 22 118 Q 30 68 60 60 Q 90 68 98 118 Z" fill="#1e1b4b" />
          <circle cx="60" cy="48" r="21" fill="#312e81" />
          <circle cx="52" cy="46" r="3.5" fill="#a78bfa" />
          <circle cx="68" cy="46" r="3.5" fill="#a78bfa" />
          <circle cx="52" cy="46" r="1.5" fill="#ffffff" />
          <circle cx="68" cy="46" r="1.5" fill="#ffffff" />
        </>
      )}

      {/* 📚 SCHOLAR / ERUDITO */}
      {rpgClass === "SCHOLAR" && (
        <>
          <path d="M 26 118 Q 34 68 60 62 Q 86 68 94 118 Z" fill="#1e3a5f" />
          <circle cx="60" cy="48" r="21" fill="#f5d0a9" />
          <circle cx="52" cy="48" r="7" fill="none" stroke="#92400e" strokeWidth="2.5" />
          <circle cx="68" cy="48" r="7" fill="none" stroke="#92400e" strokeWidth="2.5" />
          <line x1="59" y1="48" x2="61" y2="48" stroke="#92400e" strokeWidth="2" />
        </>
      )}

      {/* 🔨 SMITH / ARMEIRO */}
      {rpgClass === "SMITH" && (
        <>
          <path d="M 22 118 Q 30 68 60 62 Q 90 68 98 118 Z" fill="#78350f" />
          <circle cx="60" cy="48" r="22" fill="#c08040" />
          <rect x="88" y="52" width="18" height="14" rx="2" fill="#475569" />
          <line x1="84" y1="106" x2="97" y2="62" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
        </>
      )}

      {/* 🔥 PYROMANCER / PIROMANTE */}
      {rpgClass === "PYROMANCER" && (
        <>
          <path d="M 24 118 Q 30 66 60 58 Q 90 66 96 118 Z" fill="#7f1d1d" />
          <circle cx="60" cy="48" r="22" fill="#fcd5b0" />
          <circle cx="52" cy="46" r="3.5" fill="#ef4444" />
          <circle cx="68" cy="46" r="3.5" fill="#ef4444" />
        </>
      )}

      {/* 🏆 CHAMPION / CAMPEÃO */}
      {rpgClass === "CHAMPION" && (
        <>
          <path d="M 18 118 Q 28 66 60 58 Q 92 66 102 118 Z" fill="#b45309" />
          <circle cx="60" cy="44" r="24" fill="#d4956a" />
          <polygon points="38,28 42,12 52,22 60,8 68,22 78,12 82,28" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
        </>
      )}
    </svg>
  );
};
