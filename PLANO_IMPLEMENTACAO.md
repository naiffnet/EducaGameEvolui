# Plano de Implementação Unificado — Plataforma EducaGameEvolui (Fase 0 + Fase 1 MVP)

Status: **Concluído (Entregas A a I)** · Última Consolidação: 2026-07-23  
Fontes Primárias:
- Base de Regras RPG (Blue Phoenix RPG — Rise of the Titans)
- Documento `docs/blueprint/Construcao_do_Projeto_Educacional_Primeira_Etapa.pdf` (319 páginas — BLUEPRINT MASTER)  
Skills consultadas: `domain-modeling`, `ubiquitous-language`, `codebase-design`, `to-spec`.

> **Nota de Consolidação:** este documento unifica e substitui os planos de implementação `PLANO_IMPLEMENTACAO_PLATAFORMA.md` (Entregas A–D) e `PLANO_IMPLEMENTACAO_FASE0_FASE1_BLUEPRINT.md` (Entregas E–I). Toda a auditoria, especificações de negócio, decisões de arquitetura e user stories do projeto de gestão escolar com gamificação RPG estão concentradas neste único arquivo mestre.

---

## 1. Nota Metodológica — Alinhamento ao Blueprint Master

O documento de referência principal (**"BLUEPRINT MASTER — Documento 000 — Constituição do Projeto"**) foi projetado para ser construído em **10 volumes progressivos** (Visão do Produto, Requisitos Funcionais, Arquitetura de Software, Banco de Dados, Plataforma Pedagógica, Motor de RPG, IA, UX/UI, APIs, Infraestrutura).

Conforme o capítulo 27 (§27.3 — Roadmap de Evolução), a primeira etapa de código corresponde estritamente a:
- **Fase 0 — Fundação:** arquitetura base, autenticação, gestão de usuários, infraestrutura essencial.
- **Fase 1 — MVP:** ERP Escolar essencial, matrículas, diário de classe, boletim, financeiro básico, comunicação, portal do estudante e portal da família.

Fases posteriores (2 a 8 — Learning Engine avançado, mundo narrativo persistente, ecossistema de 12+ agentes de IA, marketplace, analytics global) pertencem a expansões futuras e estão intencionalmente fora do escopo desta versão em SPA React + TypeScript com `localStorage`.

---

## 2. Pesquisa de Domínio & Regras de Negócio de Apoio

### A. Base de Regras do RPG (Blue Phoenix RPG — Rise of the Titans)

| Mecânica do RPG pesquisado | Como funciona no RPG | Tradução para a Plataforma de Ensino |
|---|---|---|
| **Dualidade de conquistas** | Subir de nível exige crescimento pessoal *e* contribuição coletiva | **Marco Pessoal** vs **Marco de Herói** (Missões e Chamada alimentam os dois) |
| **Feito único e rastreável** | Conquistas são únicas e nunca contam duas vezes | Invariante no `EvolutionEngine` (`dedup` por `source` + `relatedEntityId`) |
| **Três tipos de missão** | Comuns (semanais), Requisitadas (individuais), Blitz (curtas) | **Missão Comum** (turma toda), **Requisitada** (aluno/subgrupo), **Blitz** (curta, XP imediato) |
| **Lista semanal do Legado** | Lista curada que reseta semanalmente | Cumprir todas as Comuns da semana concede bônus de XP (Regra M3) |
| **Validação de Mestre** | Conquistas de peso exigem aprovação humana | Missões tipo Herói e Chamada exigem validação do Instrutor |
| **Ações pequenas e rápidas** | Recompensa rápida e imediata por hábito | **Chamada/Presença** concede XP fixo (20 XP) no ato de confirmação pelo professor |

### B. Atores do Sistema (§3.3 do Blueprint)
O sistema atende a 5 atores fundamentais:
1. **Estudante:** joga a jornada pedagógica, cumpre missões, ganha XP e acompanha progresso RPG.
2. **Instrutor/Professor:** atua como Mestre de Jogo (cria missões, faz chamada, avalia entregas e publica avisos).
3. **Responsável (Família):** acompanha frequência, boletim, progresso RPG e mensalidades do(s) dependente(s) em modo somente-leitura.
4. **Administrador:** gerencia usuários, matrículas, financeiro e configurações globais.
5. **IA Educacional (Assistente de Aula):** auxilia o instrutor na geração local de rascunhos de aula e conteúdo.

