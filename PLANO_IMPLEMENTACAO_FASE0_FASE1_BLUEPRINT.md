# Plano de Implementação — Fase 0 (Fundação) + Fase 1 (MVP) do Blueprint

Status: **Proposto** · Data: 2026-07-21
Fonte: `docs/blueprint/Construcao_do_Projeto_Educacional_Primeira_Etapa.pdf` (319 páginas, anexado pelo usuário)
Skills consultadas: `domain-modeling`, `ubiquitous-language`, `codebase-design`, `to-spec`.

## Nota Metodológica — leia isto antes do resto do plano

Antes de detalhar o plano, preciso relatar com precisão o que o documento anexado realmente é, porque isso muda o que significa "obedecer" a ele.

O arquivo se autodenomina **"BLUEPRINT MASTER — Documento 000 — Constituição do Projeto"**. Nas suas próprias seções 6 e 7, ele explica que será construído em **10 volumes progressivos** (Visão do Produto, Requisitos Funcionais, Arquitetura de Software, Banco de Dados, Plataforma Pedagógica, Motor de RPG, IA, UX/UI, APIs, Infraestrutura) — e o que foi anexado corresponde ao volume de **visão e constituição**, não aos volumes de requisitos funcionais detalhados ou modelo de dados completo, que o próprio documento declara ainda não terem sido escritos.

Confirmei isso na prática: busquei no texto inteiro por termos centrais da Fase 1 (Matrícula, Diário de Classe, Boletim, Financeiro, Portal do Estudante, Comunicação) e, com exceção de um punhado de menções de contexto mais amplo, cada um deles aparece **exatamente uma ou duas vezes**, sempre como item de lista (ex: "Fase 1 — MVP inclui: [...] boletim [...]"), nunca com regras de negócio, campos, fluxos ou critérios de aceitação — porque isso é explicitamente o conteúdo prometido para o "Volume II — Requisitos Funcionais", que ainda não existe.

O próprio documento termina dizendo isso, quase literalmente. Na conclusão (final do Capítulo 27), ele afirma que esta é **"a primeira macrofase de documentação"** e recomenda explicitamente, antes de escrever qualquer código, uma **"Fase 2 do Blueprint"** com pelo menos 7 documentos adicionais: Arquitetura de Domínio (DDD), Especificação Completa do Banco de Dados, Especificação de APIs, Game Design Document completo, Especificação dos Agentes de IA, Manual de UX/UI por tela, e Especificação Técnica por Módulo.

**O que isso significa para este plano:** não vou tentar planejar as 27 seções do documento (isso incluiria multi-tenancy real, arquitetura de microsserviços, um ecossistema de 12+ agentes de IA, motor narrativo com mundo persistente, marketplace de plugins — coisas que pertencem, pelo **próprio roadmap do documento** (§27.3), às Fases 2 a 8, muito além do que uma SPA React/TypeScript com `localStorage` e sem backend pode honestamente suportar hoje). Em vez disso, este plano obedece à parte do documento que é genuinely acionável agora: a seção **27.3 — Roadmap de Evolução**, que define exatamente **Fase 0 — Fundação** e **Fase 1 — MVP** — a mesma fronteira sugerida pelo nome do arquivo anexado ("Primeira Etapa"). Fases 2–8 ficam explicitamente fora de escopo (ver seção correspondente abaixo).

## Pesquisa — O Que o Documento Define (extraído, não inventado)

### Roadmap oficial (§27.3)
- **Fase 0 — Fundação:** arquitetura base, autenticação, gestão de usuários, infraestrutura, CI/CD, observabilidade.
- **Fase 1 — MVP:** ERP Escolar essencial, matrículas, diário de classe, boletim, financeiro básico, comunicação, portal do estudante.
- (Fases 2–8 — Learning Engine, Gamificação, Narrative Engine, IA, Marketplace, Analytics, Plataforma Global — fora de escopo aqui, ver seção própria.)

