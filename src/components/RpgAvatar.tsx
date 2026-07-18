import React from "react";
import type { RpgClass } from "../types";
interface P { rpgClass: RpgClass | null; level: number; size?: number; ariaLabel?: string; }
export const RpgAvatar: React.FC<P> = ({ rpgClass, level, size = 120, ariaLabel }) => {
  const label = ariaLabel || "Heroi " + (rpgClass || "?") + " nv" + level;
  const aura = level >= 3; const mid = level >= 2;
  if (!rpgClass) return (<svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={label} style={{overflow:"visible"}}><circle cx="60" cy="60" r="56" fill="#1e1b2e" stroke="#553c9a" strokeWidth="3"/><text x="60" y="76" textAnchor="middle" fill="#b794f4" fontSize="54" fontWeight="bold">?</text></svg>);
  return (<svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={label} style={{overflow:"visible",filter:"drop-shadow(0 4px 8px rgba(0,0,0,0.4))"}}>
    {/* BG */}
    <circle cx="60" cy="60" r="58" fill="#0d1117" stroke={rpgClass==="MAGE"?"#7d62ff":rpgClass==="WARRIOR"?"#ff7253":rpgClass==="RANGER"?"#39db80":rpgClass==="NECROMANCER"?"#7c3aed":rpgClass==="QUEEN"?"#ffd700":rpgClass==="SCHOLAR"?"#63b3ed":rpgClass==="SMITH"?"#f6ad55":rpgClass==="PYROMANCER"?"#ff9f43":rpgClass==="PIRATE"?"#fbd38d":rpgClass==="JESTER"?"#f6e05e":"#c6a94b"} strokeWidth="2.5"/>
    {aura && <circle cx="60" cy="60" r="57" fill="none" stroke={rpgClass==="MAGE"?"#a78bfa":rpgClass==="WARRIOR"?"#ff7253":rpgClass==="RANGER"?"#39db80":rpgClass==="NECROMANCER"?"#a78bfa":rpgClass==="QUEEN"?"#ffd700":rpgClass==="SCHOLAR"?"#93c5fd":rpgClass==="SMITH"?"#f6ad55":rpgClass==="PYROMANCER"?"#ff9f43":rpgClass==="PIRATE"?"#fbd38d":rpgClass==="JESTER"?"#f6e05e":"#ffd700"} strokeWidth="3" strokeDasharray="6 3" opacity="0.7"/>}

    {/* MAGE */}
    {rpgClass==="MAGE" && <>
      <path d="M 28 118 Q 35 76 60 68 Q 85 76 92 118 Z" fill="#4c1d95"/>
      <path d="M 36 118 Q 42 80 60 72 Q 78 80 84 118 Z" fill="#5b21b6"/>
      <circle cx="60" cy="52" r="22" fill="#f5cba7"/>
      <ellipse cx="38" cy="52" rx="4" ry="6" fill="#f5cba7"/>
      <ellipse cx="82" cy="52" rx="4" ry="6" fill="#f5cba7"/>
      <ellipse cx="53" cy="50" rx="4" ry="4.5" fill="white"/>
      <ellipse cx="67" cy="50" rx="4" ry="4.5" fill="white"/>
      <circle cx="54" cy="51" r="2.5" fill="#4c1d95"/>
      <circle cx="68" cy="51" r="2.5" fill="#4c1d95"/>
      <circle cx="55.5" cy="49.5" r="1" fill="white"/>
      <circle cx="69.5" cy="49.5" r="1" fill="white"/>
      <path d="M 49 44 Q 53 41 57 44" fill="none" stroke="#5d4037" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M 63 44 Q 67 41 71 44" fill="none" stroke="#5d4037" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M 54 59 Q 60 65 66 59" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round"/>
      <path d="M 36 42 Q 60 4 84 42 Z" fill="#3b0764"/>
      <path d="M 32 42 Q 60 38 88 42 L 84 47 Q 60 44 36 47 Z" fill="#6d28d9"/>
      <polygon points="60,10 62,17 69,17 64,21 66,28 60,24 54,28 56,21 51,17 58,17" fill="#fbbf24"/>
      {mid && <><line x1="84" y1="110" x2="96" y2="48" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round"/><circle cx="97" cy="44" r="8" fill="#a78bfa" opacity="0.9"/><circle cx="97" cy="44" r="5" fill="#e9d5ff"/></>}
      {aura && <circle cx="97" cy="44" r="12" fill="none" stroke="#c4b5fd" strokeWidth="1.5" strokeDasharray="3 2"/>}
    </>}

    {/* WARRIOR */}
    {rpgClass==="WARRIOR" && <>
      <path d="M 22 118 Q 32 72 60 64 Q 88 72 98 118 Z" fill="#374151"/>
      <path d="M 30 118 Q 38 76 60 68 Q 82 76 90 118 Z" fill="#dc2626"/>
      <ellipse cx="28" cy="72" rx="12" ry="8" fill="#4b5563" transform="rotate(-10 28 72)"/>
      <ellipse cx="92" cy="72" rx="12" ry="8" fill="#4b5563" transform="rotate(10 92 72)"/>
      <path d="M 50 85 L 60 76 L 70 85 L 60 90 Z" fill="#fbbf24" opacity="0.9"/>
      <circle cx="60" cy="50" r="22" fill="#f5cba7"/>
      <ellipse cx="38" cy="50" rx="4" ry="6" fill="#f5cba7"/>
      <ellipse cx="82" cy="50" rx="4" ry="6" fill="#f5cba7"/>
      <ellipse cx="53" cy="48" rx="4" ry="4.5" fill="white"/>
      <ellipse cx="67" cy="48" rx="4" ry="4.5" fill="white"/>
      <circle cx="54" cy="49" r="2.5" fill="#1c1917"/>
      <circle cx="68" cy="49" r="2.5" fill="#1c1917"/>
      <circle cx="55.5" cy="47.5" r="1" fill="white"/>
      <circle cx="69.5" cy="47.5" r="1" fill="white"/>
      <path d="M 49 42 Q 53 39 57 42" fill="none" stroke="#5d4037" strokeWidth="2" strokeLinecap="round"/>
      <path d="M 63 42 Q 67 39 71 42" fill="none" stroke="#5d4037" strokeWidth="2" strokeLinecap="round"/>
      <path d="M 53 57 Q 60 63 67 57" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round"/>
      <path d="M 38 44 Q 60 24 82 44 L 78 36 Q 60 20 42 36 Z" fill="#374151"/>
      <rect x="46" y="38" width="28" height="8" rx="2" fill="#1f2937"/>
      {mid && <path d="M 60 26 Q 68 6 78 14 Q 70 20 60 26" fill="#dc2626"/>}
      {aura && <><path d="M 38 30 Q 24 14 34 22 Q 28 30 38 30" fill="#fbbf24"/><path d="M 82 30 Q 96 14 86 22 Q 92 30 82 30" fill="#fbbf24"/></>}
      <line x1="88" y1="108" x2="106" y2="52" stroke="#9ca3af" strokeWidth={aura?6:mid?5:4} strokeLinecap="round"/>
      <line x1="84" y1="100" x2="94" y2="103" stroke="#4b5563" strokeWidth="7" strokeLinecap="round"/>
      {aura && <line x1="88" y1="108" x2="106" y2="52" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>}
    </>}

    {/* RANGER */}
    {rpgClass==="RANGER" && <>
      <path d="M 26 118 Q 34 74 60 66 Q 86 74 94 118 Z" fill="#1a4731"/>
      <path d="M 34 118 Q 40 78 60 70 Q 80 78 86 118 Z" fill="#15803d"/>
      <rect x="38" y="82" width="44" height="6" rx="3" fill="#92400e"/>
      <rect x="84" y="68" width="8" height="26" rx="2" fill="#78350f"/>
      <circle cx="60" cy="50" r="21" fill="#d4a574"/>
      <ellipse cx="39" cy="50" rx="4" ry="6" fill="#d4a574"/>
      <ellipse cx="81" cy="50" rx="4" ry="6" fill="#d4a574"/>
      <path d="M 36 50 Q 60 22 84 50 Q 78 58 60 58 Q 42 58 36 50 Z" fill="#166534" opacity="0.95"/>
      <ellipse cx="53" cy="48" rx="3.5" ry="4" fill="white"/>
      <ellipse cx="67" cy="48" rx="3.5" ry="4" fill="white"/>
      <circle cx="54" cy="49" r="2.2" fill="#15803d"/>
      <circle cx="68" cy="49" r="2.2" fill="#15803d"/>
      <circle cx="55" cy="48" r="0.9" fill="white"/>
      <circle cx="69" cy="48" r="0.9" fill="white"/>
      <path d="M 49 42 Q 53 39 57 42" fill="none" stroke="#5d4037" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M 63 42 Q 67 39 71 42" fill="none" stroke="#5d4037" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M 54 57 Q 60 62 66 57" fill="none" stroke="#7c4010" strokeWidth="2" strokeLinecap="round"/>
      {mid && <path d="M 74 30 Q 84 10 78 22 Q 76 24 74 30" fill="#d1fae5"/>}
      <path d="M 22 96 Q 14 60 22 24" fill="none" stroke="#92400e" strokeWidth="4" strokeLinecap="round"/>
      <line x1="22" y1="24" x2="22" y2="96" stroke="#d1fae5" strokeWidth="1"/>
      {aura && <circle cx="22" cy="60" r="6" fill="#39db80" opacity="0.5"/>}
    </>}

    {/* NECROMANCER */}
    {rpgClass==="NECROMANCER" && <>
      <path d="M 24 118 Q 30 72 60 62 Q 90 72 96 118 Z" fill="#1e1b2e"/>
      <path d="M 32 118 Q 37 76 60 67 Q 83 76 88 118 Z" fill="#2e1065"/>
      <path d="M 32 118 Q 37 76 60 67" fill="none" stroke="#7c3aed" strokeWidth="1.5" opacity="0.8"/>
      <path d="M 88 118 Q 83 76 60 67" fill="none" stroke="#7c3aed" strokeWidth="1.5" opacity="0.8"/>
      <circle cx="60" cy="50" r="21" fill="#d4a574"/>
      <ellipse cx="39" cy="50" rx="4" ry="5.5" fill="#d4a574"/>
      <ellipse cx="81" cy="50" rx="4" ry="5.5" fill="#d4a574"/>
      <path d="M 46 64 Q 48 80 60 86 Q 72 80 74 64" fill="#e2e8f0" opacity="0.9"/>
      <path d="M 38 44 Q 60 20 82 44 Q 76 52 60 54 Q 44 52 38 44 Z" fill="#1e1b2e" opacity="0.9"/>
      <ellipse cx="53" cy="47" rx="4" ry="4.5" fill="#1e1b2e"/>
      <ellipse cx="67" cy="47" rx="4" ry="4.5" fill="#1e1b2e"/>
      <circle cx="53" cy="47" r="2.5" fill="#7c3aed"/>
      <circle cx="67" cy="47" r="2.5" fill="#7c3aed"/>
      <circle cx="54" cy="46" r="1" fill="#c4b5fd"/>
      <circle cx="68" cy="46" r="1" fill="#c4b5fd"/>
      <line x1="84" y1="110" x2="94" y2="44" stroke="#4a4060" strokeWidth="5" strokeLinecap="round"/>
      <ellipse cx="94" cy="36" rx="8" ry="9" fill="#e2e8f0"/>
      <ellipse cx="94" cy="40" rx="6" ry="4" fill="#cbd5e0"/>
      <circle cx="91" cy="34" r="2.5" fill="#1e1b2e"/>
      <circle cx="97" cy="34" r="2.5" fill="#1e1b2e"/>
      {mid && <><circle cx="91" cy="34" r="1.5" fill="#7c3aed"/><circle cx="97" cy="34" r="1.5" fill="#7c3aed"/><circle cx="94" cy="24" r="6" fill="#7c3aed" opacity="0.9"/><circle cx="94" cy="24" r="4" fill="#c4b5fd" opacity="0.8"/></>}
      {aura && <><circle cx="94" cy="24" r="10" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3 2"/><ellipse cx="20" cy="42" rx="6" ry="8" fill="#7c3aed" opacity="0.4"/></>}
    </>}

    {/* QUEEN */}
    {rpgClass==="QUEEN" && <>
      <path d="M 20 118 Q 32 68 60 60 Q 88 68 100 118 Z" fill="#581c87"/>
      <path d="M 28 118 Q 38 72 60 64 Q 82 72 92 118 Z" fill="#7e22ce"/>
      <path d="M 36 80 Q 60 76 84 80 L 82 86 Q 60 82 38 86 Z" fill="#ffd700"/>
      <path d="M 38 52 Q 30 70 36 88" stroke="#1c1917" strokeWidth="7" fill="none" strokeLinecap="round"/>
      <path d="M 82 52 Q 90 70 84 88" stroke="#1c1917" strokeWidth="7" fill="none" strokeLinecap="round"/>
      <circle cx="60" cy="48" r="22" fill="#fde8d0"/>
      <ellipse cx="38" cy="48" rx="4" ry="6" fill="#fde8d0"/>
      <ellipse cx="82" cy="48" rx="4" ry="6" fill="#fde8d0"/>
      <ellipse cx="53" cy="46" rx="4" ry="4.5" fill="white"/>
      <ellipse cx="67" cy="46" rx="4" ry="4.5" fill="white"/>
      <circle cx="54" cy="47" r="2.5" fill="#581c87"/>
      <circle cx="68" cy="47" r="2.5" fill="#581c87"/>
      <circle cx="55" cy="45.5" r="1" fill="white"/>
      <circle cx="69" cy="45.5" r="1" fill="white"/>
      <path d="M 54 56 Q 60 61 66 56" fill="none" stroke="#be185d" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="46" cy="52" r="4" fill="#fca5a5" opacity="0.5"/>
      <circle cx="74" cy="52" r="4" fill="#fca5a5" opacity="0.5"/>
      <rect x="40" y="28" width="40" height="10" rx="1" fill="#ffd700"/>
      <polygon points="40,28 43,16 47,28" fill="#ffd700"/>
      <polygon points="55,28 58,13 61,13 64,28" fill="#ffd700"/>
      <polygon points="73,28 77,16 80,28" fill="#ffd700"/>
      <circle cx="43.5" cy="22" r="2.5" fill="#dc2626"/>
      <circle cx="59.5" cy="18" r="3" fill="#dc2626"/>
      <circle cx="76.5" cy="22" r="2.5" fill="#2563eb"/>
      {mid && <><line x1="86" y1="106" x2="98" y2="54" stroke="#ffd700" strokeWidth="3.5" strokeLinecap="round"/><circle cx="99" cy="50" r="6" fill="#dc2626"/><circle cx="99" cy="50" r="9" fill="none" stroke="#ffd700" strokeWidth="2"/></>}
      {aura && <><path d="M 22 62 Q 6 44 18 54 Q 10 62 22 62" fill="#e9d5ff" opacity="0.8"/><path d="M 98 62 Q 114 44 102 54 Q 110 62 98 62" fill="#e9d5ff" opacity="0.8"/></>}
    </>}

    {/* SCHOLAR */}
    {rpgClass==="SCHOLAR" && <>
      <ellipse cx="42" cy="104" rx="16" ry="8" fill="#1e3a5f"/>
      <ellipse cx="78" cy="104" rx="16" ry="8" fill="#1e3a5f"/>
      <path d="M 30 90 Q 36 68 60 62 Q 84 68 90 90 L 90 104 Q 60 100 30 104 Z" fill="#1e3a5f"/>
      <path d="M 26 92 Q 60 84 94 92 L 94 104 Q 60 96 26 104 Z" fill="#fef3c7"/>
      <line x1="60" y1="84" x2="60" y2="104" stroke="#92400e" strokeWidth="2"/>
      <line x1="30" y1="90" x2="58" y2="87" stroke="#92400e" strokeWidth="0.8" opacity="0.6"/>
      <line x1="30" y1="94" x2="58" y2="91" stroke="#92400e" strokeWidth="0.8" opacity="0.6"/>
      <line x1="62" y1="87" x2="90" y2="90" stroke="#92400e" strokeWidth="0.8" opacity="0.6"/>
      <line x1="62" y1="91" x2="90" y2="94" stroke="#92400e" strokeWidth="0.8" opacity="0.6"/>
      <circle cx="60" cy="48" r="21" fill="#f5d0a9"/>
      <ellipse cx="39" cy="48" rx="4" ry="5.5" fill="#f5d0a9"/>
      <ellipse cx="81" cy="48" rx="4" ry="5.5" fill="#f5d0a9"/>
      <path d="M 44 64 Q 46 76 60 80 Q 74 76 76 64" fill="#f1f5f9" opacity="0.9"/>
      <path d="M 38 44 Q 40 30 60 28 Q 80 30 82 44" fill="#f1f5f9"/>
      <circle cx="52" cy="48" r="7" fill="none" stroke="#92400e" strokeWidth="2.5"/>
      <circle cx="68" cy="48" r="7" fill="none" stroke="#92400e" strokeWidth="2.5"/>
      <circle cx="52" cy="48" r="6" fill="#bfdbfe" opacity="0.3"/>
      <circle cx="68" cy="48" r="6" fill="#bfdbfe" opacity="0.3"/>
      <line x1="59" y1="48" x2="61" y2="48" stroke="#92400e" strokeWidth="2"/>
      <line x1="45" y1="46" x2="42" y2="44" stroke="#92400e" strokeWidth="2"/>
      <line x1="75" y1="46" x2="78" y2="44" stroke="#92400e" strokeWidth="2"/>
      <circle cx="52" cy="49" r="2" fill="#1e3a5f"/>
      <circle cx="68" cy="49" r="2" fill="#1e3a5f"/>
      <path d="M 55 57 Q 60 62 65 57" fill="none" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round"/>
      {mid && <><circle cx="16" cy="44" r="7" fill="#2563eb" opacity="0.8"/><circle cx="104" cy="38" r="6" fill="#f59e0b" opacity="0.8"/></>}
      {aura && <circle cx="10" cy="62" r="5" fill="#10b981" opacity="0.7"/>}
    </>}

    {/* SMITH */}
    {rpgClass==="SMITH" && <>
      <path d="M 22 118 Q 30 70 60 62 Q 90 70 98 118 Z" fill="#e5e7eb"/>
      <path d="M 30 118 Q 36 74 60 66 Q 84 74 90 118 Z" fill="#92400e"/>
      <line x1="60" y1="66" x2="46" y2="82" stroke="#78350f" strokeWidth="3"/>
      <line x1="60" y1="66" x2="74" y2="82" stroke="#78350f" strokeWidth="3"/>
      <circle cx="60" cy="92" r="8" fill="#6b7280"/>
      <circle cx="60" cy="92" r="5" fill="#d1d5db"/>
      <circle cx="60" cy="92" r="2" fill="#374151"/>
      <ellipse cx="28" cy="72" rx="10" ry="8" fill="#d97706" transform="rotate(-15 28 72)"/>
      <ellipse cx="92" cy="72" rx="10" ry="8" fill="#d97706" transform="rotate(15 92 72)"/>
      <circle cx="60" cy="48" r="23" fill="#c08040"/>
      <ellipse cx="37" cy="50" rx="5" ry="7" fill="#c08040"/>
      <ellipse cx="83" cy="50" rx="5" ry="7" fill="#c08040"/>
      <path d="M 42 66 Q 44 88 60 94 Q 76 88 78 66" fill="#d97706"/>
      <path d="M 48 66 Q 50 82 60 88 Q 70 82 72 66" fill="#f59e0b" opacity="0.6"/>
      <path d="M 36 42 Q 60 36 84 42 L 80 48 Q 60 42 40 48 Z" fill="#dc2626"/>
      <ellipse cx="52" cy="50" rx="4" ry="4.5" fill="white"/>
      <ellipse cx="68" cy="50" rx="4" ry="4.5" fill="white"/>
      <circle cx="53" cy="51" r="2.5" fill="#1c0a00"/>
      <circle cx="69" cy="51" r="2.5" fill="#1c0a00"/>
      <circle cx="54" cy="49.5" r="1" fill="white"/>
      <circle cx="70" cy="49.5" r="1" fill="white"/>
      <path d="M 48 44 Q 52 41 56 44" fill="none" stroke="#5d4037" strokeWidth="2"/>
      <path d="M 64 44 Q 68 41 72 44" fill="none" stroke="#5d4037" strokeWidth="2"/>
      <path d="M 52 59 Q 60 64 68 59" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
      <line x1="84" y1="106" x2="98" y2="58" stroke="#78350f" strokeWidth="5" strokeLinecap="round"/>
      <rect x="90" y="50" width="16" height="12" rx="2" fill="#374151"/>
      {mid && <><circle cx="108" cy="50" r="3" fill="#fbbf24" opacity="0.9"/><circle cx="104" cy="44" r="2" fill="#f97316" opacity="0.9"/></>}
      {aura && <path d="M 106 46 L 102 54 L 108 54 L 104 62" stroke="#ffd700" strokeWidth="2.5" fill="none" strokeLinecap="round"/>}
    </>}

    {/* PYROMANCER */}
    {rpgClass==="PYROMANCER" && <>
      <path d="M 24 118 Q 30 68 60 60 Q 90 68 96 118 Z" fill="#1c1917"/>
      <path d="M 24 118 Q 30 68 60 60" fill="none" stroke="#dc2626" strokeWidth="2.5"/>
      <path d="M 96 118 Q 90 68 60 60" fill="none" stroke="#dc2626" strokeWidth="2.5"/>
      <ellipse cx="22" cy="78" rx="10" ry="13" fill="#ff7c43" opacity="0.85"/>
      <ellipse cx="22" cy="72" rx="7" ry="10" fill="#fbbf24" opacity="0.9"/>
      <ellipse cx="22" cy="67" rx="4" ry="7" fill="#fff7ed" opacity="0.95"/>
      {mid && <><ellipse cx="98" cy="78" rx="10" ry="13" fill="#ff7c43" opacity="0.85"/><ellipse cx="98" cy="72" rx="7" ry="10" fill="#fbbf24" opacity="0.9"/><ellipse cx="98" cy="67" rx="4" ry="7" fill="#fff7ed" opacity="0.95"/></>}
      <circle cx="60" cy="48" r="22" fill="#fcd5b0"/>
      <ellipse cx="38" cy="48" rx="4" ry="6" fill="#fcd5b0"/>
      <ellipse cx="82" cy="48" rx="4" ry="6" fill="#fcd5b0"/>
      <path d="M 38 46 Q 36 28 48 22 Q 60 18 72 22 Q 84 28 82 46" fill="#dc2626"/>
      <path d="M 38 46 Q 40 32 60 30 Q 80 32 82 46" fill="#b91c1c" opacity="0.5"/>
      <ellipse cx="53" cy="46" rx="4" ry="4.5" fill="white"/>
      <ellipse cx="67" cy="46" rx="4" ry="4.5" fill="white"/>
      <circle cx="54" cy="47" r="2.5" fill="#7c1d13"/>
      <circle cx="68" cy="47" r="2.5" fill="#7c1d13"/>
      <circle cx="55" cy="45.5" r="1" fill="white"/>
      <circle cx="69" cy="45.5" r="1" fill="white"/>
      <path d="M 49 40 Q 53 37 57 40" fill="none" stroke="#7c1d13" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M 63 40 Q 67 37 71 40" fill="none" stroke="#7c1d13" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M 53 56 Q 60 61 67 56" fill="none" stroke="#7c1d13" strokeWidth="2" strokeLinecap="round"/>
      {aura && <><path d="M 44 30 Q 46 18 50 24 Q 54 12 60 20 Q 66 12 70 24 Q 74 18 76 30" fill="#ff9f43" opacity="0.9"/><ellipse cx="14" cy="70" rx="12" ry="18" fill="#ff7c43" opacity="0.5"/><ellipse cx="106" cy="70" rx="12" ry="18" fill="#ff7c43" opacity="0.5"/></>}
    </>}

    {/* PIRATE */}
    {rpgClass==="PIRATE" && <>
      <path d="M 26 118 Q 32 70 60 62 Q 88 70 94 118 Z" fill="#7c2d12"/>
      <path d="M 34 118 Q 38 74 60 66 Q 82 74 86 118 Z" fill="#9a3412"/>
      <rect x="36" y="84" width="48" height="7" rx="3" fill="#92400e"/>
      <rect x="54" y="83" width="12" height="9" rx="2" fill="#fbd38d"/>
      <circle cx="60" cy="48" r="22" fill="#d4956a"/>
      <ellipse cx="38" cy="48" rx="4.5" ry="6" fill="#d4956a"/>
      <ellipse cx="82" cy="48" rx="4.5" ry="6" fill="#d4956a"/>
      <path d="M 44 64 Q 46 78 60 84 Q 74 78 76 64" fill="#78350f"/>
      <path d="M 30 44 Q 60 34 90 44 L 86 50 Q 60 40 34 50 Z" fill="#1c1917"/>
      <rect x="36" y="30" width="48" height="16" rx="2" fill="#1c1917"/>
      <path d="M 30 36 Q 18 26 28 34 Q 22 40 30 42" fill="#1c1917"/>
      <path d="M 90 36 Q 102 26 92 34 Q 98 40 90 42" fill="#1c1917"/>
      {mid && <><ellipse cx="60" cy="36" rx="7" ry="8" fill="#e2e8f0"/><circle cx="57" cy="34" r="2" fill="#1c1917"/><circle cx="63" cy="34" r="2" fill="#1c1917"/></>}
      <path d="M 39 46 Q 44 42 49 46" fill="none" stroke="#1c1917" strokeWidth="3" strokeLinecap="round"/>
      <ellipse cx="44" cy="47" rx="5" ry="4" fill="#1c1917" opacity="0.8"/>
      <ellipse cx="67" cy="46" rx="4" ry="4.5" fill="white"/>
      <circle cx="68" cy="47" r="2.5" fill="#78350f"/>
      <circle cx="69" cy="45.5" r="1" fill="white"/>
      <path d="M 56 57 Q 60 62 64 57" fill="none" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round"/>
      <line x1="86" y1="106" x2="104" y2="58" stroke="#9ca3af" strokeWidth={aura?5:4} strokeLinecap="round"/>
      <path d="M 104 58 Q 110 52 108 46" fill="none" stroke="#6b7280" strokeWidth="3" strokeLinecap="round"/>
      <line x1="82" y1="100" x2="92" y2="104" stroke="#78350f" strokeWidth="7" strokeLinecap="round"/>
      {aura && <><line x1="86" y1="106" x2="104" y2="58" stroke="#fbd38d" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/><ellipse cx="26" cy="62" rx="7" ry="9" fill="#dc2626"/><ellipse cx="26" cy="58" rx="5" ry="6" fill="#16a34a"/><circle cx="26" cy="56" r="3" fill="#fbbf24"/></>}
    </>}

    {/* JESTER */}
    {rpgClass==="JESTER" && <>
      <path d="M 22 118 Q 30 66 60 58 Q 90 66 98 118 Z" fill="#dc2626"/>
      <path d="M 22 118 L 60 72 L 60 118 Z" fill="#f6e05e" opacity="0.7"/>
      <path d="M 44 60 L 60 72 L 76 60 L 60 52 Z" fill="#f6e05e"/>
      <path d="M 44 60 L 60 72 L 60 52 Z" fill="#dc2626" opacity="0.6"/>
      <circle cx="60" cy="46" r="22" fill="#fde8c8"/>
      <ellipse cx="38" cy="46" rx="4" ry="6" fill="#fde8c8"/>
      <ellipse cx="82" cy="46" rx="4" ry="6" fill="#fde8c8"/>
      <path d="M 46 58 Q 60 70 74 58" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="48" cy="56" r="2" fill="#dc2626" opacity="0.6"/>
      <circle cx="72" cy="56" r="2" fill="#dc2626" opacity="0.6"/>
      <ellipse cx="52" cy="44" rx="5" ry="5.5" fill="white"/>
      <ellipse cx="68" cy="44" rx="5" ry="5.5" fill="white"/>
      <circle cx="53" cy="45" r="3" fill="#dc2626"/>
      <circle cx="69" cy="45" r="3" fill="#16a34a"/>
      <circle cx="54.5" cy="43.5" r="1.2" fill="white"/>
      <circle cx="70.5" cy="43.5" r="1.2" fill="white"/>
      <path d="M 47 37 Q 52 33 57 37" fill="none" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round"/>
      <path d="M 63 37 Q 68 33 73 37" fill="none" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round"/>
      <path d="M 38 38 Q 40 24 50 20 Q 42 32 38 38" fill="#dc2626"/>
      <path d="M 82 38 Q 80 24 70 20 Q 78 32 82 38" fill="#f6e05e"/>
      <path d="M 38 38 Q 60 28 82 38 Q 60 34 38 38 Z" fill="#dc2626"/>
      <circle cx="50" cy="18" r="6" fill="#f6e05e"/>
      <circle cx="70" cy="18" r="6" fill="#dc2626"/>
      <circle cx="60" cy="14" r="5" fill="#16a34a"/>
      {mid && <><circle cx="16" cy="56" r="9" fill="#f6e05e"/><circle cx="104" cy="56" r="9" fill="#dc2626"/></>}
      {aura && <><circle cx="12" cy="36" r="7" fill="#10b981"/><circle cx="108" cy="36" r="7" fill="#7c3aed"/><circle cx="20" cy="20" r="6" fill="#2563eb"/><path d="M 20 20 Q 60 8 108 36" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 2" opacity="0.5"/></>}
    </>}

    {/* CHAMPION */}
    {rpgClass==="CHAMPION" && <>
      {aura && <>{[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>{const r=a*Math.PI/180;return <line key={i} x1={60+46*Math.cos(r)} y1={60+46*Math.sin(r)} x2={60+58*Math.cos(r)} y2={60+58*Math.sin(r)} stroke="#ffd700" strokeWidth="2" opacity="0.5"/>;})}</>}
      <path d="M 18 118 Q 28 66 60 58 Q 92 66 102 118 Z" fill="#e5e7eb"/>
      <path d="M 24 118 Q 32 70 60 62 Q 88 70 96 118 Z" fill="#c6a94b" opacity="0.9"/>
      <path d="M 42 80 L 60 70 L 78 80 L 78 98 L 60 104 L 42 98 Z" fill="#ffd700" opacity="0.6"/>
      <ellipse cx="26" cy="74" rx="14" ry="10" fill="#9ca3af" transform="rotate(-15 26 74)"/>
      <ellipse cx="94" cy="74" rx="14" ry="10" fill="#9ca3af" transform="rotate(15 94 74)"/>
      <ellipse cx="24" cy="72" rx="11" ry="8" fill="#c6a94b" opacity="0.8" transform="rotate(-15 24 72)"/>
      <ellipse cx="96" cy="72" rx="11" ry="8" fill="#c6a94b" opacity="0.8" transform="rotate(15 96 72)"/>
      <ellipse cx="22" cy="84" rx="8" ry="6" fill="#d4956a" transform="rotate(-10 22 84)"/>
      <ellipse cx="98" cy="84" rx="8" ry="6" fill="#d4956a" transform="rotate(10 98 84)"/>
      <circle cx="60" cy="44" r="24" fill="#d4956a"/>
      <ellipse cx="36" cy="46" rx="5" ry="7" fill="#d4956a"/>
      <ellipse cx="84" cy="46" rx="5" ry="7" fill="#d4956a"/>
      <ellipse cx="52" cy="36" rx="7" ry="4" fill="#ffffff" opacity="0.2" transform="rotate(-20 52 36)"/>
      <ellipse cx="52" cy="44" rx="4.5" ry="5" fill="white"/>
      <ellipse cx="68" cy="44" rx="4.5" ry="5" fill="white"/>
      <circle cx="53" cy="45" r="3" fill="#1c1917"/>
      <circle cx="69" cy="45" r="3" fill="#1c1917"/>
      <circle cx="54.5" cy="43.5" r="1.2" fill="white"/>
      <circle cx="70.5" cy="43.5" r="1.2" fill="white"/>
      <path d="M 47 37 Q 53 33 57 36" fill="none" stroke="#5d4037" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M 63 36 Q 67 33 73 37" fill="none" stroke="#5d4037" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M 52 54 Q 60 60 68 54" fill="none" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M 42 62 Q 60 70 78 62" fill="none" stroke="#c6a94b" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="60" cy="70" r="5" fill="#dc2626"/>
      <circle cx="60" cy="70" r="3" fill="#fbbf24"/>
      {mid && <><path d="M 34 40 Q 22 26 32 34 Q 24 42 34 40" fill="#16a34a"/><path d="M 86 40 Q 98 26 88 34 Q 96 42 86 40" fill="#16a34a"/><path d="M 30 52 Q 16 38 28 46 Q 20 54 30 52" fill="#16a34a"/><path d="M 90 52 Q 104 38 92 46 Q 100 54 90 52" fill="#16a34a"/></>}
      {aura && <><path d="M 38 30 L 40 16 L 48 24 L 60 12 L 72 24 L 80 16 L 82 30 Z" fill="#ffd700"/><circle cx="60" cy="16" r="4" fill="#dc2626"/><circle cx="41" cy="22" r="2.5" fill="#2563eb"/><circle cx="79" cy="22" r="2.5" fill="#16a34a"/></>}
    </>}
  </svg>);
};
