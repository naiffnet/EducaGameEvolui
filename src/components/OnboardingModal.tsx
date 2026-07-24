import React, { useState } from 'react';
import type { RpgClass } from '../types';
import { RpgAvatar } from './RpgAvatar';
import { Trophy, Swords, Zap, ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface OnboardingModalProps {
  studentName: string;
  rpgClass: RpgClass | null;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ studentName, rpgClass, onClose }) => {
  const [step, setStep] = useState<number>(1);

  const totalSteps = 4;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #1e1b4b 0%, #0f172a 100%)',
        border: '1px solid rgba(139, 92, 246, 0.4)', borderRadius: 28,
        padding: '36px 32px', width: '100%', maxWidth: 520, color: '#fff',
        boxShadow: '0 25px 60px rgba(0,0,0,0.7)', position: 'relative', overflow: 'hidden'
      }}>
        {/* Step Indicator Pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, justifyContent: 'center' }}>
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              style={{
                height: 4, flex: 1, borderRadius: 2,
                background: idx + 1 <= step ? 'var(--primary, #8b5cf6)' : 'rgba(255,255,255,0.15)',
                transition: 'background 0.3s'
              }}
            />
          ))}
        </div>

        {/* STEP 1: Boas-vindas & Personagem */}
        {step === 1 && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: 16 }}>
              <RpgAvatar rpgClass={rpgClass} level={1} size={110} avatarStyle="EPIC_ADULT" />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: '#a78bfa', textTransform: 'uppercase', marginBottom: 6 }}>
              Fase de Integração · Blueprint §3.6
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 10px', color: '#fff' }}>
              Bem-vindo(a) à Jornada, {studentName}!
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: 0 }}>
              Você acabou de criar seu herói da classe <strong style={{ color: '#c4b5fd' }}>{rpgClass || 'Explorador'}</strong>. Nesta plataforma, cada aula concluída e exercício realizado garante pontos de experiência (XP) para evolução do seu personagem!
            </p>
          </div>
        )}

        {/* STEP 2: Como Ganhar XP & Subir de Nível */}
        {step === 2 && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(234, 179, 8, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#facc15', marginBottom: 16 }}>
              <Zap size={32} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 10px', color: '#fff' }}>
              Como Ganhar XP & Subir de Nível
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', textAlign: 'left', marginTop: 10 }}>
              <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18 }}>📺</span>
                <div style={{ fontSize: 13 }}><strong style={{ color: '#fff' }}>Assistir Aulas:</strong> Conclua vídeos e conteúdos de texto do catálogo.</div>
              </div>
              <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18 }}>✏️</span>
                <div style={{ fontSize: 13 }}><strong style={{ color: '#fff' }}>Exercícios:</strong> Passe em exercícios interativos de programação.</div>
              </div>
              <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18 }}>📅</span>
                <div style={{ fontSize: 13 }}><strong style={{ color: '#fff' }}>Frequência Diária:</strong> Mantenha sua sequência (streak) de estudo em dia.</div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Marcos & Conquistas */}
        {step === 3 && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', marginBottom: 16 }}>
              <Trophy size={32} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 10px', color: '#fff' }}>
              Marcos Pessoais & Heroicos
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 16 }}>
              Ao atingir feitos especiais na plataforma, você desbloqueará <strong style={{ color: '#e9d5ff' }}>Marcos</strong> que registram suas conquistas para sempre no seu perfil:
            </p>
            <div style={{ padding: 16, background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 14, textAlign: 'left', width: '100%', fontSize: 13, color: '#e9d5ff' }}>
              🎖️ <strong>Marcos Heroicos:</strong> Conquistas de destaque pedagógico validadas pelos professores concedem bônus especiais de atributos e XP!
            </div>
          </div>
        )}

        {/* STEP 4: Primeira Missão de Boas-Vindas */}
        {step === 4 && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', marginBottom: 16 }}>
              <Swords size={32} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 10px', color: '#fff' }}>
              Sua Primeira Missão Apoiada!
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 16 }}>
              Você recebeu uma <strong>Missão de Boas-Vindas</strong> no seu Quadro de Missões!
            </p>
            <div style={{ padding: 16, background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 14, textAlign: 'left', width: '100%', marginBottom: 10 }}>
              <div style={{ fontWeight: 800, color: '#93c5fd', fontSize: 14, marginBottom: 4 }}>
                🌟 Sua Primeira Missão de Boas-Vindas!
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                Assista à sua primeira aula no catálogo de cursos para inaugurar seu histórico de evolução e ganhar <strong>+100 XP</strong>!
              </div>
            </div>
          </div>
        )}

        {/* Modal Controls Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', fontSize: 13, fontWeight: 700,
                color: '#ffffff', background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: 'var(--radius-md, 12px)', cursor: 'pointer', transition: 'background 0.2s',
              }}
            >
              <ArrowLeft size={16} /> Voltar
            </button>
          ) : <div />}

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              className="btn btn-primary"
              style={{ padding: '8px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              Próximo <ArrowRight size={15} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="btn btn-primary"
              style={{ padding: '8px 24px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', border: 'none' }}
            >
              <Check size={16} /> Começar Minha Jornada!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
