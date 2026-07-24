# Ubiquitous Language — Sistema de Evolução RPG

## Progressão do Personagem

| Termo | Definição | Aliases a evitar |
|---|---|---|
| **Personagem RPG (RpgCharacter)** | A representação gamificada de um estudante na plataforma, com classe, nível, XP, atributos e histórico de marcos | Avatar, Herói, Ficha |
| **Nível (Level)** | O patamar atual de poder do personagem, determinado por marcos acumulados e XP | Lv, Grau, Ranking |
| **XP (Experiência)** | Pontos acumulados por atividades de estudo, usados como moeda para subir de nível e desbloquear habilidades | Pontos, Score |
| **Classe (RpgClass)** | O arquétipo profissional do personagem, escolhido no início da jornada, que define os atributos base e o ganho por nível | Profissão, Tipo |
| **Atributos (Stats)** | Força (lógica), Inteligência (conhecimento) e Destreza (execução prática) que definem as aptidões do personagem | Stats, Características |

## Ciclo de Evolução Diária

| Termo | Definição | Aliases a evitar |
|---|---|---|
| **Evolução Diária (DailyEvolution)** | A verificação automática de progresso que ocorre a cada login, resetando tarefas diárias e processando streaks | Check-in diário |
| **Progresso Diário (DailyProgress)** | O registro das atividades realizadas no dia atual, incluindo XP ganho, tarefas concluídas e streak | Atividade do dia |
| **Streak (Sequência)** | O número de dias consecutivos com pelo menos uma atividade de estudo registrada | Sequência, Raia, Série |
| **Reset Diário** | A rotina que zera o XP diário e as tarefas concluídas quando um novo dia começa | Daily reset |
| **Bônus de Login** | XP concedido automaticamente ao fazer login em um novo dia, escalando com o streak | Login bonus |

## Marcos e Conquistas

| Termo | Definição | Aliases a evitar |
|---|---|---|
| **Marco (Milestone)** | Uma conquista específica que contribui para a progressão de nível do personagem | Conquista, Meta, Objetivo |
| **Marco Pessoal** | Conquista relacionada ao crescimento interno: completar aulas, passar exercícios, receber feedback | Marco menor, conquista simples |
| **Marco de Herói** | Conquista de alto impacto: projetos concluídos, notas altas (≥9), streaks longos, certificações | Marco maior, conquista épica |
| **Fonte do Marco (Source)** | A atividade que originou o marco: aula concluída, exercício aprovado, nota alta, projeto, streak, badge | Tipo, Origem |

## Motor de Evolução

| Termo | Definição | Aliases a evitar |
|---|---|---|
| **Motor de Evolução (EvolutionEngine)** | O módulo central que calcula ganho de XP, verifica marcos, processa level up e gerencia streaks | Engine, Core, Sistema de progressão |
| **Concessão de XP (XpGrant)** | A operação de atribuir XP a um personagem após uma atividade, verificando também marcos e level up | Gain, Reward |
| **Level Up** | O processo de subir de nível: consome XP, concede atributos e desbloqueia novas habilidades | Evoluir, Subir |
| **Requisitos de Level (MilestoneRequirements)** | A quantidade de marcos pessoais e de herói necessária para atingir o próximo nível | Pré-requisitos |
| **Tarefa Diária (DailyTask)** | Uma atividade sugerida para o dia (assistir aula, completar aula, fazer exercício, login) que concede XP adicional | Missão diária |

## Relacionamentos

- Um **Personagem RPG** tem exatamente um **Progresso Diário** e zero ou mais **Marcos**
- Um **Marco** é sempre do tipo **Pessoal** ou **Herói**, definido pela **Fonte do Marco**
- Um **Level Up** acontece quando o personagem tem XP e **Marcos** suficientes para o nível atual
- O **Streak** incrementa a cada dia consecutivo com atividade e zera se houver um dia sem atividade
- O **Bônus de Login** escala com o **Streak**: `XP = 10 + streak * 2`
- Cada **Classe** tem um ganho de atributos diferente por **Level Up**
- As **Tarefas Diárias** são resetadas a cada novo dia calendário

## Exemplo de Diálogo

