# Plano de Implementação — Sistema de Missões (Professor → XP → Evolução)

Status: **Proposto** (não implementado ainda — este documento é o plano, a implementação é o próximo passo) · Data: 2026-07-18

Skills consultadas para a produção deste plano: `domain-modeling`, `ubiquitous-language`, `codebase-design`, `to-spec`. A implementação em si (quando autorizada) deve seguir `implement` + `tdd` + `code-review`, na ordem definida em cada skill.

## Pesquisa — Base de Regras do RPG (Blue Phoenix RPG — Rise of the Titans)

Fonte: [Níveis e evolução, Wiki RPG "Rise of the Titans"](https://blue-phoenix-rpg.fandom.com/pt-br/wiki/N%C3%ADveis_e_evolu%C3%A7%C3%A3o), complementada pelas páginas de Legado e Organizações do mesmo wiki.

Mecânicas relevantes identificadas, e sua tradução para o nosso domínio educacional:

| Mecânica do RPG pesquisado | Como funciona lá | Tradução para a Plataforma de Ensino |
|---|---|---|
| **Dualidade de conquistas** | Subir de nível exige tanto crescimento pessoal quanto contribuição para algo maior que o indivíduo; um sem o outro limita a evolução | Já implementado como **Marco Pessoal** vs **Marco de Herói** — as Missões precisam alimentar os dois, não só um |
| **Marco nunca conta duas vezes; todo marco gera um "feito"** | Conquistas são únicas e sempre rastreadas | Já é uma invariante do `EvolutionEngine` (dedup por `source` + `relatedEntityId`) — as Missões devem reusar essa mesma trilha, não criar uma paralela |
| **Três tipos de missão: Comuns, Requisitadas e Blitz** | Comuns são semanais e para todos; Requisitadas são compromissos individuais; Blitz são curtas e recompensam rápido | Adotamos os três tipos tal qual: **Missão Comum** (turma toda, semanal), **Missão Requisitada** (aluno ou grupo específico), **Missão Blitz** (curta, alto XP, engajamento imediato) |
| **Lista de tarefas semanal do "Legado"**: quantidade escala com o nível atual, curada por um administrador, reseta toda semana, e cumprir a lista inteira antes do prazo conta em dobro | Cria ritmo semanal e recompensa quem termina cedo | O **Quadro de Missões** de uma turma é curado pelo Instrutor, reseta semanalmente, e cumprir todas as Missões Comuns da semana concede um **bônus de conclusão total** (ver Regra de Negócio 3 abaixo) |
| **Especificações (skill trees) até nível 3 são autônomas; níveis 4–5 exigem um "mestre" para validar** | Conquistas de maior peso exigem supervisão humana, não são automáticas | Missões de alto valor (que gerariam **Marco de Herói**) exigem **Validação do Instrutor** antes de conceder XP — proteção contra autodeclaração indevida, análogo a um professor corrigindo uma prova |
| **Ações pequenas e específicas concedem XP fixo e imediato** (ex.: 25 XP por uma ação social simples) | Recompensa rápida para ações de baixo esforço/alta frequência | **Missão Blitz** usa XP fixo, concedido automaticamente ao ser marcada como concluída — sem fila de validação, para manter o ritmo |
| **Evolução dentro de uma organização usa uma fórmula própria (pontos = 2× nível atual), separada da evolução geral** | Mecanismo de progressão paralelo e independente, mas coerente com o nível geral | Decidimos **não** replicar isso agora — ver seção "Fora de Escopo". O padrão nos mostra que é seguro ter progressões paralelas no futuro (ex. por matéria), mas isso é uma spec própria, não parte deste plano |

## Problem Statement

O plano de negócio da plataforma é "ensinar brincando": o professor precisa conseguir propor atividades (em sala ou para casa) que o aluno cumpre e que geram XP e evolução do Personagem RPG. Hoje, o Motor de Evolução já concede XP por aula assistida, aula concluída, exercício aprovado, nota alta, projeto e streak — mas **não existe nenhum jeito do professor propor uma atividade nova, específica, com prazo, e ligá-la ao sistema de evolução.** Todo o conteúdo de XP hoje vem de estruturas fixas do curso (aulas/exercícios pré-cadastrados) ou de hábitos genéricos (login diário). Falta a peça central do modelo de negócio: **o professor como "mestre de jogo" da turma**, propondo desafios.

## Solution

Introduzir a entidade **Missão**, criada por um Instrutor, associada a um Curso e (opcionalmente) a estudantes específicos, com prazo e valor de XP próprios. O estudante vê suas Missões ativas num **Quadro de Missões**, cumpre e registra uma **Submissão**; se a Missão for de alto valor, a Submissão fica pendente até o Instrutor validar (equivalente a corrigir uma tarefa); ao ser aprovada, o **mesmo** `EvolutionEngine` já existente concede XP e cria um Marco — sem duplicar a lógica de evolução, apenas uma nova *fonte* de Marco.

## User Stories

**Como Instrutor:**

1. Como instrutor, quero criar uma Missão Comum para toda a minha turma, com título, descrição, prazo e valor de XP, para propor uma atividade coletiva da semana.
2. Como instrutor, quero criar uma Missão Requisitada endereçada a um estudante específico (ou a um subconjunto da turma), para propor reforço individual.
3. Como instrutor, quero criar uma Missão Blitz de curta duração e conclusão automática, para engajar a turma rapidamente numa atividade pontual em sala.
4. Como instrutor, quero marcar uma Missão como "de alto valor" (gera Marco de Herói), sabendo que isso exigirá minha validação manual de cada submissão antes do XP ser concedido.
5. Como instrutor, quero ver uma fila de Submissões pendentes de validação, com o conteúdo enviado pelo aluno, para aprovar ou recusar cada uma com uma observação.
6. Como instrutor, quero editar ou encerrar antecipadamente uma Missão que criei, caso o prazo ou o conteúdo precisem mudar.
7. Como instrutor, quero ver quantos estudantes já cumpriram cada Missão, para saber se a turma está engajada ou se preciso agir.
8. Como instrutor, quero que apenas eu (ou um Admin) possa criar/editar Missões do meu curso — não outro instrutor nem um aluno.

**Como Estudante:**

9. Como estudante, quero ver um Quadro de Missões com todas as Missões ativas para mim (Comuns da minha turma + Requisitadas para mim), para saber o que fazer.
10. Como estudante, quero ver claramente o prazo e o XP de cada Missão antes de me comprometer.
11. Como estudante, quero marcar uma Missão Blitz como concluída e receber o XP imediatamente, sem espera.
12. Como estudante, quero submeter uma evidência (texto, ou uma nota) para Missões que exigem validação, e ver o status (pendente/aprovada/recusada) da minha submissão.
13. Como estudante, quero ser notificado (visualmente, como já ocorre no level up) quando uma submissão minha for aprovada e eu ganhar XP/marco por ela.
14. Como estudante, quero que cumprir todas as Missões Comuns da semana antes do prazo me dê um bônus extra de XP, incentivando eu não deixar para a última hora.
15. Como estudante, quero que uma Missão vencida (prazo expirado, não cumprida) simplesmente desapareça do meu Quadro de Missões ativo, sem me penalizar retroativamente.

**Como Admin:**

16. Como admin, quero poder ver e gerenciar Missões de qualquer curso, com os mesmos poderes de um instrutor, para dar suporte quando necessário.

## Implementation Decisions

### Modelo de domínio (novos tipos em `src/types/index.ts`)

- **`Mission`**: `id`, `courseId`, `instructorId`, `instructorName`, `title`, `description`, `type: 'COMMON' | 'REQUESTED' | 'BLITZ'`, `xpReward: number`, `milestoneType: 'PERSONAL' | 'HERO'`, `requiresValidation: boolean`, `targetStudentIds?: string[]` (obrigatório e não-vazio apenas quando `type === 'REQUESTED'`), `availableFrom: string`, `dueAt: string`, `relatedLessonId?: string`, `createdAt: string`, `closedEarly?: boolean`.
- **`MissionSubmission`**: `id`, `missionId`, `studentId`, `status: 'PENDING' | 'APPROVED' | 'REJECTED'`, `evidenceText?: string`, `submittedAt: string`, `reviewedAt?: string`, `reviewNote?: string`.
- **`Milestone.source`** ganha um novo valor de união: `'mission_completed'`.
- Regra de invariante (herdada do domínio já existente): uma `MissionSubmission` aprovada gera **exatamente um** Marco, nunca dois, mesmo se o Instrutor reabrir/revalidar por engano — reaproveitar o mesmo padrão de dedup por `relatedEntityId` (aqui, o id da Missão) já usado em `grantXp`.

### Motor de Missões (`src/engine/MissionEngine.ts`) — novo módulo, seam próprio

Seguindo o vocabulário de `codebase-design`: este é um **módulo profundo** novo — interface pequena, regras de elegibilidade/prazo/validação escondidas atrás dela. Ele **não duplica** a matemática de XP/nível: delega para o `EvolutionEngine` existente, que ganha uma nova `activity: 'mission_completed'` em `grantXp`, capaz de aceitar um valor de XP **variável** (vindo da própria Missão) em vez dos valores fixos por constante que as demais atividades usam hoje. Essa é a única mudança de assinatura necessária no `EvolutionEngine`.

Interface proposta do `MissionEngine`:

- `getMissionBoard(missions, submissions, student): Mission[]` — Comuns do curso do aluno + Requisitadas endereçadas a ele, dentro da janela `availableFrom`–`dueAt`, excluindo já submetidas/expiradas.
- `submitMission(mission, student, evidenceText?): MissionSubmission` — cria a submissão; se `requiresValidation` for falso (típico de Blitz), retorna já como `APPROVED` e delega a concessão de XP.
- `reviewSubmission(submission, decision, note?): { submission, xpGrantResult? }` — usado pelo Instrutor; ao aprovar, chama `grantXp(character, 'mission_completed', {..., xpOverride: mission.xpReward})`.
- `isMissionExpired(mission): boolean`.
- `getWeeklyCompletionBonus(missions, submissions, student): number` — implementa a Regra de Negócio 3 (ver abaixo).

### Regras de Negócio específicas (derivadas da pesquisa)

1. **Blitz não exige validação por padrão** (`requiresValidation: false`) — prioriza ritmo sobre controle, como o "feito rápido" de 25 XP do RPG pesquisado.
2. **Missões de valor alto (`milestoneType: 'HERO'`) exigem `requiresValidation: true` obrigatoriamente** — a UI de criação de Missão deve forçar essa combinação, não deixar o instrutor escolher "Herói sem validação".
3. **Bônus de conclusão total da semana**: se um estudante submeter (e tiver aprovadas, quando aplicável) **todas** as Missões Comuns disponíveis na semana corrente antes do prazo da última, ele recebe um bônus de XP igual à soma do XP de todas elas (ou seja, "dobra" o total da semana) — tradução direta da regra de Legado pesquisada ("cumprir a lista inteira conta em dobro").
4. **Missão Requisitada nunca aparece para quem não é alvo** — mesmo que pertença ao mesmo curso.
5. **Missão vencida some do Quadro, mas a Submissão (se houver) mantém seu histórico** — nada é apagado, só deixa de aparecer como "ativo".

### UI / Seams de navegação

- Nova pasta `src/pages/Instructor/` (hoje só existe `Admin/`, reaproveitado pelo papel `INSTRUCTOR` via as mesmas telas) — `MissionEditor.tsx` (CRUD de Missões do curso + fila de validação de Submissões).
- Novo componente `src/components/MissionBoard.tsx`, para a tela do estudante, no mesmo espírito visual do `DailyDashboard.tsx` já existente (reaproveitar padrões de cartão/badge de status).
- Duas novas abas no roteamento por `activeTab` do `App.tsx` (mesmo padrão hoje usado para `'grade-book'`, `'course-editor'` etc.): `'mission-board'` (estudante) e `'mission-editor'` (instrutor/admin), adicionadas ao `DashboardLayout` conforme o `role` do usuário.
- Toast de aprovação de Submissão reaproveita o `EvolutionToast` já existente (mesmo componente do level up).

### Persistência

- Seguir o padrão já existente em `src/db/database.ts` e `src/db/seedData.ts` (localStorage + funções `get/add/update`) — adicionar `missions` e `missionSubmissions` como novas coleções, do mesmo jeito que `courses`/`users` já funcionam. Nenhuma mudança de infraestrutura (sem backend novo) é necessária para este plano.

## Testing Decisions

- O projeto ainda não tem framework de testes (ver `SPEC.md` anterior). Como o `MissionEngine` proposto é um conjunto de funções puras (recebe dados, devolve dados — sem I/O), ele é o seam ideal para introduzir testes automatizados pela primeira vez no projeto, caso a equipe decida priorizar isso junto desta feature.
- Se um framework for adotado, os testes de maior valor são: dedup de Marco por Missão (não gerar dois marcos pela mesma submissão), a regra do bônus de conclusão semanal, e a obrigatoriedade de validação para Missões tipo Herói.
- Sem framework, a verificação mínima aceitável na implementação é `npx tsc -b --noEmit` limpo (mesmo padrão usado na correção anterior) e uma passada manual pelos fluxos das User Stories 1–16 acima.

## Out of Scope (deste plano)

- Progressão paralela por matéria/organização (a fórmula "pontos = 2× nível" do RPG pesquisado) — interessante como referência futura, não faz parte desta entrega.
- Notificações push/e-mail para o aluno quando uma Missão nova é criada — fica só visível no Quadro de Missões por enquanto.
- Edição em lote de Missões (duplicar para múltiplas turmas de uma vez).
- Adicionar framework de testes ao projeto como um todo (só o seam é recomendado, não a adoção geral).

## Further Notes

- Este plano preserva 100% do que já existe: o loop diário (streak, tarefas diárias, bônus de login) continua exatamente como está — Missões são uma camada nova, não uma substituição (ver ADR `docs/adr/0001-missoes-semanais-sobre-evolucao-diaria.md`).
- O `UBIQUITOUS_LANGUAGE.md` já foi atualizado com os termos deste plano (`Missão`, `Missão Comum/Requisitada/Blitz`, `Submissão`, `Validação do Instrutor`, `Quadro de Missões`), incluindo a ambiguidade sinalizada entre Missão e Tarefa Diária.
- Próximo passo, quando autorizado: seguir o skill `/implement` (que por sua vez indica `/tdd` nos seams definidos acima, checagem de tipos regular, e `/code-review` antes do commit final).