### C. Ciclo de Vida do Estudante (§3.6 do Blueprint)
- **Descoberta & Matrícula:** criação de conta, matrícula em cursos e vínculos de responsável (`GuardianLink`).
- **Integração (Onboarding):** escolha visual de avatar, tutorial interativo em 4 passos e atribuição automática da "Missão de Boas-Vindas".
- **Jornada Acadêmica:** aulas, frequência diária, missões semanais, boletim e evolução de nível RPG.

---

## 3. Matriz de Auditoria da Fase 0 + Fase 1

| Entrega | Módulo / Funcionalidade | Status | Localização Principal no Código |
|---|---|---|---|
| **Entrega A** | Cadastro Estendido (Matrícula, nascimento, tel, responsável) | ✅ Concluído | [UserManagement.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/pages/Admin/UserManagement.tsx), [types/index.ts](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/types/index.ts) |
| **Entrega B** | Turmas & Diário de Classe (Chamada + Frequência + XP) | ✅ Concluído | [Attendance.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/pages/Instructor/Attendance.tsx), [EvolutionEngine.ts](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/engine/EvolutionEngine.ts) |
| **Entrega C** | Sistema de Missões & Entregas (Comum, Requisitada, Blitz, Herói) | ✅ Concluído | [MissionEngine.ts](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/engine/MissionEngine.ts), [MissionBoard.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/components/MissionBoard.tsx), [MissionEditor.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/pages/Instructor/MissionEditor.tsx) |
| **Entrega D** | Assistente de Aula (Gerador local de rascunhos pedagógicos) | ✅ Concluído | [CourseEditor.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/pages/Instructor/CourseEditor.tsx), [docs/adr/0002-assistente-de-aula-nao-chama-llm-do-cliente.md](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/docs/adr/0002-assistente-de-aula-nao-chama-llm-do-cliente.md) |
| **Entrega E** | Portal da Família (Visão do Responsável / `GuardianLink`) | ✅ Concluído | [FamilyPortal.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/pages/Guardian/FamilyPortal.tsx), [database.ts](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/db/database.ts) |
| **Entrega F** | Financeiro Básico (Mensalidades, Status Automático `OVERDUE`) | ✅ Concluído | [Financial.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/pages/Admin/Financial.tsx), [FinancialEngine.ts](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/engine/FinancialEngine.ts) |
| **Entrega G** | Comunicação (Mural de Avisos + Mensagens Diretas Assíncronas) | ✅ Concluído | [AnnouncementBoard.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/components/AnnouncementBoard.tsx), [DirectMessaging.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/components/DirectMessaging.tsx) |
| **Entrega H** | Onboarding de Integração (Avatar + Tutorial + Missão Boas-Vindas) | ✅ Concluído | [OnboardingModal.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/components/OnboardingModal.tsx), [CharacterCreator.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/components/CharacterCreator.tsx), [Home.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/pages/Student/Home.tsx) |
| **Entrega I** | Autenticação com Senha Real (Hash Client-side SHA-256) | ✅ Concluído | [AuthUtils.ts](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/engine/AuthUtils.ts), [AuthContext.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/context/AuthContext.tsx), [Login.tsx](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/src/pages/Login.tsx) |

---

## 4. Problem Statement & Solution Summary

### Problem Statement
A plataforma precisava unir a gestão administrativa e pedagógica escolar (matrícula, diário de classe, notas, financeiro, comunicação, controle de acesso seguro) à mecânica de engajamento baseada em RPG (evolução por XP, missões, onboarding imersivo, avatares e conquistas).

### Solution Overview
Foram desenvolvidas 9 entregas integradas ao motor `EvolutionEngine` existente:
1. **Cadastro Estendido (A):** expansão do perfil de `User` com atributos escolares.
2. **Turma & Chamada (B):** agrupamento dinâmico de estudantes e diário de frequência com garantia de idempotência de XP.
3. **Sistema de Missões (C):** criação e gestão de tarefas no estilo "Mestre de Jogo", com submissões e bônus.
4. **Assistente de Aula (D):** gerador seguro base em templates no frontend para criação agilizada de planos de aula.
5. **Portal da Família (E):** visão exclusiva e somente-leitura para responsáveis por meio do modelo `GuardianLink`.
6. **Financeiro Básico (F):** gestão de faturas com cálculo automático de status atrasado (`computeInvoiceStatus`).
7. **Comunicação (G):** canal central de avisos direcionados e trocas diretas de mensagens entre responsável e instrutor.
8. **Onboarding de Integração (H):** personalização visual, tour explicativo e primeira missão concedida automaticamente.
9. **Autenticação com Senha Real (I):** segurança de acesso por meio de hashing síncrono SHA-256 e gestão administrative de credenciais.

