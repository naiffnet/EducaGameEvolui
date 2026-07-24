import React, { useState } from 'react';
import type { RpgClass } from '../types';
import { RpgAvatar } from './RpgAvatar';
import { Sparkles, Trophy } from 'lucide-react';

interface CharacterCreatorProps {
  onSelectClass: (selectedClass: RpgClass) => void;
}

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({ onSelectClass }) => {
  const [chosenClass, setChosenClass] = useState<RpgClass>('MAGE');

  const classesConfig = [
    { id: 'MAGE' as RpgClass, name: 'Arcano', specialty: 'Mago das Estrelas', desc: 'Nascido sob uma constelacao rara, o Arcano domina as leis ocultas do cosmos. Seus feiticos reescrevem a realidade e sua sabedoria e temida pelos mais antigos dragoes.', strength: 8, intelligence: 30, dexterity: 14, color: '#7d62ff', bgGlow: 'rgba(125,98,255,0.15)', initialSkill: 'Projetil Arcano' },
    { id: 'WARRIOR' as RpgClass, name: 'Guerreiro', specialty: 'Cavaleiro da Chama', desc: 'Forjado nas guerras dos Tres Reinos, o Guerreiro e o escudo dos inocentes. Sua armadura carrega as cicatrizes de mil batalhas e seu espirito nunca quebrou.', strength: 30, intelligence: 10, dexterity: 16, color: '#ff7253', bgGlow: 'rgba(255,114,83,0.15)', initialSkill: 'Golpe Flamejante' },
    { id: 'RANGER' as RpgClass, name: 'Cacador', specialty: 'Guardiao das Matas', desc: 'Criado pelos elfos da Floresta Eterea, o Cacador conhece cada trilha do mundo selvagem. Sua flecha nunca erra quando o coracao e puro.', strength: 12, intelligence: 16, dexterity: 28, color: '#39db80', bgGlow: 'rgba(57,219,128,0.15)', initialSkill: 'Tiro Certeiro' },
    { id: 'NECROMANCER' as RpgClass, name: 'Nigromante', specialty: 'Senhor das Sombras', desc: 'Cruzou o veu entre os vivos e os mortos e voltou diferente. O Nigromante controla exercitos de espiritos e conhece segredos que o tempo apagou.', strength: 10, intelligence: 28, dexterity: 14, color: '#b794f4', bgGlow: 'rgba(183,148,244,0.15)', initialSkill: 'Invocar Espectro' },
    { id: 'QUEEN' as RpgClass, name: 'Soberana', specialty: 'Rainha Encantada', desc: 'Governante de um reino alem do horizonte, a Soberana une magia e politica em sua coroa. Sua presenca inspira exercitos e sua palavra move montanhas.', strength: 16, intelligence: 22, dexterity: 20, color: '#ffd700', bgGlow: 'rgba(255,215,0,0.15)', initialSkill: 'Aura Real' },
    { id: 'SCHOLAR' as RpgClass, name: 'Erudito', specialty: 'Guardiao do Saber', desc: 'Passou decadas nos labirintos da Grande Biblioteca do Fim do Mundo. O Erudito conhece linguas mortas e formulas alquimicas de eras passadas.', strength: 6, intelligence: 32, dexterity: 12, color: '#63b3ed', bgGlow: 'rgba(99,179,237,0.15)', initialSkill: 'Leitura Arcana' },
    { id: 'SMITH' as RpgClass, name: 'Ferreiro Runico', specialty: 'Mestre das Forjas', desc: 'Descendente dos anoes que forjaram a espada lendaria Valdris. O Ferreiro Runico inscreve poder nos metais e suas criacoes sao procuradas por reis de todo o continente.', strength: 26, intelligence: 14, dexterity: 20, color: '#f6ad55', bgGlow: 'rgba(246,173,85,0.15)', initialSkill: 'Forja Trovejante' },
    { id: 'PYROMANCER' as RpgClass, name: 'Flamejante', specialty: 'Feiticeira do Fogo', desc: 'Tocada pelo espirito de um dragao anciao, a Flamejante carrega o fogo eterno em suas veias. Onde ela passa, os inimigos recuam com medo das chamas.', strength: 20, intelligence: 20, dexterity: 12, color: '#ff9f43', bgGlow: 'rgba(255,159,67,0.15)', initialSkill: 'Bola de Fogo' },
    { id: 'PIRATE' as RpgClass, name: 'Corsario', specialty: 'Senhor dos Mares', desc: 'Navegou por sete mares em busca de tesouros e aventuras. O Corsario conhece rotas secretas e fala a lingua de criaturas marinhas.', strength: 22, intelligence: 14, dexterity: 24, color: '#fbd38d', bgGlow: 'rgba(251,211,141,0.15)', initialSkill: 'Golpe do Cutlass' },
    { id: 'JESTER' as RpgClass, name: 'Bufao', specialty: 'Mestre da Ilusao', desc: 'Mais perigoso do que parece, o Bufao usa humor para despistar inimigos. Por tras da mascara vive um mestre de ilusionismo capaz de fazer exercitos duvidarem dos proprios olhos.', strength: 8, intelligence: 22, dexterity: 30, color: '#f6e05e', bgGlow: 'rgba(246,224,94,0.15)', initialSkill: 'Ilusao Comica' },
    { id: 'CHAMPION' as RpgClass, name: 'Campeao', specialty: 'Heroi Lendario', desc: 'O escolhido pelas profecias antigas. O Campeao carrega o peso de um destino epico e a forca de mil guerreiros. Dizem que ate os deuses param para observar quando ele luta.', strength: 24, intelligence: 22, dexterity: 22, color: '#c6a94b', bgGlow: 'rgba(198,169,75,0.15)', initialSkill: 'Brado do Heroi' },
  ];

  const activeConfig = classesConfig.find(c => c.id === chosenClass)!;

  return (
    <div 
      style={{ 
        maxWidth: '850px', 
        margin: '0 auto', 
        textAlign: 'center', 
        padding: '30px 20px' 
      }}
      role="region"
      aria-label="Criador de Personagem RPG"
    >
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          Escolha seu Herói de Aprendizado! <Sparkles style={{ color: 'var(--accent)' }} />
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
          Toda jornada pedagógica é uma aventura. Escolha a classe que melhor se alinha com o seu estilo de estudo. Suas conquistas evoluirão seu herói!
        </p>
      </div>

      {/* Class Selector Grid */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
          gap: '12px', 
          marginBottom: '36px' 
        }}
      >
        {classesConfig.map((cls) => {
          const isSelected = chosenClass === cls.id;
          
          return (
            <div
              key={cls.id}
              className="card"
              style={{
                cursor: 'pointer',
                borderColor: isSelected ? cls.color : 'var(--border)',
                borderWidth: isSelected ? '3px' : '1px',
                backgroundColor: isSelected ? cls.bgGlow : 'var(--bg-secondary)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                transform: isSelected ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: isSelected ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                transition: 'all var(--transition-fast)'
              }}
              onClick={() => setChosenClass(cls.id)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setChosenClass(cls.id);
                }
              }}
            >
              <RpgAvatar rpgClass={cls.id} level={1} size={72} />
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: '800', color: isSelected ? cls.color : 'var(--text-primary)', lineHeight: 1.2, marginBottom: '2px' }}>
                  {cls.name}
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>
                  {cls.specialty}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Class Detailed Stats & Description Box */}
      <div 
        className="card" 
        style={{ 
          borderLeft: `6px solid ${activeConfig.color}`, 
          textAlign: 'left', 
          padding: '28px',
          marginBottom: '32px',
          backgroundColor: 'var(--bg-secondary)'
        }}
      >
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <RpgAvatar rpgClass={activeConfig.id} level={2} size={100} avatarStyle="EPIC_ADULT" />
          <div style={{ flex: 1, minWidth: '240px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: activeConfig.color, marginBottom: '4px' }}>
              {activeConfig.name}
            </h3>
            <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--text-tertiary)', marginBottom: '10px', textTransform: 'uppercase' }}>{activeConfig.specialty}</div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.6' }}>
              {activeConfig.desc}
            </p>

            {/* Stats Grid with animated bars */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Atributos Iniciais:</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                  {[
                    { label: 'Forca (Logica)', val: activeConfig.strength, c: '#ff7253' },
                    { label: 'Inteligencia', val: activeConfig.intelligence, c: '#7d62ff' },
                    { label: 'Destreza', val: activeConfig.dexterity, c: '#39db80' },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                        <strong style={{ color: s.c }}>{s.val}</strong>
                      </div>
                      <div style={{ height: '5px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)' }}>
                        <div style={{ width: `${Math.min(100,(s.val/32)*100)}%`, height: '100%', backgroundColor: s.c, borderRadius: 'var(--radius-full)', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: `1px solid ${activeConfig.color}40` }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Habilidade Inicial Desbloqueada:
                  </div>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Trophy size={16} style={{ color: activeConfig.color }} /> {activeConfig.initialSkill}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Launch Adventure Button */}
      <button
        className="btn btn-primary"
        style={{ 
          fontSize: '1.1rem', 
          padding: '12px 36px', 
          backgroundColor: activeConfig.color, 
          borderColor: activeConfig.color, 
          boxShadow: `0 8px 24px ${activeConfig.color}40`,
          color: '#ffffff'
        }}
        onClick={() => onSelectClass(chosenClass)}
      >
        Iniciar Aventura como {activeConfig.name}!
      </button>
    </div>
  );
};
