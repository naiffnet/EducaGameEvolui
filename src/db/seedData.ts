import type { Course, User, AuditLog, SystemConfig, AttendanceRecord, Mission, GuardianLink, Invoice, Announcement, DirectMessage, SkillNode, InventoryItem, BossFight, StudentAppointment, SchoolReport } from '../types';
import { hashPassword } from '../engine/AuthUtils';

/** Senha padrão de TODAS as contas semente (ambiente de demonstração). Ver Login.tsx. */
export const SEED_DEMO_PASSWORD = 'estudar123';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-student',
    name: 'Ana Silva',
    email: 'ana.silva@escola.com',
    passwordHash: hashPassword(SEED_DEMO_PASSWORD, 'ana.silva@escola.com'),
    role: 'STUDENT',
    schoolClass: '9º Ano A',
    enrolledCourses: ['course-react', 'course-ux'],
    completedLessons: ['lesson-react-1', 'lesson-ux-1'],
    unlockedBadges: ['Primeiro Passo', 'Explorador React', 'Mestre Acessibilidade'],
    teacherNotes: [
      {
        id: 'note-1',
        teacherName: 'Prof. Marcos Paulo',
        text: 'Ana demonstra excelente interesse e participação nas aulas de React. Seu código do botão acessível ficou muito limpo e bem estruturado!',
        date: '2026-07-16T15:30:00.000Z'
      },
      {
        id: 'note-2',
        teacherName: 'Prof. Marcos Paulo',
        text: 'Excelente compreensão das regras de contraste da WCAG no módulo de interfaces inclusivas.',
        date: '2026-07-17T11:00:00.000Z'
      }
    ],
    rpgCharacter: {
      selectedClass: 'MAGE',
      level: 2,
      xp: 150,
      unlockedSkills: ['Alquimia das Cores', 'Teleporte Flexbox'],
      stats: { strength: 8, intelligence: 24, dexterity: 14 },
      milestones: [
        {
          id: 'ms-1',
          type: 'PERSONAL',
          title: 'Primeira Aula!',
          description: 'Completou a primeira aula de React.',
          source: 'lesson_completed',
          achievedAt: '2026-07-15T10:00:00.000Z',
          relatedEntityId: 'lesson-react-1',
        },
        {
          id: 'ms-2',
          type: 'PERSONAL',
          title: 'WCAG Explorador',
          description: 'Completou o módulo de acessibilidade WCAG.',
          source: 'lesson_completed',
          achievedAt: '2026-07-16T14:30:00.000Z',
          relatedEntityId: 'lesson-ux-1',
        },
      ],
      dailyProgress: {
        lastActivityDate: new Date().toISOString(),
        currentStreak: 3,
        longestStreak: 5,
        xpGainedToday: 80,
        dailyTasksCompleted: ['watch_lesson'],
        lastDailyReset: new Date().toISOString(),
      },
    }
  },
  {
    id: 'user-student-pedro',
    name: 'Pedro Alves',
    email: 'pedro.alves@escola.com',
    passwordHash: hashPassword(SEED_DEMO_PASSWORD, 'pedro.alves@escola.com'),
    role: 'STUDENT',
    schoolClass: '9º Ano A',
    enrolledCourses: ['course-react'],
    completedLessons: ['lesson-react-1'],
    unlockedBadges: ['Primeiro Passo', 'Batedor de Bugs'],
    teacherNotes: [],
    rpgCharacter: {
      selectedClass: 'WARRIOR',
      level: 3,
      xp: 320,
      unlockedSkills: ['Espada de Funções', 'Escudo de Estados', 'Loop Supremo'],
      stats: { strength: 28, intelligence: 12, dexterity: 16 },
      milestones: [
        {
          id: 'ms-p1',
          type: 'PERSONAL',
          title: 'Primeira Batalha!',
          description: 'Completou sua primeira aula.',
          source: 'lesson_completed',
          achievedAt: '2026-07-10T09:00:00.000Z',
          relatedEntityId: 'lesson-react-1',
        },
        {
          id: 'ms-p2',
          type: 'PERSONAL',
          title: 'Depurador Nato',
          description: 'Passou em um exercício de alto nível.',
          source: 'exercise_passed',
          achievedAt: '2026-07-12T11:00:00.000Z',
        },
        {
          id: 'ms-p3',
          type: 'HERO',
          title: '⚡ Loop Supremo',
          description: 'Dominou o conceito de loops em programação.',
          source: 'lesson_completed',
          achievedAt: '2026-07-14T15:00:00.000Z',
        },
      ],
      dailyProgress: {
        lastActivityDate: new Date().toISOString(),
        currentStreak: 7,
        longestStreak: 7,
        xpGainedToday: 120,
        dailyTasksCompleted: ['watch_lesson', 'complete_lesson', 'do_exercise'],
        lastDailyReset: new Date().toISOString(),
      },
    }
  },
  {
    id: 'user-student-juliana',
    name: 'Juliana Santos',
    email: 'juliana.santos@escola.com',
    passwordHash: hashPassword(SEED_DEMO_PASSWORD, 'juliana.santos@escola.com'),
    role: 'STUDENT',
    schoolClass: '9º Ano B',
    enrolledCourses: ['course-ux'],
    completedLessons: ['lesson-ux-1'],
    unlockedBadges: ['Primeiro Passo'],
    teacherNotes: [],
    rpgCharacter: {
      selectedClass: 'RANGER',
      level: 1,
      xp: 60,
      unlockedSkills: ['Visão WCAG'],
      stats: { strength: 10, intelligence: 14, dexterity: 26 },
      milestones: [
        {
          id: 'ms-j1',
          type: 'PERSONAL',
          title: 'Primeira Descoberta!',
          description: 'Iniciou sua jornada no mundo do UX.',
          source: 'lesson_completed',
          achievedAt: '2026-07-17T08:00:00.000Z',
          relatedEntityId: 'lesson-ux-1',
        },
      ],
      dailyProgress: {
        lastActivityDate: new Date().toISOString(),
        currentStreak: 1,
        longestStreak: 1,
        xpGainedToday: 60,
        dailyTasksCompleted: ['watch_lesson', 'complete_lesson'],
        lastDailyReset: new Date().toISOString(),
      },
    }
  },
  {
    id: 'user-instructor',
    name: 'Prof. Marcos Paulo',
    email: 'marcos.paulo@escola.com',
    passwordHash: hashPassword(SEED_DEMO_PASSWORD, 'marcos.paulo@escola.com'),
    role: 'INSTRUCTOR',
    enrolledCourses: [],
    completedLessons: [],
    unlockedBadges: [],
    teacherNotes: []
  },
  {
    id: 'user-admin',
    name: 'Mariana Costa',
    email: 'mariana.admin@escola.com',
    passwordHash: hashPassword(SEED_DEMO_PASSWORD, 'mariana.admin@escola.com'),
    role: 'ADMIN',
    enrolledCourses: [],
    completedLessons: [],
    unlockedBadges: [],
    teacherNotes: []
  },
  {
    id: 'user-coordinator',
    name: 'Carla Mendes (Coordenação)',
    email: 'carla.coordenacao@escola.com',
    passwordHash: hashPassword(SEED_DEMO_PASSWORD, 'carla.coordenacao@escola.com'),
    role: 'COORDINATOR',
    enrolledCourses: [],
    completedLessons: [],
    unlockedBadges: [],
    teacherNotes: []
  },
  {
    id: 'user-maintenance',
    name: 'Carlos Santos (Suporte)',
    email: 'carlos.suporte@escola.com',
    passwordHash: hashPassword(SEED_DEMO_PASSWORD, 'carlos.suporte@escola.com'),
    role: 'MAINTENANCE',
    enrolledCourses: [],
    completedLessons: [],
    unlockedBadges: [],
    teacherNotes: []
  },
  {
    id: 'user-guardian-paulo',
    name: 'Paulo Silva (Pai)',
    email: 'paulo.silva@escola.com',
    passwordHash: hashPassword(SEED_DEMO_PASSWORD, 'paulo.silva@escola.com'),
    role: 'GUARDIAN',
    enrolledCourses: [],
    completedLessons: [],
    unlockedBadges: [],
    teacherNotes: [],
    phoneNumber: '(11) 98888-7777',
  }
];