### Atores do Sistema (§3.3)
O documento define 9 atores primários: **Estudante**, **Professor**, **Responsável** (legal e/ou financeiro, com "Portal da Família"), **Coordenação Pedagógica**, **Secretaria**, **Financeiro**, **Direção**, **Administrador da Plataforma**, e **IA Educacional** (consultivo). Nosso sistema atual tem 4 papéis (`STUDENT`, `INSTRUCTOR`, `ADMIN`, `MAINTENANCE`) — falta especificamente o **Responsável**, que é o único ator de Fase 1 sem nenhuma representação hoje.

### Ciclo de Vida do Estudante (§3.6)
Cinco fases: Descoberta → **Matrícula** (cadastro, documentação, contrato, financeiro, criação da conta) → **Integração** (criação do personagem, escolha de avatar, tutorial, apresentação da escola, primeira missão) → Jornada Acadêmica → Conclusão. A fase de Integração é onde estamos mais incompletos: criamos o personagem na matrícula, mas não há escolha de avatar, tutorial ou missão de boas-vindas automática.

### Entidades relevantes para Fase 1 (§12.4)
`Usuário` (id, nome, e-mail, CPF, data de nascimento, status, foto, preferências, idioma), `Papel` (múltiplos papéis por usuário), `Turma` (série, turno, calendário, professor responsável, capacidade, status). Note que `Papel` no documento é **many-to-many** (um usuário pode ter vários papéis) — nosso `User.role` atual é um único valor; isso é uma divergência real que vale registrar (ver Regras de Negócio abaixo).

### Formato de User Story e critério de priorização (§27.4–27.5)
O documento usa o formato `Como [perfil], quero [objetivo], para [benefício]` e prioriza por valor pedagógico, valor para o usuário, impacto estratégico, dependências técnicas, custo e risco. Uso o mesmo formato abaixo.

### Princípio-guia (§1, conclusão)
O documento define um filtro central para qualquer funcionalidade: **"Esta funcionalidade melhora a aprendizagem, o engajamento e a gestão escolar de forma mensurável?"** — uso esse critério para justificar o que entra e o que fica de fora deste plano.

## Auditoria — O Que Já Existe no Projeto vs. O Que Falta

Como já implementamos boa parte da Fase 0/1 ao longo das entregas anteriores deste projeto, o trabalho real deste plano é fechar as lacunas, não recomeçar do zero.

| Item (Fase 0/1 do Blueprint) | Status atual | Onde |
|---|---|---|
| Arquitetura base | 🟡 Existe, mas é SPA + `localStorage`, não a arquitetura em camadas/microsserviços do Blueprint (decisão já registrada, ver ADRs 0001–0003) | todo o projeto |
| Autenticação | 🟡 Existe (login por usuário), mas sem hash de senha real | `AuthContext.tsx` |
| Gestão de usuários (RBAC) | ✅ Completo para os 4 papéis atuais | `UserManagement.tsx` |
| Infraestrutura / CI-CD / Observabilidade | ❌ Fora de escopo realista (sem backend próprio); existe apenas o workflow de deploy no GitHub Pages | `.github/workflows/deploy.yml` |
| ERP Escolar essencial | 🟡 Parcial — Cadastro Estendido e Matrículas cobertos; RH/Biblioteca/Transporte/Estoque (Camada Institucional completa) intencionalmente fora, pois não são Fase 1 | `UserManagement.tsx` |
| Matrículas | ✅ Completo (cadastro, matrícula por curso, cancelamento, conclusão) | `UserManagement.tsx`, `AcademicRecord` |
| Diário de Classe | ✅ Completo (nossa Chamada) | `Instructor/Attendance.tsx` |
| Boletim | ✅ Completo (Livro de Notas + Histórico Acadêmico) | `GradeBook.tsx`, `AcademicHistory.tsx` |
| Financeiro básico | ❌ **Não existe** | — |
| Comunicação | ❌ **Não existe** | — |
| Portal do Estudante | ✅ Completo (Home, Perfil, Quadro de Missões, Histórico) | `Student/Home.tsx` e afins |
| Responsável / Portal da Família | ❌ **Não existe** (temos só `guardianName`/`guardianPhone` como texto inerte) | `types/index.ts` |
| Avatar + Tutorial + Missão de boas-vindas (Integração, §3.6) | ❌ **Não existe** | — |