> **Dev:** "Quando um estudante completa uma aula, o que acontece com o Personagem RPG?"
> 
> **Expert:** "O Motor de Evolução concede 50 XP. Se a aula for a primeira daquele tipo, um Marco Pessoal é criado. Se os marcos e XP acumulados atingirem os requisitos do nível atual, um Level Up acontece e o personagem ganha atributos extras."
>
> **Dev:** "E se o estudante voltar no dia seguinte?"
>
> **Expert:** "O Progresso Diário é resetado e o Streak é incrementado. Um Bônus de Login é concedido automaticamente: 10 XP base + 2 XP por dia de streak. O estudante vê as Tarefas Diárias novamente disponíveis."
>
> **Dev:** "E os Marcos de Herói? Quando eles aparecem?"
>
> **Expert:** "Apenas em conquistas de alto impacto: nota >= 9 em uma avaliação, um projeto completo, um curso finalizado, ou um Streak de 7 ou 30 dias. Um Marco de Herói vale mais que um Pessoal para subir de nível nos níveis mais altos."
>
> **Dev:** "E quando o professor quer propor algo específico, tipo uma pesquisa pra próxima aula?"
>
> **Expert:** "Ele cria uma Missão Requisitada no Quadro de Missões da turma, com prazo e XP definidos. Se o estudante cumprir, gera uma Submissão. Se o valor for alto, a Submissão precisa de Validação do Instrutor antes de virar Marco e conceder XP."
>
> **Dev:** "Isso é a mesma coisa que a Tarefa Diária de 'fazer um exercício'?"
>
> **Expert:** "Não. Tarefa Diária é genérica e reseta todo dia, sem professor por trás. Missão tem conteúdo, prazo e autoria do Instrutor — e não reseta sozinha."

## Ambiguidades sinalizadas

- "XP" era usado no código anterior tanto como experiência total quanto como progresso — agora `xp` é o total acumulado, e `xpGainedToday` no `DailyProgress` é o XP ganho no dia
- "Nível" era confundido com "dificuldade do curso" — agora `level` é exclusivamente o nível do Personagem RPG, enquanto cursos usam `difficulty`
- "Conquista" era usado intercambiavelmente com "badge" (medalha) e "marco" — agora **Marco** é a conquista que contribui para level up, enquanto **Badge** é uma medalha cosmética
- `ClassProgression` e `SkillEntry` existiam como campos de `RpgCharacter` mas nunca eram lidos por nenhuma lógica (progressão por classe e nível de skill não fazem parte do domínio documentado aqui) — foram removidos do código em 2026-07-18 para manter o modelo alinhado a esta linguagem ubíqua. Ver `SPEC.md` para detalhes.

## Missões (Sistema de Missões do Professor)

| Termo | Definição | Aliases a evitar |
|---|---|---|
| **Missão (Mission)** | Uma atividade pedagógica criada por um Instrutor, com conteúdo, prazo e valor de XP definidos, que o estudante cumpre para evoluir | Tarefa, Atividade, Dever de casa |
| **Missão Comum** | Missão recorrente, válida para toda uma turma/curso, disponível dentro de uma janela de tempo (ex: a semana corrente) | Missão semanal, Missão de turma |
| **Missão Requisitada** | Missão endereçada a um estudante ou subgrupo específico, geralmente para reforço ou aprofundamento individual | Missão individual |
| **Missão Blitz** | Missão de curta duração e alto valor de XP, com prazo curto (ex: uma aula, um dia), pensada para engajamento imediato | Missão relâmpago, Desafio rápido |
| **Submissão (MissionSubmission)** | O registro de que um estudante entregou/cumpriu uma Missão, podendo estar pendente, aprovada ou recusada pelo Instrutor | Entrega, Resposta |
| **Validação do Instrutor** | A aprovação manual de uma Submissão de Missão de alto valor (equivalente a um Marco de Herói), necessária antes da concessão do XP | Correção, Revisão |
| **Quadro de Missões (MissionBoard)** | A lista de Missões ativas visível ao estudante para uma turma/curso, com seus prazos e status de conclusão | Lista de tarefas, Painel de missões |

## Relacionamentos (Missões)

- Uma **Missão** é criada por exatamente um **Instrutor** e pertence a exatamente um **Curso**
- Uma **Missão** gera zero ou mais **Submissões**, uma por estudante
- Uma **Submissão** aprovada gera exatamente um **Marco** (Pessoal ou de Herói, conforme o valor da Missão) e concede o XP definido pela Missão
- O **Quadro de Missões** de um estudante é a união das Missões Comuns do seu Curso com as Missões Requisitadas endereçadas a ele
- Uma **Missão Blitz** não conta para o **Streak** nem para as **Tarefas Diárias** — é um bônus pontual, não um hábito

## Ambiguidades sinalizadas (Missões)