export const INITIAL_GUARDIAN_LINKS: GuardianLink[] = [
  {
    id: 'link-1',
    guardianUserId: 'user-guardian-paulo',
    studentUserId: 'user-student', // Ana Silva
    relationship: 'Pai',
    createdAt: '2026-07-20T10:00:00.000Z',
  },
  {
    id: 'link-2',
    guardianUserId: 'user-guardian-paulo',
    studentUserId: 'user-student-pedro', // Pedro Alves
    relationship: 'Pai',
    createdAt: '2026-07-20T10:00:00.000Z',
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    studentId: 'user-student', // Ana Silva
    description: 'Mensalidade Junho/2026',
    amount: 450.00,
    dueDate: '2026-06-10',
    status: 'PAID',
    paidAt: '2026-06-08T14:20:00.000Z',
    createdAt: '2026-06-01T08:00:00.000Z',
  },
  {
    id: 'inv-2',
    studentId: 'user-student', // Ana Silva
    description: 'Mensalidade Julho/2026',
    amount: 450.00,
    dueDate: '2026-07-10',
    status: 'PENDING', // Será computado como OVERDUE se hoje > 2026-07-10
    createdAt: '2026-07-01T08:00:00.000Z',
  },
  {
    id: 'inv-3',
    studentId: 'user-student', // Ana Silva
    description: 'Mensalidade Agosto/2026',
    amount: 450.00,
    dueDate: '2026-08-10',
    status: 'PENDING',
    createdAt: '2026-07-20T08:00:00.000Z',
  },
  {
    id: 'inv-4',
    studentId: 'user-student-pedro', // Pedro Alves
    description: 'Mensalidade Julho/2026',
    amount: 480.00,
    dueDate: '2026-07-15',
    status: 'PAID',
    paidAt: '2026-07-14T11:30:00.000Z',
    createdAt: '2026-07-01T08:00:00.000Z',
  },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anc-1',
    authorId: 'user-admin',
    authorName: 'Mariana Costa (Direção)',
    title: '🚀 Feira de Tecnologia e Gamificação Educacional 2026',
    body: 'Convidamos todos os alunos e familiares para nossa Feira de Tecnologia no próximo sábado, dia 10 de Agosto, a partir das 09h. Teremos apresentações dos projetos de React e Acessibilidade!',
    audience: 'SCHOOL',
    createdAt: '2026-07-18T10:00:00.000Z',
  },
  {
    id: 'anc-2',
    authorId: 'user-instructor',
    authorName: 'Prof. Marcos Paulo',
    title: '📢 Lembrete de Projeto para o 9º Ano A',
    body: 'Pessoal do 9º Ano A, lembrem-se de submeter o exercício do Botão Acessível WCAG até esta sexta-feira no Quadro de Missões para garantir os pontos de XP da semana!',
    audience: { schoolClass: '9º Ano A' },
    createdAt: '2026-07-20T14:30:00.000Z',
  },
];

