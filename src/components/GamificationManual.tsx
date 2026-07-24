import React, { useState } from 'react';
import { 
  BookOpen, 
  Zap, 
  Award, 
  Swords, 
  Target, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  Crown, 
  Brain, 
  Trophy, 
  Clock, 
  Coins, 
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { type RpgClass } from '../types';

interface ClassGuideInfo {
  id: RpgClass;
  name: string;
  symbol: string;
  color: string;
  bgGlow: string;
  pedagogicalProfile: string;
  futureCareerPrep: string;
  baseStats: { strength: number; intelligence: number; dexterity: number };
  initialSkill: string;
  evolutionStrategy: string;
}

const CLASS_GUIDES: ClassGuideInfo[] = [
  {
    id: 'MAGE',
    name: 'Mago',
    symbol: '🔮',
    color: '#7d62ff',
    bgGlow: 'rgba(125,98,255,0.15)',
    pedagogicalProfile: 'Raciocínio Abstrato, Lógica Computacional e Arquitetura de Sistemas.',
    futureCareerPrep: 'Prepara para engenharia de software avançada, arquitetura de dados e desenvolvimento de algoritmos complexos.',
    baseStats: { strength: 8, intelligence: 30, dexterity: 14 },
    initialSkill: 'Projétil Arcano',
    evolutionStrategy: 'Ganhe XP assistindo a aulas conceituais de alta complexidade e resolvendo problemas de lógica.'
  },
  {
    id: 'WARRIOR',
    name: 'Guerreiro',
    symbol: '⚔️',
    color: '#ff7253',
    bgGlow: 'rgba(255,114,83,0.15)',
    pedagogicalProfile: 'Foco Inabalável, Resiliência na Resolução de Erros e Consistência Diária.',
    futureCareerPrep: 'Prepara para liderança operacional, depuração de códigos críticos e resolução de problemas sob pressão.',
    baseStats: { strength: 30, intelligence: 10, dexterity: 16 },
    initialSkill: 'Golpe Flamejante',
    evolutionStrategy: 'Mantenha sequências (streaks) diárias ativas e participe das presenças em sala sem faltar.'
  },
  {
    id: 'RANGER',
    name: 'Caçador',
    symbol: '🏹',
    color: '#39db80',
    bgGlow: 'rgba(57,219,128,0.15)',
    pedagogicalProfile: 'Precisão, Garantia de Qualidade (QA), Atenção aos Detalhes e Padrões.',
    futureCareerPrep: 'Prepara para teste de software, auditoria de código, acessibilidade web (WCAG) e análise de processos.',
    baseStats: { strength: 12, intelligence: 16, dexterity: 28 },
    initialSkill: 'Tiro Certeiro',
    evolutionStrategy: 'Entregue missões com zero erros e gabarite exercícios práticos na primeira tentativa.'
  },
  {
    id: 'NECROMANCER',
    name: 'Necromante',
    symbol: '💀',
    color: '#b794f4',
    bgGlow: 'rgba(183,148,244,0.15)',
    pedagogicalProfile: 'Análise Forense de Bugs, Engenharia Reversa e Leitura de Código Antigo.',
    futureCareerPrep: 'Prepara para segurança da informação (Cybersecurity), refatoração de código legado e diagnóstico de erros.',
    baseStats: { strength: 10, intelligence: 28, dexterity: 14 },
    initialSkill: 'Invocar Espectro',
    evolutionStrategy: 'Encontre falhas em testes práticos e ajude colegas a corrigir bugs em projetos em grupo.'
  },
  {
    id: 'QUEEN',
    name: 'Rainha',
    symbol: '👑',
    color: '#ffd700',
    bgGlow: 'rgba(255,215,0,0.15)',
    pedagogicalProfile: 'Gestão de Projetos, Liderança Colaborativa, Articulação de Equipes e Visão Estratégica.',
    futureCareerPrep: 'Prepara para liderança de produtos (Product Management), gestão de equipes ágeis e coordenação pedagógica.',
    baseStats: { strength: 16, intelligence: 22, dexterity: 20 },
    initialSkill: 'Aura Real',
    evolutionStrategy: 'Participe dos Desafios Colaborativos da Turma (Chefão) e ajude a turma a atingir as metas semanais.'
  },
  {
    id: 'SCHOLAR',
    name: 'Erudito',
    symbol: '📚',
    color: '#63b3ed',
    bgGlow: 'rgba(99,179,237,0.15)',
    pedagogicalProfile: 'Pesquisa Acadêmica, Documentação Clara, Sintaxe Científica e Aprendizado Autônomo.',
    futureCareerPrep: 'Prepara para pesquisa tecnológica, escrita técnica (Technical Writing) e engenharia de documentação.',
    baseStats: { strength: 6, intelligence: 32, dexterity: 12 },
    initialSkill: 'Leitura Arcana',
    evolutionStrategy: 'Explore o catálogo de cursos livres e conclua módulos adicionais além da grade obrigatória.'
  },
  {
    id: 'SMITH',
    name: 'Ferreiro',
    symbol: '🔨',
    color: '#f6ad55',
    bgGlow: 'rgba(246,173,85,0.15)',
    pedagogicalProfile: 'Engenharia de Infraestrutura, Construção de Componentes Reutilizáveis e Ferramental.',
    futureCareerPrep: 'Prepara para engenharia DevOps, criação de Design Systems e infraestrutura de nuvem.',
    baseStats: { strength: 26, intelligence: 14, dexterity: 20 },
    initialSkill: 'Forja Trovejante',
    evolutionStrategy: 'Crie componentes práticos nos exercícios de projeto e acumule moedas na loja de recompensas.'
  },
  {
    id: 'PYROMANCER',
    name: 'Dobrador de Fogo',
    symbol: '🔥',
    color: '#ff9f43',
    bgGlow: 'rgba(255,159,67,0.15)',
    pedagogicalProfile: 'Inovação Disruptiva, Agilidade de Execução, Prototipagem Rápida e Paixão.',
    futureCareerPrep: 'Prepara para empreendedorismo tecnológico, desenvolvimento de protótipos de alto impacto e hackathons.',
    baseStats: { strength: 20, intelligence: 20, dexterity: 12 },
    initialSkill: 'Bola de Fogo',
    evolutionStrategy: 'Complete Missões Blitz de resposta rápida em sala e mantenha uma alta taxa de resolução diária.'
  },
  {
    id: 'PIRATE',
    name: 'Pirata',
    symbol: '🏴‍☠️',
    color: '#fbd38d',
    bgGlow: 'rgba(251,211,141,0.15)',
    pedagogicalProfile: 'Orientação a Resultados, Exploração de Novos Recursos, Adaptabilidade e Descoberta.',
    futureCareerPrep: 'Prepara para Growth Hacking, exploração de novas linguagens de programação e pesquisa de mercado.',
    baseStats: { strength: 22, intelligence: 14, dexterity: 24 },
    initialSkill: 'Golpe do Cutlass',
    evolutionStrategy: 'Conclua tarefas em cursos variados e conquiste badges de exploração de catálogo.'
  },
  {
    id: 'JESTER',
    name: 'Bufão',
    symbol: '🎭',
    color: '#f6e05e',
    bgGlow: 'rgba(246,224,94,0.15)',
    pedagogicalProfile: 'Pensamento Lateral (Out of the Box), Comunicação Criativa e Gamificação de Desafios.',
    futureCareerPrep: 'Prepara para UX/UI Design, Game Design, marketing criativo e facilitação de dinâmicas em equipe.',
    baseStats: { strength: 8, intelligence: 22, dexterity: 30 },
    initialSkill: 'Ilusão Cômica',
    evolutionStrategy: 'Personalize seu avatar, equipe títulos na loja e participe com criatividade das tarefas diárias.'
  },
  {
    id: 'CHAMPION',
    name: 'Campeão',
    symbol: '🏆',
    color: '#c6a94b',
    bgGlow: 'rgba(198,169,75,0.15)',
    pedagogicalProfile: 'Alta Performance Multidisciplinar, Excelência Acadêmica e Liderança Exemplar.',
    futureCareerPrep: 'Prepara para cargos de liderança executiva (CTO, Lead Architect) e gestão pedagógica de alto nível.',
    baseStats: { strength: 24, intelligence: 22, dexterity: 22 },
    initialSkill: 'Brado do Herói',
    evolutionStrategy: 'Mantenha notas acima de 9.0 no boletim, atinja o Nível 5+ e lidere a turma nos desafios de Boss.'
  }
];

export const GamificationManual: React.FC = () => {
  const [selectedClassId, setSelectedClassId] = useState<RpgClass>('MAGE');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const activeClassGuide = CLASS_GUIDES.find(c => c.id === selectedClassId)!;

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div style={{ maxWidth: 1150, margin: '0 auto', textAlign: 'left' }} role="region" aria-label="Manual de Gamificação Pedagógica">
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(59,130,246,0.12) 100%)',
        border: '1px solid var(--primary)',
        borderRadius: 24,
        padding: '32px 36px',
        marginBottom: 28,
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ background: 'var(--primary)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20, letterSpacing: '0.5px' }}>
              MANUAL PEDAGÓGICO OFICIAL
            </span>
            <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>· Guia de Aprendizado & Recompensas</span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 12px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <BookOpen size={34} style={{ color: 'var(--primary)' }} /> Manual da Gamificação Pedagógica
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', margin: 0, maxWidth: 880, lineHeight: 1.6 }}>
            Na nossa plataforma, a gamificação não é apenas um jogo: é uma **metodologia de ensino por recompensas**. 
            Cada aula assistida, presença em sala e missão cumprida desenvolve **competências reais do mundo do trabalho**, 
            preparando você para desafios futuros nas grandes áreas do conhecimento.
          </p>
        </div>
      </div>

      {/* 3 Core Pillars Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
        {[
          {
            icon: <Zap size={24} style={{ color: '#f59e0b' }} />,
            title: '1. Estudo Vira Recompensa (XP)',
            desc: 'Sua dedicação é convertida em Pontos de Experiência (XP) e Moedas de Estudo. Quanto mais frequente e focado você for, mais rápido seu personagem evolui.'
          },
          {
            icon: <Target size={24} style={{ color: '#8b5cf6' }} />,
            title: '2. Arquétipos & Habilidades',
            desc: 'Escolha um arquétipo de personagem (Mago, Guerreiro, Caçador, etc.). Cada classe desenvolve habilidades cognitivas e comportamentais específicas.'
          },
          {
            icon: <Trophy size={24} style={{ color: '#10b981' }} />,
            title: '3. Preparação Profissional',
            desc: 'As competências treinadas aqui (resiliência, lógica, trabalho em equipe e atenção aos detalhes) são as mesmas exigidas em carreiras de tecnologia e inovação.'
          }
        ].map((p, idx) => (
          <div key={idx} style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              {p.icon}
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)' }}>{p.title}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Class Guide Explorer Section */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Crown size={26} style={{ color: '#f59e0b' }} /> Guia Completo dos 11 Arquétipos de Aprendizado (Classes RPG)
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0 }}>
            Clique em cada classe abaixo para entender seu perfil pedagógico, atributos de base e preparação profissional para o futuro:
          </p>
        </div>

        {/* Class Selection Selector Bar */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 20 }}>
          {CLASS_GUIDES.map(c => {
            const isSelected = selectedClassId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedClassId(c.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
                  borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  border: isSelected ? `2px solid ${c.color}` : '1px solid var(--border)',
                  background: isSelected ? c.bgGlow : 'var(--bg-secondary)',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                  boxShadow: isSelected ? `0 4px 14px ${c.color}33` : 'none'
                }}
              >
                <span style={{ fontSize: 16 }}>{c.symbol}</span>
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Class Card Details */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: `2px solid ${activeClassGuide.color}`,
          borderRadius: 24,
          padding: 32,
          boxShadow: `0 10px 30px ${activeClassGuide.color}22`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20,
                background: activeClassGuide.bgGlow, border: `2px solid ${activeClassGuide.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem'
              }}>
                {activeClassGuide.symbol}
              </div>
              <div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                  {activeClassGuide.name}
                </h3>
                <div style={{ fontSize: 12, fontWeight: 700, color: activeClassGuide.color }}>
                  Habilidade Inicial: {activeClassGuide.initialSkill}
                </div>
              </div>
            </div>

            {/* Base Stats Display */}
            <div style={{ display: 'flex', gap: 16, background: 'var(--bg-tertiary)', padding: '12px 20px', borderRadius: 16, border: '1px solid var(--border)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>FORÇA (Prática)</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#ff7253' }}>{activeClassGuide.baseStats.strength}</div>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', padding: '0 16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>INTELIGÊNCIA (Saber)</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#7d62ff' }}>{activeClassGuide.baseStats.intelligence}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>DESTREZA (Agilidade)</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#39db80' }}>{activeClassGuide.baseStats.dexterity}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: 20, borderRadius: 16, border: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Brain size={18} style={{ color: 'var(--primary)' }} /> Perfil Pedagógico & Cognitivo
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {activeClassGuide.pedagogicalProfile}
              </p>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: 20, borderRadius: 16, border: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <BriefcaseIcon size={18} style={{ color: '#10b981' }} /> Preparação para o Mercado / Futuro
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {activeClassGuide.futureCareerPrep}
              </p>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: 20, borderRadius: 16, border: '1px solid var(--border)', gridColumn: '1/-1' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={18} style={{ color: '#f59e0b' }} /> Como Evoluir este Personagem
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {activeClassGuide.evolutionStrategy}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rules & Rewards Mechanics Section */}
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 20px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={26} style={{ color: 'var(--primary)' }} /> Regras de Recompensa & Mecânicas de XP
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          <div className="card" style={{ padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
              <Clock size={20} style={{ color: 'var(--primary)' }} /> Presença na Aula (Chamada Diária)
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.5 }}>
              Ir à aula é o hábito fundamental do estudante. Cada presença confirmada pelo professor concede **+20 XP** imediatamente no seu perfil (Marco Pessoal).
            </p>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: 10 }}>
              💡 *Regra de Idempotência:* Registrar a presença no mesmo dia concede XP apenas 1x, evitando duplicações por engano.
            </div>
          </div>

          <div className="card" style={{ padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
              <Flame size={20} style={{ color: '#ff7253' }} /> Sequência de Estudos (Streak)
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.5 }}>
              Manter uma rotina contínua de acesso e realização de tarefas acumula dias de sequência (Streak).
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li><strong>Streak de 7 Dias:</strong> Concede bônus especial de <strong>+200 XP</strong>.</li>
              <li><strong>Streak de 30 Dias:</strong> Concede bônus épico de <strong>+500 XP</strong>.</li>
            </ul>
          </div>

          <div className="card" style={{ padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
              <Swords size={20} style={{ color: '#3b82f6' }} /> Quadro de Missões & Entregas
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.5 }}>
              O professor publica missões para a turma. Existem três tipos de tarefas:
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li><strong>Missão Comum:</strong> Para a turma toda. Cumprir todas as Comuns da semana rende <strong>+50% de XP bônus</strong>.</li>
              <li><strong>Missão Requisitada:</strong> Desafio individual ou para grupos específicos.</li>
              <li><strong>Missão Blitz:</strong> Tarefa rápida de sala com XP e moedas instantâneas.</li>
            </ul>
          </div>

          <div className="card" style={{ padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
              <Coins size={20} style={{ color: '#f59e0b' }} /> Loja de Recompensas & Moedas
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Ao acumular presenças e boas notas no boletim, você ganha **Moedas de Estudo**. Elas podem ser trocadas na **Loja de Recompensas** por títulos honoríficos para seu perfil e avatares exclusivos.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="card" style={{ padding: 28, borderRadius: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 20px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <HelpCircle size={22} style={{ color: 'var(--primary)' }} /> Perguntas Frequentes (FAQ)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            {
              q: 'Posso trocar de classe durante o ano letivo?',
              a: 'Sim! No seu Perfil, você pode escolher uma nova classe a qualquer momento. Seu Nível e XP conquistados continuam preservados, mas seu arquétipo visual e bônus passarão a refletir a nova classe escolhida.'
            },
            {
              q: 'O que acontece se eu perder uma aula ou esquecer de logar num dia?',
              a: 'Se você faltar, não receberá o XP de presença daquele dia e a sua sequência (Streak) será reiniciada. Porém, você não perde o XP nem o Nível já conquistados anteriormente.'
            },
            {
              q: 'Como os responsáveis (pais) acompanham minha evolução?',
              a: 'Os responsáveis possuem acesso ao Portal da Família via vínculo de conta. Eles conseguem visualizar seu Nível RPG, histórico de presença nas aulas, notas do boletim e faturas financeiras em modo leitura.'
            },
            {
              q: 'Qual é a diferença entre Marco Pessoal e Marco de Herói?',
              a: 'Marco Pessoal é obtido em ações diárias individuais (assistir aulas, login). Marco de Herói é uma conquista de alto impacto (missões épicas ou projetos validados pelo professor) que fica registrada permanentemente na sua ficha escolar.'
            }
          ].map((item, idx) => (
            <div key={idx} style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              <button
                onClick={() => toggleFaq(idx)}
                style={{
                  width: '100%', padding: '14px 18px', background: 'var(--bg-tertiary)', border: 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', textAlign: 'left'
                }}
              >
                <span>{item.q}</span>
                {expandedFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {expandedFaq === idx && (
                <div style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-secondary)' }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper Icon Component
function BriefcaseIcon({ size = 18, style }: { size?: number; style?: React.CSSProperties }) {
  return <Award size={size} style={style} />;
}