- **Missão não é Tarefa Diária.** A **Tarefa Diária (DailyTask)** já documentada acima é uma sugestão genérica gerada pelo próprio sistema (assistir aula, fazer exercício, logar) e reseta todo dia — ela não tem professor, conteúdo específico nem prazo. A **Missão** é criada por um Instrutor, tem conteúdo e prazo próprios, e não reseta automaticamente. As duas convivem: a Tarefa Diária mantém o hábito diário; a Missão carrega o conteúdo pedagógico do professor.
- **Missão não é Aula/Exercício de Curso.** `Lesson` (tipo `exercise`) já existe e concede XP ao ser concluída. Uma Missão pode *referenciar* uma Lesson (ex: "complete o exercício X até sexta") mas também pode ser algo fora do curso (ex: "traga uma pesquisa impressa amanhã"). Missão é a casca com prazo, XP e validação; a Lesson é conteúdo opcional dentro dela.

## Turma, Chamada e Cadastro Estendido

| Termo | Definição | Aliases a evitar |
|---|---|---|
| **Turma (schoolClass)** | Um rótulo textual simples (ex: "9º Ano A") que agrupa estudantes; **não** é uma entidade própria no sistema — deliberadamente, ver `PLANO_IMPLEMENTACAO.md` | Classe, Sala |
| **Chamada** | O ato do Instrutor registrar a presença/falta de cada aluno de uma Turma numa data | Frequência (frequência é o conceito, Chamada é o ato) |
| **Registro de Presença (AttendanceRecord)** | O dado persistido: um aluno, uma data, presente ou não, quem registrou | Falta, Presença (isolados — o registro cobre os dois estados) |
| **Cadastro Estendido** | Os dados administrativos do `User` além do essencial: matrícula, nascimento, telefone, turma, responsável | Ficha do aluno |
| **Assistente de Aula** | Ferramenta no Editor de Curso que gera um rascunho de aula a partir de um tema — v1 é um gerador local por template, não uma chamada de IA externa (ver ADR 0002) | Gerador de IA, Chat de IA |

## Ambiguidades sinalizadas (Turma/Chamada)

- **Turma não é Curso.** `Course` já existe e é o conteúdo/currículo (aulas, exercícios). `schoolClass` é só o agrupamento administrativo de alunos (uma "sala"). Um mesmo Curso pode ter alunos de Turmas diferentes matriculados.
- **Chamada não é Marco de frequência.** A Chamada gera XP e, por baixo dos panos, um Marco Pessoal — mas o termo "Chamada" se refere ao ato administrativo, não à recompensa. Ao discutir o Motor de Evolução, use "Marco gerado pela Chamada", não "a Chamada sobe de nível".

## Portal da Família, Financeiro e Comunicação

| Termo | Definição | Aliases a evitar |
|---|---|---|
| **Responsável (Guardian)** | Ator com papel `GUARDIAN`, vinculado a um ou mais estudantes via `GuardianLink`; acesso somente-leitura à evolução, frequência, notas e financeiro do(s) dependente(s) | Pai/mãe (nem sempre é o caso), Tutor |
| **GuardianLink** | O vínculo entre um Responsável e um estudante — não confundir com matrícula (que vincula estudante e curso) | Vínculo familiar |
| **Portal da Família** | A área da plataforma visível ao Responsável — somente leitura, exceto para o envio de Mensagens Diretas | Portal do Responsável |
| **Fatura (Invoice)** | Um registro de cobrança (mensalidade) de um estudante, com status sempre recalculado (nunca gravado como fonte da verdade) | Cobrança, Boleto (não emitimos boleto de verdade) |
| **Aviso (Announcement)** | Comunicado de um Instrutor/Admin para uma Turma inteira ou para toda a escola | Notificação (Notificação sugere push/tempo real, que não implementamos) |
| **Mensagem Direta (DirectMessage)** | Troca assíncrona entre um Responsável e o Instrutor do curso do seu dependente — não é chat em tempo real | Chat |

## Ambiguidades sinalizadas (Portal da Família/Financeiro/Comunicação)

- **Responsável não tem papel múltiplo por design.** O Blueprint-fonte (`docs/blueprint/`) modela `Papel` como many-to-many por usuário; aqui, resolvemos apenas o caso do Responsável via `GuardianLink`, sem generalizar `User.role` para múltiplos papéis simultâneos (ver ADR relacionado nas decisões de implementação do plano de Fase 0/1).
- **Fatura não é gateway de pagamento.** Uma Fatura só registra valor/vencimento/status — nunca processa um pagamento de verdade (ver ADR 0003).