**Conclusão da auditoria:** o trabalho novo deste plano são 4 entregas — **E) Portal da Família**, **F) Financeiro Básico**, **G) Comunicação**, **H) Onboarding de Integração** — mais um item transversal de robustez (**I) Autenticação com senha real**), numeradas em sequência às entregas A–D já concluídas.

## Solução

Quatro entregas de produto + uma de robustez técnica, cada uma alimentando o mesmo modelo de dados e `EvolutionEngine`/padrões já estabelecidos, sem introduzir uma segunda forma de fazer a mesma coisa.

## User Stories

*(formato do próprio documento: Como [perfil], quero [objetivo], para [benefício])*

### E. Portal da Família (Responsável)

1. Como administrador, quero vincular um usuário do tipo Responsável a um ou mais estudantes, para que ele possa acompanhá-los.
2. Como responsável, quero ver a evolução RPG, frequência e notas do(s) meu(s) dependente(s), para acompanhar o desempenho escolar.
3. Como responsável, quero ver o status financeiro do meu dependente, para saber se há pendências.
4. Como responsável, quero que meu acesso seja somente leitura (exceto comunicação), para que eu não possa alterar notas, frequência ou missões.
5. Como administrador, quero que um Responsável vinculado a múltiplos filhos possa alternar entre eles numa mesma conta, sem precisar de um login por filho.

### F. Financeiro Básico

6. Como administrador/financeiro, quero lançar uma mensalidade (valor, vencimento) para um estudante, para registrar a cobrança.
7. Como administrador/financeiro, quero marcar uma mensalidade como paga, para manter o status atualizado.
8. Como administrador/financeiro, quero que mensalidades vencidas e não pagas sejam sinalizadas automaticamente como atrasadas, sem precisar marcar isso manualmente todo dia.
9. Como responsável, quero ver as mensalidades do meu dependente (valor, vencimento, status), para saber o que está pendente.
10. Como estudante, **não** quero ver detalhes financeiros no meu próprio portal — isso é responsabilidade do Responsável/Financeiro, não do estudante.

### G. Comunicação

11. Como instrutor/administrador, quero publicar um aviso para uma turma inteira ou para toda a escola, para comunicar algo relevante.
12. Como estudante ou responsável, quero ver um mural de avisos relevantes para mim (minha turma + gerais), para me manter informado.
13. Como responsável, quero poder enviar uma mensagem direta ao professor do meu dependente, para tirar uma dúvida específica.
14. Como instrutor, quero ver e responder mensagens diretas de responsáveis, num só lugar.

### H. Onboarding de Integração (Ciclo de Vida do Estudante, §3.6)

15. Como estudante novo, quero escolher um avatar visual para meu personagem no primeiro acesso, além da classe RPG que já escolho hoje.
16. Como estudante novo, quero ver um tutorial curto explicando o sistema de XP, Marcos e Missões antes de começar, para entender como a evolução funciona.
17. Como estudante novo, quero receber automaticamente uma "missão de boas-vindas" já no primeiro acesso, para ter uma primeira ação clara a fazer.

### I. Autenticação com Senha Real (robustez, transversal a Fase 0)

18. Como qualquer usuário, quero fazer login com e-mail e senha reais (não apenas selecionar meu usuário numa lista), para que minha conta não possa ser acessada por qualquer pessoa com acesso ao navegador.
19. Como administrador, quero definir/resetar a senha de um usuário, para casos de esquecimento.

## Implementation Decisions

### E. Portal da Família — modelo de dados e UI