export const INITIAL_DIRECT_MESSAGES: DirectMessage[] = [
  {
    id: 'msg-1',
    fromUserId: 'user-guardian-paulo',
    fromUserName: 'Paulo Silva (Pai)',
    toUserId: 'user-instructor',
    toUserName: 'Prof. Marcos Paulo',
    studentId: 'user-student',
    body: 'Olá Professor Marcos, tudo bem? Gostaria de saber como a Ana Silva está se adaptando às aulas de React deste semestre.',
    createdAt: '2026-07-21T09:15:00.000Z',
  },
  {
    id: 'msg-2',
    fromUserId: 'user-instructor',
    fromUserName: 'Prof. Marcos Paulo',
    toUserId: 'user-guardian-paulo',
    toUserName: 'Paulo Silva (Pai)',
    studentId: 'user-student',
    body: 'Olá Sr. Paulo! A Ana tem tido um desempenho excelente. Ela é muito caprichosa com os conceitos de Acessibilidade WCAG e seu personagem RPG já está no nível 2!',
    createdAt: '2026-07-21T11:40:00.000Z',
    readAt: '2026-07-21T12:00:00.000Z',
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-react',
    title: 'Desenvolvimento Web com React e TypeScript',
    description: 'Aprenda a construir aplicações web escaláveis, tipadas e performáticas com React e TypeScript partindo do absoluto zero.',
    instructorId: 'user-instructor',
    instructorName: 'Prof. Marcos Paulo',
    category: 'Programação',
    difficulty: 'Iniciante',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800',
    modules: [
      {
        id: 'module-react-intro',
        title: 'Módulo 1: Introdução ao Ecossistema',
        lessons: [
          {
            id: 'lesson-react-1',
            title: '1.1 O que é o React e por que usar TypeScript?',
            type: 'video',
            duration: '15 min',
            content: 'Nesta aula vamos aprender as vantagens de tipar componentes React e como o TypeScript reduz erros em tempo de execução.',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
          {
            id: 'lesson-react-2',
            title: '1.2 Configurando o ambiente de trabalho',
            type: 'text',
            duration: '10 min',
            content: `<h3>Passo a passo de configuração</h3><p>Para programar em React com TypeScript, você precisará do Node.js instalado em sua máquina. Siga os passos a seguir:</p><ol><li>Instale o <b>Node.js LTS</b> (versão 18+ ou 20+ recomendada).</li><li>Abra o terminal e execute: <code>npx create-vite@latest meu-app --template react-ts</code>.</li><li>Navegue até a pasta do projeto: <code>cd meu-app</code>.</li><li>Instale as dependências: <code>npm install</code>.</li><li>Inicie o servidor de desenvolvimento: <code>npm run dev</code>.</li></ol>`,
          }
        ]
      },
      {
        id: 'module-react-exercises',
        title: 'Módulo 2: Exercícios Práticos',
        lessons: [
          {
            id: 'lesson-react-3',
            title: 'Exercício 2.1: Criando um Componente de Botão Otimizado',
            type: 'exercise',
            duration: '25 min',
            content: 'Crie um componente de botão acessível em React que aceite as propriedades padrão de botão do HTML e adicione suporte a variantes de cor e ícone.',
            problemContent: `// TODO: Implemente o componente Button abaixo\nimport React from 'react';\n\ninterface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {\n  variant?: 'primary' | 'secondary';\n  label: string;\n}\n\nexport const Button: React.FC<ButtonProps> = ({ variant = 'primary', label, ...props }) => {\n  // Escreva a implementação que garanta navegação acessível e foco visual\n  return (\n    <button className={\`btn btn-\${variant}\`} {...props}>\n      {label}\n    </button>\n  );\n};`,
            solutionContent: `import React from 'react';\n\ninterface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {\n  variant?: 'primary' | 'secondary';\n  label: string;\n}\n\nexport const Button: React.FC<ButtonProps> = ({ variant = 'primary', label, ...props }) => {\n  return (\n    <button \n      className={\`btn btn-\${variant}\`} \n      style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}\n      aria-label={label}\n      {...props}\n    >\n      {label}\n    </button>\n  );\n};`,
            explainerContent: '# O que faz um botão ser acessível?\n\n1. **Foco Visual**: Deve possuir `:focus-visible` bem definido para navegação via teclado.\n2. **Aria-Label**: Deve indicar claramente qual é a ação do botão se o texto for curto ou confuso.\n3. **Keyboard triggers**: Botões HTML nativos já suportam `Enter` e `Space` automaticamente.'
          }
        ]
      }
    ]
  },
  {
    id: 'course-ux',
    title: 'UX/UI Design: Criando Interfaces Inclusivas',
    description: 'Aprenda a criar interfaces focadas na acessibilidade, estudando regras de contraste, leitores de tela e padrões WCAG.',
    instructorId: 'user-instructor',
    instructorName: 'Prof. Marcos Paulo',
    category: 'Design',
    difficulty: 'Intermediário',
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&q=80&w=800',
    modules: [
      {
        id: 'module-ux-foundations',
        title: 'Módulo 1: Fundamentos de Acessibilidade Digital',
        lessons: [
          {
            id: 'lesson-ux-1',
            title: '1.1 O que é a WCAG?',
            type: 'text',
            duration: '12 min',
            content: '<h3>Diretrizes de Acessibilidade para Conteúdo Web (WCAG)</h3><p>As Diretrizes de Acessibilidade para Conteúdo Web (WCAG) explicam como tornar o conteúdo da Web mais acessível a pessoas com deficiência. A acessibilidade envolve uma ampla gama de deficiências, incluindo visual, auditiva, física, de fala, cognitiva, de linguagem, de aprendizagem e neurológica.</p><p>As diretrizes são divididas em 4 princípios fundamentais (POUR):</p><ul><li><b>Perceptível (Perceivable)</b>: A informação e os componentes da interface devem ser apresentados em formas que os usuários possam perceber.</li><li><b>Operável (Operable)</b>: Os componentes da interface e a navegação devem ser operáveis.</li><li><b>Compreensível (Understandable)</b>: A informação e a operação da interface devem ser compreensíveis.</li><li><b>Robusto (Robust)</b>: O conteúdo deve ser robusto o suficiente para ser interpretado de forma confiável por uma ampla variedade de agentes de usuário, incluindo tecnologias assistivas.</li></ul>',
          },
          {
            id: 'lesson-ux-2',
            title: '1.2 Contraste de Cores e Legibilidade',
            type: 'video',
            duration: '20 min',
            content: 'Nesta vídeo-aula vamos aprender como testar o contraste de cores das suas interfaces utilizando ferramentas do próprio navegador para atingir o nível AA e AAA da WCAG.',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          }
        ]
      }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    userId: 'user-admin',
    userName: 'Mariana Costa',
    userRole: 'ADMIN',
    action: 'Inicialização do Sistema',
    details: 'Banco de dados simulado inicializado com dados semente padrão.',
    status: 'success',
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    userId: 'user-maintenance',
    userName: 'Carlos Santos',
    userRole: 'MAINTENANCE',
    action: 'Auditoria de Acessibilidade',
    details: 'Verificado suporte a temas escuro e alto contraste no carregamento de estilos.',
    status: 'success',
  }
];

export const INITIAL_CONFIG: SystemConfig = {
  maintenanceMode: false,
  allowStudentRegistration: true,
  systemVersion: '1.1.0-RPG-EVOLUTION',
  schoolName: 'Colégio Evoluir & Saber',
};

// Some demonstration attendance history for the 9º Ano A turma (Ana e Pedro)
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-seed-1',
    studentId: 'user-student',
    schoolClass: '9º Ano A',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().slice(0, 10),
    present: true,
    xpGranted: true,
    recordedByInstructorId: 'user-instructor',
    recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'att-seed-2',
    studentId: 'user-student-pedro',
    schoolClass: '9º Ano A',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().slice(0, 10),
    present: false,
    xpGranted: false,
    recordedByInstructorId: 'user-instructor',
    recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
];

// Demonstração dos três tipos de Missão, para a turma do curso de React
export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'mission-seed-common-1',
    courseId: 'course-react',
    instructorId: 'user-instructor',
    instructorName: 'Prof. Marcos Paulo',
    title: 'Pesquisa: Componentes Reutilizáveis',
    description: 'Traga 2 exemplos de componentes reutilizáveis que você encontrou em sites do dia a dia, com uma frase explicando por que funcionam bem.',
    type: 'COMMON',
    xpReward: 120,
    milestoneType: 'PERSONAL',
    requiresValidation: true,
    availableFrom: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: 'mission-seed-blitz-1',
    courseId: 'course-react',
    instructorId: 'user-instructor',
    instructorName: 'Prof. Marcos Paulo',
    title: 'Blitz: Encontre o Bug',
    description: 'Em sala: encontre o erro de sintaxe no trecho de código mostrado no quadro e explique em uma frase o que está errado.',
    type: 'BLITZ',
    xpReward: 40,
    milestoneType: 'PERSONAL',
    requiresValidation: false,
    availableFrom: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'mission-seed-requested-1',
    courseId: 'course-react',
    instructorId: 'user-instructor',
    instructorName: 'Prof. Marcos Paulo',
    title: 'Reforço: Props e Estado',
    description: 'Refaça o exercício do Button com um novo estado de "loading" que desabilita o clique enquanto uma ação está em andamento.',
    type: 'REQUESTED',
    xpReward: 200,
    milestoneType: 'HERO',
    requiresValidation: true,
    targetStudentIds: ['user-student-pedro'],
    availableFrom: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
];