---

## 5. User Stories Consolidadas

### A. Cadastro Estendido
1. Como admin, quero registrar matrícula, data de nascimento, telefone, turma e dados de responsável ao criar/editar um estudante, para manter o cadastro escolar completo.
2. Como estudante, quero ver meus próprios dados cadastrais na minha tela de Perfil (somente leitura).

### B. Turma & Chamada
3. Como instrutor, quero selecionar uma turma (ex: "9º Ano A") e ver a lista de alunos dela, para fazer a chamada do dia.
4. Como instrutor, quero marcar presença/falta de cada aluno numa data, e que a presença conceda XP automaticamente (20 XP).
5. Como instrutor, quero que marcar a mesma presença duas vezes no mesmo dia não conceda XP em dobro por engano (Regra B1).
6. Como estudante, quero ver meu próprio histórico de frequência (presenças/faltas) na minha Ficha Acadêmica.

### C. Sistema de Missões
7. Como instrutor, quero criar uma Missão Comum para toda a minha turma, com título, descrição, prazo e XP.
8. Como instrutor, quero criar uma Missão Requisitada endereçada a um estudante ou subgrupo específico.
9. Como instrutor, quero criar uma Missão Blitz de conclusão imediata, para engajamento rápido em sala.
10. Como instrutor, quero marcar uma Missão como Marco de Herói, exigindo validação manual de cada submissão.
11. Como instrutor, quero uma fila de Submissões pendentes para aprovar/recusar com observações.
12. Como instrutor, quero editar ou encerrar antecipadamente uma Missão.
13. Como instrutor, quero ver quantos estudantes já cumpriram cada Missão.
14. Como estudante, quero ver um Quadro de Missões com as Comuns da minha turma e as Requisitadas para mim.
15. Como estudante, quero marcar uma Missão Blitz como concluída e receber XP imediatamente.
16. Como estudante, quero submeter evidências para Missões que exigem validação e acompanhar o status de aprovação.
17. Como estudante, quero ser notificado visualmente quando uma submissão for aprovada.
18. Como estudante, quero receber bônus de XP ao cumprir todas as Missões Comuns da semana antes do prazo (Regra M3).
19. Como estudante, quero que uma Missão vencida deixe de ser exibida no quadro sem gerar penalidade.
20. Como admin, quero gerenciar Missões de qualquer curso com plenos poderes de instrutor.

### D. Assistente de Aula
21. Como instrutor, quero digitar um tema e formato no Editor de Curso para receber um rascunho de aula gerado automaticamente.

### E. Portal da Família (Responsável)
22. Como admin, quero vincular um usuário do tipo Responsável a um ou mais estudantes através de `GuardianLink`.
23. Como responsável, quero acompanhar a evolução RPG, frequência e notas do(s) meu(s) dependente(s).
24. Como responsável, quero visualizar a situação financeira e faturas do meu dependente.
25. Como responsável, quero que meu acesso seja estritamente somente-leitura (exceto para mensagens).
26. Como responsável vinculado a múltiplos dependentes, quero alternar entre eles em uma mesma conta.

### F. Financeiro Básico
27. Como admin/financeiro, quero lançar mensalidades com valor e vencimento para um estudante.
28. Como admin/financeiro, quero dar baixa manual marcando faturas como pagas.
29. Como admin/financeiro, quero que mensalidades vencidas não pagas sejam identificadas como atrasadas automaticamente (Regra F1).
30. Como responsável, quero visualizar o extrato de faturas do meu dependente com valores e status.
31. Como estudante, **não** devo ter acesso às telas ou informações financeiras no meu portal.

### G. Comunicação
32. Como instrutor/admin, quero publicar avisos para a escola toda ou turmas específicas.
33. Como estudante ou responsável, quero visualizar o mural de avisos aplicáveis ao meu perfil.
34. Como responsável, quero enviar mensagens diretas ao instrutor do meu dependente.
35. Como instrutor, quero receber e responder às mensagens dos responsáveis dos meus alunos.

### H. Onboarding de Integração
36. Como estudante novo, quero escolher um avatar visual para meu personagem no primeiro acesso.
37. Como estudante novo, quero ver um tutorial explicativo do sistema de XP, Marcos e Missões.
38. Como estudante novo, quero receber automaticamente uma "Missão de Boas-Vindas" no primeiro acesso (Regra H1).

