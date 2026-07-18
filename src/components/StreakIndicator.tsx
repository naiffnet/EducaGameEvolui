import React from 'react';
import { Flame } from 'lucide-react';
import type { DailyProgress } from '../types';

interface StreakIndicatorProps {
  dailyProgress: DailyProgress;
  size?: 'sm' | 'md' | 'lg';
}

export const StreakIndicator: React.FC<StreakIndicatorProps> = ({ dailyProgress, size = 'md' }) => {
  const isFire = dailyProgress.currentStreak >= 3;
  const isSuperFire = dailyProgress.currentStreak >= 7;

  const sizeMap = {
    sm: { icon: 16, fontSize: '0.75rem', padding: '4px 10px', gap: '4px' },
    md: { icon: 20, fontSize: '0.85rem', padding: '6px 14px', gap: '6px' },
    lg: { icon: 24, fontSize: '1rem', padding: '8px 18px', gap: '8px' },
  };

  const s = sizeMap[size];

  return (
    <div
      title={`Sequência de ${dailyProgress.currentStreak} dias consecutivos`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        padding: s.padding,
        borderRadius: 'var(--radius-full)',
        background: isSuperFire
          ? 'linear-gradient(135deg, #ff6b35, #ffd700)'
          : isFire
          ? 'linear-gradient(135deg, #ff9f43, #ffd700)'
          : 'var(--bg-tertiary)',
        border: `1px solid ${isSuperFire ? '#ff6b35' : isFire ? '#ff9f43' : 'var(--border)'}`,
        fontWeight: '800',
        fontSize: s.fontSize,
        color: isFire ? '#000' : 'var(--text-primary)',
        transition: 'all 0.3s ease',
        cursor: 'default',
      }}
    >
      <Flame
        size={s.icon}
        style={{
          color: isSuperFire ? '#dc2626' : isFire ? '#dc2626' : 'var(--accent)',
          filter: isSuperFire ? 'drop-shadow(0 0 4px rgba(220,38,38,0.5))' : 'none',
        }}
      />
      <span>{dailyProgress.currentStreak}d</span>
      {dailyProgress.longestStreak >= 3 && (
        <span style={{ opacity: 0.7, fontSize: `calc(${s.fontSize} - 0.1rem)` }}>
          (recorde: {dailyProgress.longestStreak}d)
        </span>
      )}
    </div>
  );
};
