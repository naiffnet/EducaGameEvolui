import React, { useEffect, useState } from 'react';
import type { RpgCharacter } from '../types';
import { Sparkles, Zap, ArrowUp, X, Star } from 'lucide-react';

interface LevelUpModalProps {
  character: RpgCharacter;
  statsGained: { strength: number; intelligence: number; dexterity: number };
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ character, statsGained, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    // Stagger animations
    setTimeout(() => setVisible(true), 100);
    setTimeout(() => setShowStats(true), 600);
  }, []);

  const classColorMap: Record<string, string> = {
    MAGE: '#7d62ff', WARRIOR: '#ff7253', RANGER: '#39db80',
    NECROMANCER: '#7c3aed', QUEEN: '#ffd700', SCHOLAR: '#63b3ed',
    SMITH: '#f6ad55', PYROMANCER: '#ff9f43', PIRATE: '#fbd38d',
    JESTER: '#f6e05e', CHAMPION: '#c6a94b',
  };

  const classColor = character.selectedClass ? classColorMap[character.selectedClass] || '#7d62ff' : '#7d62ff';

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: `2px solid ${classColor}`,
        borderRadius: 'var(--radius-lg)',
        padding: '40px',
        maxWidth: '480px',
        width: '90%',
        textAlign: 'center',
        position: 'relative',
        transform: visible ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(-10deg)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        boxShadow: `0 0 60px ${classColor}40, 0 20px 60px rgba(0,0,0,0.5)`,
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px', right: '12px',
            background: 'none', border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer', padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        {/* Level up animation */}
        <div style={{
          marginBottom: '20px',
          animation: visible ? 'none' : undefined,
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: `${classColor}20`,
            border: `3px solid ${classColor}`,
            animation: 'pulse-glow 1.5s ease-in-out infinite',
          }}>
            <Sparkles size={40} style={{ color: classColor }} />
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', fontWeight: '800', color: classColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          LEVEL UP!
        </div>

        <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
          Nível {character.level}
        </h2>

        <p style={{ color: 'var(--text-secondary)', margin: '0 0 24px 0', fontSize: '0.95rem' }}>
          Seu herói cresceu em poder e sabedoria!
        </p>

        {/* Stats gained */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '24px',
          opacity: showStats ? 1 : 0,
          transform: showStats ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s ease 0.6s',
        }}>
          {[
            { label: 'Força', value: statsGained.strength, color: '#ff7253', icon: <Zap size={16} /> },
            { label: 'Inteligência', value: statsGained.intelligence, color: '#7d62ff', icon: <Star size={16} /> },
            { label: 'Destreza', value: statsGained.dexterity, color: '#39db80', icon: <ArrowUp size={16} /> },
          ].map(stat => (
            <div key={stat.label} style={{
              padding: '16px 12px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${stat.color}30`,
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                {stat.icon} {stat.label}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: stat.color }}>
                +{stat.value}
              </div>
            </div>
          ))}
        </div>

        <button
          className="btn"
          style={{
            backgroundColor: classColor,
            color: '#ffffff',
            border: 'none',
            padding: '12px 36px',
            fontSize: '1rem',
            fontWeight: '800',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            boxShadow: `0 8px 24px ${classColor}40`,
          }}
          onClick={onClose}
        >
          Continuar Jornada!
        </button>
      </div>

      {/* Particle effects via inline style */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px ${classColor}40, 0 0 40px ${classColor}20; }
          50% { box-shadow: 0 0 30px ${classColor}60, 0 0 60px ${classColor}40; }
        }
      `}</style>
    </div>
  );
};