- **Decisão sobre `Papel` múltiplo (§12.4 do Blueprint):** o documento modela `Papel` como many-to-many. Ao invés de reformular `User.role` inteiro (mudança grande, arriscada, e sem necessidade real hoje — nenhum outro papel de Fase 1 precisa ser múltiplo), criamos **`GuardianLink`** como uma entidade de relacionamento separada: `{ id, guardianUserId, studentUserId, relationship }`. Isso resolve exatamente o caso de uso (um Responsável, múltiplos dependentes) sem tocar no modelo de papel único já usado em todo o resto do sistema. Se no futuro mais papéis precisarem ser múltiplos, isso justifica revisitar `User.role`; por ora, tratar como uma exceção pontual e explícita é mais seguro que generalizar cedo demais.
- **Novo `UserRole`:** adiciona `'GUARDIAN'` à união existente.
- **UI:** `src/pages/Guardian/FamilyPortal.tsx` — se o Responsável tiver mais de um `GuardianLink`, um seletor no topo troca o estudante em foco; abaixo, versões **somente-leitura** de: resumo RPG (nível, XP, classe), `AttendanceHistory`, notas (via `AcademicHistory` reaproveitado em modo leitura), e o novo painel financeiro (item F).
- Nova aba `'family-portal'`, visível apenas para `role === 'GUARDIAN'`.

### F. Financeiro Básico — modelo de dados e motor

- **Novo tipo `Invoice`:** `{ id, studentId, description, amount, dueDate, status: 'PENDING'|'PAID'|'OVERDUE', paidAt? }`.
- **Regra de Negócio F1 (status automático):** `status` nunca é definido como `'OVERDUE'` manualmente — uma função pura `computeInvoiceStatus(invoice, now)` recalcula na leitura (`status === 'PENDING' && dueDate < now → 'OVERDUE'`), assim o "atraso" nunca fica desatualizado esperando alguém rodar um job. Sem backend/cron, recalcular na leitura é a estratégia correta aqui — nunca confiar em um valor de status gravado que dependeria de um processo em background que este projeto não tem.
- **UI:** aba **Financeiro** dentro da área do Instrutor/Admin (`src/pages/Admin/Financial.tsx`) para lançar/marcar como pago; painel somente-leitura equivalente dentro do Portal da Família.
- Conforme ADR 0003, isto é um painel de acompanhamento, não um sistema de cobrança — nenhuma tela pede dados de cartão.

### G. Comunicação — modelo de dados

- **Novo tipo `Announcement`:** `{ id, authorId, authorName, title, body, audience: 'SCHOOL' | { schoolClass: string }, createdAt }`.
- **Novo tipo `DirectMessage`:** `{ id, fromUserId, toUserId, body, createdAt, readAt? }` — troca simples entre um Responsável e o Instrutor do curso do seu dependente; não é um sistema de chat em tempo real (isso pertenceria à "Comunicação entre Agentes"/infra de mensageria da Fase 5+, fora de escopo aqui).
- **UI:** `src/components/AnnouncementBoard.tsx` (mural, reaproveitado no Portal do Estudante, Família e Instrutor) + uma caixa de entrada simples de mensagens diretas na área do Instrutor e no Portal da Família.

### H. Onboarding de Integração

- Estende a tela já existente de "primeira escolha de classe" (`Student/Home.tsx`) com: (1) um seletor de avatar (usar os mesmos ícones/ilustrações de classe já existentes como opções, sem exigir upload de imagem — nenhuma infraestrutura de upload existe e não vale criar uma só para isto); (2) um tutorial curto de 3–4 telas (modal sequencial) explicando XP/Marco/Missão; (3) ao concluir, criação automática de uma `Mission` do tipo `BLITZ` chamada "Sua Primeira Missão", endereçada só àquele estudante, via o `MissionEngine` já existente — **sem criar um sistema de onboarding paralelo**, apenas uma chamada a mais para as engines que já temos.