// ─── Blueprint Fase 2 Seed Data ───────────────────────────────────────────────

export const INITIAL_SKILL_NODES: SkillNode[] = [
  // WARRIOR / Cruzado
  { id: 'skill-warrior-1', className: 'WARRIOR', title: 'Foco Inabalável', description: 'Ganha +15% de XP bônus em tarefas concluídas dentro do prazo.', requiredLevel: 1, iconName: 'Shield', category: 'PASSIVE', effect: '+15% XP no prazo' },
  { id: 'skill-warrior-2', className: 'WARRIOR', title: 'Golpe Flamejante', description: 'Causa 50 de dano extra ao Chefão da Turma ao marcar presença.', requiredLevel: 2, iconName: 'Flame', category: 'ACTIVE', effect: '50 dano no Boss' },
  { id: 'skill-warrior-3', className: 'WARRIOR', title: 'Aura do Guardião', description: 'Protege a sequência da turma em dias de baixa frequência.', requiredLevel: 4, iconName: 'Award', category: 'ULTIMATE', effect: 'Proteção de Streak' },

  // MAGE / Arcanista
  { id: 'skill-mage-1', className: 'MAGE', title: 'Mente Analítica', description: 'Ganha +20 Moedas de estudo ao gabaritar exercícios.', requiredLevel: 1, iconName: 'BookOpen', category: 'PASSIVE', effect: '+20 Moedas em Nota 10' },
  { id: 'skill-mage-2', className: 'MAGE', title: 'Projétil Arcano', description: 'Concede +10 XP bônus ao responder perguntas em sala.', requiredLevel: 2, iconName: 'Zap', category: 'ACTIVE', effect: '+10 XP em respostas' },

  // QUEEN / Soberana
  { id: 'skill-queen-1', className: 'QUEEN', title: 'Comando Inspirador', description: 'Aumenta o XP recebido pelos colegas de equipe em missões em grupo.', requiredLevel: 1, iconName: 'Crown', category: 'PASSIVE', effect: '+10% XP na Turma' },
  { id: 'skill-queen-2', className: 'QUEEN', title: 'Aura Real', description: 'Restaura a vida do Chefão da Turma em 10% a favor da sala.', requiredLevel: 3, iconName: 'Sparkles', category: 'ULTIMATE', effect: 'Bônus Coletivo' },

  // PIRATE / Corsário
  { id: 'skill-pirate-1', className: 'PIRATE', title: 'Navegação Ágil', description: 'Permite entregar missões com até 24h de tolerância sem perda de bônus.', requiredLevel: 1, iconName: 'Anchor', category: 'PASSIVE', effect: 'Tolerância +24h' },
  { id: 'skill-pirate-2', className: 'PIRATE', title: 'Golpe do Cutlass', description: 'Causa dano crítico duplo no Chefão da Turma ao entregar Missão Blitz.', requiredLevel: 2, iconName: 'Swords', category: 'ACTIVE', effect: 'Dano Crítico x2' },
];