### I. Autenticação com Senha Real
39. Como usuário, quero realizar login utilizando e-mail e senha cadastrados no sistema.
40. Como admin, quero poder cadastrar e redefinir senhas dos usuários.

---

## 6. Decisões de Arquitetura & Regras de Negócio

### A. Estrutura de Turmas (Decisão B)
- `schoolClass` permanece como atributo textual simples na interface `User` (ex: `"9º Ano A"`), dispensando a complexidade de uma entidade `Turma` com tabelas dedicadas nesta fase.

### B. Idempotência de Chamada (Regra B1)
- A chave natural `studentId + date` é única em `AttendanceRecord`.
- O parâmetro `xpGranted: boolean` garante que o XP de presença (20 XP) só é concedido uma única vez por dia/aluno, mesmo se a presença for alternada ou remarcada no mesmo dia.

### C. Sistema de Missões (Regras M1 a M6)
- **M1–M5:** Definição de escopos (Comum, Requisitada, Blitz) e controle de validação por instrutor para Marcos de Herói.
- **M6:** O fluxo simplificado de missão sem envio de arquivo/evidência pelo aluno é tratado nativamente pelo tipo `BLITZ` (`requiresValidation: false`), evitando duplicidade de código.

### D. Assistente de Aula (ADR 0002)
- Como a aplicação é 100% client-side (SPA), a geração de rascunhos no `CourseEditor` é realizada localmente por um mecanismo baseado em templates estruturados, prevenindo o vazamento de chaves de API de LLM no navegador.

### E. Portal da Família & `GuardianLink` (Regra E1)
- O relacionamento entre Responsável e Estudantes é gerenciado via entidade explicita `GuardianLink`.
- O papel `GUARDIAN` possui visão exclusivamente somente-leitura sobre os dados do estudante (boletim, frequência, extrato financeiro e progresso RPG).

### F. Status Financeiro Automático (Regra F1)
- O status `'OVERDUE'` de uma `Invoice` não é gravado estaticamente no banco. A função pura `computeInvoiceStatus(invoice, now)` recalcula o status dinamicamente na leitura (`status === 'PENDING' && dueDate < now → 'OVERDUE'`), dispensando tarefas de cron em background.

### G. Audiência de Comunicação (Regra G1)
- Um `Announcement` com `audience: { schoolClass }` é visível exclusivamente para alunos daquela turma e seus respectivos responsáveis vinculados. Avisos com `audience: 'SCHOOL'` são públicos a toda a escola.

### H. Boas-Vindas Idempotentes (Regra H1)
- A missão de boas-vindas do onboarding possui identificador determinístico `welcome-${studentId}`, garantindo que o `MissionEngine` crie a missão uma única vez na jornada do aluno.

### I. Autenticação Client-Side
- O hashing de senhas utiliza `crypto.subtle.digest('SHA-256', ...)`, armazenando `passwordHash` no perfil de usuário.

---

## 7. Decisões de Teste e Qualidade

- **Verificação Estática:** Garantida pela compilação sem erros via TypeScript: `npx tsc -b --noEmit`.
- **Verificação de Build:** Bundle de produção validado via `npm run build`.
- **Seams Recomendados para Testes Automatizados Futuros:**
  1. `EvolutionEngine.grantXp` (Cálculo de XP e deduplicação de marcos).
  2. `Attendance` e Regra B1 (Idempotência de XP na chamada).
  3. `FinancialEngine.computeInvoiceStatus` (Regra F1 de vencimento de faturas).
  4. `MissionEngine.createWelcomeMission` e Regra H1 (Idempotência do onboarding).

---

## 8. Fora de Escopo

- Entidade `Turma`/`Class` completa com gestão de salas, horários e múltiplos professores.
- Integração direta com provedores remotos de LLM (OpenAI/Anthropic) no frontend.
- Fases 2 a 8 do Roadmap do Blueprint (Narrativa RPG persistente, ecossistema multi-agentes de IA, marketplace e multi-tenancy).
- Chat em tempo real via WebSockets (comunicação assíncrona por mensagens diretas mantida em G).
- Processamento real de pagamentos por gateway bancário ou cartão.

---

## 9. Histórico e Manutenção

- Este documento consolida a totalidade dos requisitos e entregas do projeto até a presente data.
- Atualizações de domínio devem ser refletidas em paralelo no arquivo [UBIQUITOUS_LANGUAGE.md](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/UBIQUITOUS_LANGUAGE.md).
- O acompanhamento individual de tarefas finalizadas encontra-se no [tasks.md](file:///x:/Programas/MEUS%20APPs/EducaGameEvolui/tasks.md).
