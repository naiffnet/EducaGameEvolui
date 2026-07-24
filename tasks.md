# Checklist de Implementação — Fase 0 (Fundação) + Fase 1 (MVP)

> **Documento de Origem:** [PLANO_IMPLEMENTACAO.md](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/PLANO_IMPLEMENTACAO.md)  
> **Status Geral do Projeto:** Entregas A, B, C, D e I **Concluídas** · Entregas E, F, G, H **Pendentes**

---

## 📊 Status Atual da Implementação

| Entrega | Descrição | Status | Localização no Código |
|---|---|---|---|
| **Entrega A** | Cadastro Estendido de Usuários (matrícula, tel, responsável) | ✅ Concluído | `UserManagement.tsx`, `types/index.ts` |
| **Entrega B** | Turmas & Diário de Classe (Chamada + Frequência) | ✅ Concluído | `Attendance.tsx` |
| **Entrega C** | Boletim Escolar (Notas + Histórico Acadêmico) | ✅ Concluído | `GradeBook.tsx`, `AcademicHistory.tsx` |
| **Entrega D** | Motor de Missões & Entregas de Tarefas | ✅ Concluído | `MissionEngine.ts`, `MissionBoard.tsx`, `MissionEditor.tsx` |
| **Entrega I** | Autenticação com Senha Real (Hash SHA-256) | ✅ Concluído | `AuthUtils.ts`, `AuthContext.tsx`, `Login.tsx`, `UserManagement.tsx` |
| **Entrega E** | Portal da Família (Responsável / Visão da Família) | ✅ Concluído | `src/pages/Guardian/FamilyPortal.tsx` |
| **Entrega F** | Financeiro Básico (Mensalidades, Status, Baixas) | ✅ Concluído | `src/pages/Admin/Financial.tsx`, `FinancialEngine.ts` |
| **Entrega G** | Comunicação (Mural de Avisos + Mensagens Diretas) | ✅ Concluído | `AnnouncementBoard.tsx`, `DirectMessaging.tsx` |
| **Entrega H** | Onboarding de Integração (Avatar + Tutorial + Missão Boas-Vindas) | ✅ Concluído | `OnboardingModal.tsx`, `Student/Home.tsx`, `CharacterCreator.tsx` |

---

## 🎯 Roteiro de Execução Passo a Passo

### 🟢 [x] Entrega I — Autenticação com Senha Real (Robustez / Fundação)
- [x] **I.1** Hashing de senha síncrono SHA-256 client-side em [AuthUtils.ts](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/engine/AuthUtils.ts)
- [x] **I.2** Adicionar `passwordHash?: string` à interface `User` em [types/index.ts](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/types/index.ts)
- [x] **I.3** Tela de [Login.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/pages/Login.tsx) com login por E-mail e Senha
- [x] **I.4** Funcionalidade para Admin definir/resetar senha em [UserManagement.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/pages/Admin/UserManagement.tsx)

---

### 🟢 [x] Entrega E — Portal da Família (Responsável)
- [x] **E.1** Adicionar papel `'GUARDIAN'` a `UserRole` em [types/index.ts](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/types/index.ts) e suporte nos seletores de papel
- [x] **E.2** Criar interface `GuardianLink` (`{ id, guardianUserId, studentUserId, relationship }`) em `types/index.ts` e suporte em [database.ts](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/db/database.ts) / [seedData.ts](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/db/seedData.ts)
- [x] **E.3** Adicionar interface de vinculação de Responsável a Estudante(s) na gestão de usuários em [UserManagement.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/pages/Admin/UserManagement.tsx)
- [x] **E.4** Criar componente/página `FamilyPortal.tsx` em [FamilyPortal.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/pages/Guardian/FamilyPortal.tsx):
  - Seletor de dependentes (caso o responsável tenha múltiplos estudantes vinculados)
  - Visão somente-leitura do progresso RPG (Nível, XP, Classe, Marcos)
  - Visão somente-leitura de frequência (`AttendanceHistory`)
  - Visão somente-leitura do boletim/notas (`AcademicHistory`)
- [x] **E.5** Adicionar a aba `'family-portal'` em [Header.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/components/Header.tsx) e roteamento em [App.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/App.tsx)

---

### 🟢 [x] Entrega F — Financeiro Básico
- [x] **F.1** Definir tipo `Invoice` (`{ id, studentId, description, amount, dueDate, status: 'PENDING'|'PAID'|'OVERDUE', paidAt? }`) em [types/index.ts](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/types/index.ts)
- [x] **F.2** Criar função pura `computeInvoiceStatus(invoice, now)` para cálculo dinâmico de faturas atrasadas (Regra F1) em [FinancialEngine.ts](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/engine/FinancialEngine.ts)
- [x] **F.3** Adicionar persistência e dados semente para `Invoice` em [database.ts](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/db/database.ts) e [seedData.ts](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/db/seedData.ts)
- [x] **F.4** Criar tela de gestão financeira para Admin/Instrutor em [Financial.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/pages/Admin/Financial.tsx) (lançamento de mensalidades e baixa manual de pagamento)
- [x] **F.5** Exibir extrato financeiro (somente-leitura) no Portal da Família ([FamilyPortal.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/pages/Guardian/FamilyPortal.tsx))

---

### 🟢 [x] Entrega G — Comunicação
- [x] **G.1** Definir tipos `Announcement` e `DirectMessage` em [types/index.ts](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/types/index.ts)
- [x] **G.2** Adicionar armazenamento e dados semente em [database.ts](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/db/database.ts) e [seedData.ts](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/db/seedData.ts)
- [x] **G.3** Criar componente [AnnouncementBoard.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/components/AnnouncementBoard.tsx) com filtragem por audiência (`SCHOOL` ou por `schoolClass`)
- [x] **G.4** Integrar `AnnouncementBoard` nas telas do Estudante ([Home.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/pages/Student/Home.tsx)) e Família ([FamilyPortal.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/pages/Guardian/FamilyPortal.tsx))
- [x] **G.5** Criar caixa de entrada/envio de Mensagens Diretas entre Responsável e Instrutor em [DirectMessaging.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/components/DirectMessaging.tsx)

---

### 🟢 [x] Entrega H — Onboarding de Integração
- [x] **H.1** Adicionar escolha visual de avatar RPG no onboarding do estudante ([CharacterCreator.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/components/CharacterCreator.tsx))
- [x] **H.2** Criar modal sequencial de tutorial (4 passos) apresentando o sistema de XP, Marcos e Missões em [OnboardingModal.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/components/OnboardingModal.tsx)
- [x] **H.3** Implementar criação automática e idempotente da "Missão de boas-vindas" (Regra H1, id `welcome-${studentId}`) no primeiro acesso em [Student/Home.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/pages/Student/Home.tsx)

---

### 🟢 [x] Validação & Qualidade Técnica
- [x] **V.1** Executar checagem de tipos sem erros: `npx tsc -b --noEmit`
- [x] **V.2** Executar build de produção sem erros: `npm run build`
- [x] **V.3** Validação manual dos fluxos de todas as entregas (A, B, C, D, I, E, F, G, H)