### I. Autenticação com Senha Real

- `User` ganha `passwordHash?: string` (nunca a senha em texto puro). Como não há backend, o hash é feito client-side com uma função de hash simples (`crypto.subtle.digest('SHA-256', ...)`, disponível nativamente no navegador) — **isto não é segurança de produção** (sem salt por usuário adequado a um ambiente sem servidor, sem proteção contra força bruta), e isso deve ficar dito explicitamente na tela e no código: é uma melhoria sobre "selecionar um usuário numa lista" (o estado atual), não uma alegação de sistema de autenticação real. Login real com backend fica fora de escopo (seria uma mudança de arquitetura completa, não uma Fase 1).

## Regras de Negócio específicas

- **F1** — já descrita acima (status de fatura sempre recalculado, nunca persistido como fonte da verdade).
- **E1** — um `GuardianLink` nunca concede permissão de escrita sobre o estudante vinculado; toda tela do Portal da Família é somente-leitura, exceto o envio de mensagens diretas (G).
- **G1** — um `Announcement` com `audience: { schoolClass }` só aparece para estudantes daquela turma e para os Responsáveis vinculados a eles; `audience: 'SCHOOL'` aparece para todos.
- **H1** — a "Missão de boas-vindas" é criada uma única vez por estudante (dedup pela própria existência de uma Mission com um `id` determinístico como `welcome-${studentId}`, verificado antes de criar), para não recriar a cada login.

## Testing Decisions

Mesma decisão já registrada nos planos anteriores: sem framework de testes ainda no projeto. Os seams de maior valor aqui, se um framework for adotado: `computeInvoiceStatus` (F1, função pura), a idempotência da missão de boas-vindas (H1), e a filtragem de audiência de `Announcement` (G1). Verificação mínima: `npx tsc -b --noEmit` limpo + passada manual pelas User Stories acima, como em todas as entregas anteriores.

## Fora de Escopo (deste plano)

- **Fases 2–8 do roadmap do Blueprint** (Learning Engine formalizado, mundo/narrativa RPG completos, ecossistema de agentes de IA, marketplace, analytics/BI, plataforma multi-idioma) — pertencem a fases posteriores no próprio roadmap do documento (§27.3).
- **Multi-tenancy real e gateway de pagamento real** — ver ADR 0003.
- **Volumes II–X da documentação do Blueprint** (DDD completo, especificação de banco de dados com centenas de tabelas, especificação de APIs, GDD completo, especificação de agentes de IA, manual de UX por tela) — o próprio documento recomenda que sejam escritos antes de mais código; não fazem parte deste plano de implementação, mas ficam registrados aqui como uma recomendação válida do documento-fonte, caso o usuário quera essa documentação mais formal para os módulos que formos construindo.
- **Múltiplos papéis por usuário (`Papel` many-to-many)** — resolvido pontualmente via `GuardianLink` (ver Implementation Decisions, item E); não generalizado para os demais papéis.
- **Chat em tempo real** — `DirectMessage` é assíncrono, sem WebSocket/infra de mensageria.

## Further Notes

- Este plano completa, junto com as Entregas A–D já implementadas (`SPEC.md`, `PLANO_IMPLEMENTACAO_PLATAFORMA.md`), a cobertura funcional de **Fase 0 — Fundação** e **Fase 1 — MVP** do Blueprint, dentro do que é honesto construir na arquitetura atual (SPA + `localStorage`, sem backend).
- Ao final da implementação deste plano, uma recomendação natural (que o próprio Blueprint sugere, adaptada à nossa escala) seria produzir uma versão simplificada do "Volume II — Requisitos Funcionais" apenas para os módulos que já existem no código — não as centenas de páginas do documento original, mas o suficiente para uma equipe nova entender regras de negócio e critérios de aceitação sem precisar ler o código-fonte.
- O PDF original está preservado em `docs/blueprint/` para referência e rastreabilidade.
