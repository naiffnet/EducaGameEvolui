# Plano de Implementação — Turmas, Chamada, Missões e Assistente de Aula

Status: **Proposto** (não implementado ainda) · Data: 2026-07-18

> **Nota de consolidação:** este documento substitui e unifica dois planos que surgiram em paralelo, em sessões diferentes, para a mesma necessidade de negócio: `PLANO_IMPLEMENTACAO_MISSOES.md` (produzido aqui, com pesquisa de mecânicas de RPG) e `implementation_plan1`/`task1` (produzidos por outra ferramenta, localmente). Os três arquivos antigos foram removidos deste repositório em favor deste único documento. Nenhum dos dois planos havia sido implementado em código até esta consolidação — não houve retrabalho, só reconciliação de escopo.

Skills consultadas: `domain-modeling`, `ubiquitous-language`, `codebase-design`, `to-spec`. A implementação (quando autorizada) deve seguir `implement` + `tdd` nos seams indicados + `code-review` antes do commit.

## Pesquisa — Base de Regras do RPG (Blue Phoenix RPG — Rise of the Titans)

Fonte: [Níveis e evolução, Wiki RPG "Rise of the Titans"](https://blue-phoenix-rpg.fandom.com/pt-br/wiki/N%C3%ADveis_e_evolu%C3%A7%C3%A3o), complementada pelas páginas de Legado e Organizações do mesmo wiki. (Mantida do plano original — nenhuma mudança nesta seção.)

| Mecânica do RPG pesquisado | Como funciona lá | Tradução para a Plataforma de Ensino |
|---|---|---|
| **Dualidade de conquistas** | Subir de nível exige crescimento pessoal *e* contribuição para algo maior | Já implementado como **Marco Pessoal** vs **Marco de Herói** — Missões e Chamada precisam alimentar os dois |
| **Marco nunca conta duas vezes; todo marco gera um "feito"** | Conquistas são únicas e sempre rastreadas | Invariante já existente no `EvolutionEngine` (dedup por `source` + `relatedEntityId`) — Missões e Chamada reusam essa trilha |
| **Três tipos de missão: Comuns, Requisitadas e Blitz** | Comuns são semanais e para todos; Requisitadas são compromissos individuais; Blitz são curtas e recompensam rápido | **Missão Comum** (turma toda), **Missão Requisitada** (aluno/grupo específico), **Missão Blitz** (curta, XP imediato, sem fila de validação) |
| **Lista semanal do "Legado"**: curada por um administrador, reseta toda semana, cumprir a lista inteira antes do prazo conta em dobro | Cria ritmo e recompensa quem termina cedo | O **Quadro de Missões** é curado pelo Instrutor; cumprir todas as Comuns da semana concede bônus (Regra de Negócio M3) |
| **Níveis 4–5 de uma especificação exigem um "mestre" para validar** | Conquistas de maior peso exigem supervisão humana | Missões de alto valor exigem **Validação do Instrutor** antes do XP — mesmo princípio agora também aplicado à Chamada (só o professor pode registrar presença, o aluno não se autodeclara presente) |
| **Ações pequenas e específicas concedem XP fixo e imediato** (ex.: 25 XP) | Recompensa rápida, baixo esforço, alta frequência | **Chamada/Presença** usa exatamente esse padrão: XP fixo (20), concedido no ato, sem fila — é o hábito de "vir à aula", análogo ao "Bônus de Login" já existente para o hábito de "logar todo dia" |

## Problem Statement

O plano de negócio é uma plataforma que atende **todas as necessidades de uma escola**: não só o conteúdo dos cursos, mas a rotina real de professor e aluno — cadastro completo do aluno, controle de frequência, atividades propostas pelo professor (em sala ou para casa) que viram XP, e apoio à criação de aulas. Hoje o Motor de Evolução já cobre aulas, exercícios, notas, projetos e streak — mas falta:

1. **Cadastro escolar completo** — o `User` só tem nome/e-mail/papel, sem matrícula, turma, data de nascimento ou responsável.
2. **Controle de frequência** — não existe registro de presença, que é uma obrigação básica de qualquer escola.
3. **O professor como "mestre de jogo"** — nenhum jeito dele propor uma atividade nova (a peça central do plano de negócio: "aprender jogando").
4. **Apoio à criação de conteúdo** — montar uma aula do zero é o maior custo de tempo de um professor.

## Solution

Quatro entregas complementares, todas alimentando o mesmo `EvolutionEngine` já existente (sem duplicar a lógica de XP/nível/marco):

- **A. Cadastro Estendido** — novos campos administrativos no `User`.
- **B. Turma & Chamada** — agrupamento leve por turma + registro de presença com XP automático.
- **C. Sistema de Missões** — o professor como mestre de jogo (mantido do plano original, com um ajuste de unificação — ver Regra de Negócio M6).
- **D. Assistente de Aula** — apoio à criação de conteúdo no `CourseEditor`, com uma ressalva arquitetural importante (ver Implementation Decisions, item D).

## User Stories

### A. Cadastro Estendido

1. Como admin, quero registrar matrícula, data de nascimento, telefone, turma e dados de um responsável ao criar/editar um estudante, para manter o cadastro escolar completo.
2. Como estudante, quero ver meus próprios dados cadastrais na minha tela de Perfil (somente leitura).

### B. Turma & Chamada

3. Como instrutor, quero selecionar uma turma (ex: "9º Ano A") e ver a lista de alunos dela, para fazer a chamada do dia.
4. Como instrutor, quero marcar presença/falta de cada aluno numa data, e que presença conceda XP automaticamente ao aluno.
5. Como instrutor, quero que marcar a mesma presença duas vezes no mesmo dia não conceda XP em dobro por engano.
6. Como estudante, quero ver meu próprio histórico de frequência (presenças/faltas) na Ficha Acadêmica já existente.

### C. Sistema de Missões (mantidas do plano original, com pequenos ajustes de numeração)

7. Como instrutor, quero criar uma Missão Comum para toda a minha turma, com título, descrição, prazo e XP.
8. Como instrutor, quero criar uma Missão Requisitada endereçada a um estudante ou subgrupo específico.
9. Como instrutor, quero criar uma Missão Blitz de conclusão imediata, para engajamento rápido em sala.
10. Como instrutor, quero marcar uma Missão como de alto valor (Marco de Herói), sabendo que isso exige validação manual de cada submissão.
11. Como instrutor, quero uma fila de Submissões pendentes para aprovar/recusar com uma observação.
12. Como instrutor, quero editar ou encerrar antecipadamente uma Missão.
13. Como instrutor, quero ver quantos estudantes já cumpriram cada Missão.
14. Como estudante, quero ver um Quadro de Missões com as Comuns da minha turma + Requisitadas para mim.
15. Como estudante, quero marcar uma Missão Blitz como concluída e receber XP na hora.
16. Como estudante, quero submeter uma evidência para Missões que exigem validação, e acompanhar o status.
17. Como estudante, quero ser avisado (visualmente, como no level up) quando uma submissão for aprovada.
18. Como estudante, quero que cumprir todas as Comuns da semana antes do prazo me dê um bônus de XP.
19. Como estudante, quero que uma Missão vencida some do meu Quadro sem me penalizar.
20. Como admin, quero gerenciar Missões de qualquer curso com os mesmos poderes de um instrutor.

### D. Assistente de Aula

21. Como instrutor, quero digitar um tema e escolher um formato (vídeo/roteiro, texto, exercício) no Editor de Curso, e receber um rascunho de aula gerado automaticamente para editar, em vez de partir da página em branco.

## Implementation Decisions

### A. Cadastro Estendido — modelo de dados

`User` ganha campos **opcionais** (não quebra usuários existentes no seed): `registrationId` (matrícula), `birthDate`, `phoneNumber`, `schoolClass` (ex: `"9º Ano A"`), `guardianName`, `guardianPhone`. Exibidos em `UserManagement.tsx` (edição pelo admin) e em `Profile.tsx` (leitura pelo próprio usuário) — exatamente como o plano original propunha, sem mudanças.

### B. Turma & Chamada — modelo de dados e motor

- **Decisão deliberada de escopo:** *não* criar uma entidade `Turma`/`Class` completa agora. `schoolClass` continua sendo uma string simples em `User` (como já decidido em A), e "a turma" é definida, na prática, por "todo `User` com `role === 'STUDENT'` e o mesmo `schoolClass`". Isso evita construir uma segunda hierarquia de agrupamento (Curso já existe) antes de haver sinal real de que ela é necessária. Se no futuro uma turma precisar ter horário, sala, ou múltiplos professores, isso vira uma spec própria.
- **`AttendanceRecord`**: `id`, `studentId`, `schoolClass`, `date` (string `YYYY-MM-DD`), `present: boolean`, `recordedByInstructorId`, `recordedAt`.
- **Regra de Negócio B1 (idempotência):** a chave natural `studentId + date` é única — registrar a chamada do mesmo aluno na mesma data **atualiza** o registro existente (não duplica), e o XP só é concedido na **primeira vez** que aquele dia vira `present: true` para aquele aluno. Isso resolve diretamente a User Story 5 e evita o bug clássico de "professor clicou duas vezes".
- **XP de Chamada**: nova constante `XP_ATTENDANCE = 20` em `EvolutionEngine.ts`, concedida via um novo valor de `activity` em `grantXp`: `'attendance_confirmed'`. Gera um Marco Pessoal (frequência é um hábito individual, não uma contribuição coletiva — mantém a dualidade Pessoal/Herói coerente).
- **UI**: aba "Chamada" dentro da área do Instrutor (ver seção de navegação abaixo), reaproveitando a lista de alunos já obtida em `UserManagement`/`GradeBook` filtrada por `schoolClass`.

### C. Sistema de Missões — sem mudanças de fundo, mais uma regra de unificação

O modelo (`Mission`, `MissionSubmission`, `MissionEngine`) é o mesmo já detalhado na pesquisa acima. Adiciona-se uma regra que só ficou clara ao comparar com o plano paralelo:

- **Regra de Negócio M6 (nova):** o fluxo mais simples do plano paralelo — professor cria uma missão e ele mesmo marca "concluída" pelo aluno, sem submissão do aluno — **é coberto pela Missão Blitz** (`requiresValidation: false`), e não precisa de um caminho de código separado. Ou seja: **"Missão simples" não é um quarto tipo**, é o mesmo modelo com `type: 'BLITZ'`. Isso evita ter duas implementações de "completar missão" fazendo a mesma coisa.

Demais regras (M1–M5), interface do `MissionEngine`, tipos e seams de UI: **inalterados** em relação ao plano original (ver histórico do arquivo `PLANO_IMPLEMENTACAO_MISSOES.md` no commit `2ae5589`, se precisar consultar a versão anterior).

### D. Assistente de Aula — ressalva arquitetural importante

O plano paralelo propunha o professor digitar um tema e a IA gerar a aula completa. **Antes de implementar isso literalmente, uma decisão de arquitetura precisa ser tomada** — por isso registrei como ADR (`docs/adr/0002-assistente-de-aula-nao-chama-llm-do-cliente.md`): este projeto é 100% front-end (Vite + localStorage, sem backend). Chamar uma API de LLM (OpenAI/Anthropic/etc.) diretamente do navegador exigiria expor uma chave de API no bundle JavaScript — **qualquer pessoa que abrir o DevTools veria a chave**, o que é uma falha de segurança grave e não deve ser feito.

**Recomendação para este plano:** implementar a UI do Assistente (campo de tema, seletor de formato, botão "Gerar", preview, "Aplicar ao formulário") já agora, mas com um **gerador local baseado em template** (sem chamada de rede) como primeira versão — suficiente para validar a experiência do professor. A integração com um LLM de verdade fica *fora de escopo deste plano* até existir um backend (ainda que seja só uma função serverless que guarde a chave do lado do servidor).

### Navegação / Seams de UI (unificando os dois planos)

O plano paralelo propunha encaixar Chamada e Missões como abas dentro do `Admin/Dashboard.tsx` existente. Prefiro manter a decisão já tomada no plano original: criar `src/pages/Instructor/` (hoje só existe `Admin/`, reaproveitado genericamente pelo papel `INSTRUCTOR`) com abas próprias — **Visão Geral**, **Chamada**, **Missões** — deixando `Admin/Dashboard.tsx` como está, focado em métricas de sistema. Motivo: `Dashboard.tsx` hoje serve tanto `ADMIN` quanto `INSTRUCTOR`; turma e chamada são conceitos **só de instrutor**, então merecem seu próprio lugar, não um `if (role === 'INSTRUCTOR')` espalhado dentro de uma tela pensada para admin.

- `src/pages/Instructor/Dashboard.tsx` — abas "Visão Geral / Chamada / Missões".
- `src/pages/Instructor/MissionEditor.tsx` — CRUD de Missões + fila de validação (conforme plano original).
- `src/components/MissionBoard.tsx` — widget do aluno (Home.tsx), no mesmo espírito visual do `DailyDashboard.tsx`.
- `src/components/AttendanceHistory.tsx` — pequeno bloco na `AcademicHistory.tsx` do aluno, mostrando presenças/faltas.
- Novas abas em `activeTab` no `App.tsx`: `'instructor-attendance'`, `'mission-board'`, `'mission-editor'` — mesmo padrão de roteamento já usado hoje.
- Assistente de Aula entra dentro do `CourseEditor.tsx` existente, como uma seção colapsável — não precisa de rota própria.

### Persistência

Sem mudança de infraestrutura: `attendanceRecords`, `missions`, `missionSubmissions` como novas coleções em `src/db/database.ts`/`seedData.ts`, seguindo exatamente o padrão já usado por `courses`/`users`.

## Testing Decisions

- Sem framework de testes no projeto ainda (ver `SPEC.md`). Os seams de maior valor para testes futuros, em ordem de prioridade: (1) idempotência da Chamada (Regra B1), (2) dedup de Marco por Missão, (3) obrigatoriedade de validação em Missões tipo Herói, (4) bônus de conclusão semanal.
- Verificação mínima sem framework: `npx tsc -b --noEmit` limpo + passada manual pelas User Stories 1–21.
- O Assistente de Aula (item D), por não fazer chamada de rede na v1 (gerador local), não tem risco de custo/latência a testar — é só uma função pura de template, mesmo seam de teste que os demais.

## Out of Scope (deste plano)

- Entidade `Turma`/`Class` completa (com horário, sala, múltiplos professores) — decisão B, acima.
- Integração real com um provedor de LLM para o Assistente de Aula — decisão D e ADR 0002, acima.
- Progressão paralela por matéria/organização (fórmula "pontos = 2× nível" do RPG pesquisado).
- Notificações push/e-mail.
- Edição em lote de Missões entre turmas.
- Adoção de um framework de testes para o projeto inteiro (só os seams são recomendados).

## Further Notes

- Este plano preserva 100% do loop diário já existente (streak, tarefas diárias, login) — ver `docs/adr/0001-missoes-semanais-sobre-evolucao-diaria.md`.
- `UBIQUITOUS_LANGUAGE.md` foi atualizado com os termos de Turma, Chamada, Presença e Assistente de Aula, além dos termos de Missões já existentes.
- Os arquivos `PLANO_IMPLEMENTACAO_MISSOES.md`, `task1` e `implementation_plan1` foram removidos por estarem consolidados aqui.
- Próximo passo, quando autorizado: `/implement`, começando pela entrega **B (Turma & Chamada)** por ser a de menor complexidade e maior valor imediato (frequência é operação básica de escola), seguida de **C (Missões)**, depois **A** e **D**.