export const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'item-title-1', name: 'Título: Mestre dos Códigos', category: 'title', description: 'Exibe o título "Mestre dos Códigos" no perfil.', cost: 100, iconName: 'Sparkles', rarity: 'RARE', value: 'Mestre dos Códigos' },
  { id: 'item-title-2', name: 'Título: Guardião do Saber', category: 'title', description: 'Exibe o título lendário "Guardião do Saber".', cost: 250, iconName: 'Crown', rarity: 'LEGENDARY', value: 'Guardião do Saber' },
  { id: 'item-avatar-1', name: 'Avatar: Dragão Lendário', category: 'avatar', description: 'Ícone de perfil exclusivo de Dragão.', cost: 150, iconName: 'Zap', rarity: 'EPIC', value: '🐉' },
  { id: 'item-avatar-2', name: 'Avatar: Fênix Estelar', category: 'avatar', description: 'Ícone de perfil exclusivo de Fênix.', cost: 200, iconName: 'Flame', rarity: 'LEGENDARY', value: '🦅' },
  { id: 'item-boost-1', name: 'Frasco de XP Duplo (1d)', category: 'xp_boost', description: 'Dobra o XP ganho em todas as aulas por 24 horas.', cost: 80, iconName: 'Zap', rarity: 'COMMON', value: '2x' },
];

