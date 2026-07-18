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

## Ambiguidades sinalizadas

- "XP" era usado no código anterior tanto como experiência total quanto como progresso — agora `xp` é o total acumulado, e `xpGainedToday` no `DailyProgress` é o XP ganho no dia
- "Nível" era confundido com "dificuldade do curso" — agora `level` é exclusivamente o nível do Personagem RPG, enquanto cursos usam `difficulty`
- "Conquista" era usado intercambiavelmente com "badge" (medalha) e "marco" — agora **Marco** é a conquista que contribui para level up, enquanto **Badge** é uma medalha cosmética
- `ClassProgression` e `SkillEntry` existiam como campos de `RpgCharacter` mas nunca eram lidos por nenhuma lógica (progressão por classe e nível de skill não fazem parte do domínio documentado aqui) — foram removidos do código em 2026-07-18 para manter o modelo alinhado a esta linguagem ubíqua. Ver `SPEC.md` para detalhes.