export const INITIAL_BOSS_FIGHTS: BossFight[] = [
  {
    id: 'boss-seed-1',
    schoolClass: '9º Ano A',
    courseId: 'course-react',
    courseName: 'Desenvolvimento Web com React e TypeScript',
    title: 'Desafio Colaborativo da Turma — Módulo 1',
    bossName: 'O Dragão dos Algoritmos',
    description: 'A turma do 9º Ano A precisa unir forças! Cada aula assistida e presença registrada causa dano à barra de vida do Dragão.',
    maxHp: 1000,
    currentHp: 640,
    rewardXp: 300,
    rewardCoins: 150,
    status: 'ACTIVE',
    avatarSymbol: '🐉',
    createdAt: new Date().toISOString(),
  }
];

export const INITIAL_STUDENT_APPOINTMENTS: StudentAppointment[] = [
  {
    id: 'appt-1',
    studentId: 'user-student-1',
    studentName: 'Ana Silva',
    targetStaffId: 'user-instructor',
    targetStaffName: 'Prof. Marcos Paulo',
    targetStaffRole: 'INSTRUCTOR',
    mode: 'VIRTUAL',
    category: 'ACADEMIC_DOUBT',
    date: '2026-07-25',
    timeSlot: '14:30',
    subject: 'Dúvida sobre componentes em React',
    notes: 'Preciso de ajuda no exercício de State Hooks.',
    status: 'CONFIRMED',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_SCHOOL_REPORTS: SchoolReport[] = [
  {
    id: 'rep-1',
    protocolNumber: 'PROT-2026-9821',
    isAnonymous: true,
    category: 'BULLYING',
    urgency: 'HIGH',
    location: 'Pátio Central / Intervalo',
    incidentDate: '2026-07-20',
    description: 'Relato de comentários ofensivos recorrentes praticados contra alunos do 9º Ano A durante a saída.',
    involvedPeople: 'Grupo de alunos do 9º Ano',
    status: 'UNDER_REVIEW',
    resolutionNotes: 'A coordenação pedagógica agendou conversa preventiva com a turma.',
    createdAt: new Date().toISOString(),
  },
];
