# Spec — Alinhamento do Motor de Evolução RPG à Ubiquitous Language

Status: **Implementado** · Data: 2026-07-18

## Problem Statement

O `UBIQUITOUS_LANGUAGE.md` descreve o domínio "Sistema de Evolução RPG" (Personagem, Nível, XP, Marcos, Progresso Diário, Motor de Evolução). Uma auditoria do código contra esse glossário encontrou o motor de evolução majoritariamente implementado, mas com quatro problemas concretos:

1. Um bug de referência (`ReferenceError`) no `DailyDashboard`, que quebra a tela de progresso diário do aluno assim que renderizada.
2. Uma variável duplicada (`XP_LOGIN_BONUS_BASE` declarada duas vezes no mesmo módulo), que impede a compilação.
3. Três pontos do app que criam um `RpgCharacter` novo (criação de usuário no Admin, troca de classe no Perfil, primeira escolha de classe no Home do aluno) sem preencher `milestones` e `dailyProgress` — campos exigidos pelo motor de evolução em toda leitura de personagem. Isso geraria uma quebra em runtime (`Cannot read properties of undefined`) assim que qualquer uma dessas telas fosse usada.
4. Dois campos (`ClassProgression`, `SkillEntry`) existiam no tipo `RpgCharacter` sem nenhuma leitura em nenhuma lógica do sistema — não fazem parte da linguagem ubíqua documentada e geravam erros de tipo (`missing properties`) exatamente nos três pontos de criação de personagem citados acima.

Do ponto de vista do usuário: um estudante que loga, é criado como aluno pelo admin, ou troca de classe, teria a experiência de evolução (streak, marcos, level up) quebrada ou inconsistente.

## Solution

Alinhar estritamente o código ao domínio documentado em `UBIQUITOUS_LANGUAGE.md`:

- Corrigir os dois bugs de runtime/compilação no `DailyDashboard`.
- Garantir que todo ponto de criação de `RpgCharacter` produza um personagem completo (`milestones: []`, `dailyProgress` via `createDefaultDailyProgress()`), usando o próprio Motor de Evolução como fonte da verdade — não duplicando a lógica de inicialização.
- Remover os campos não documentados e não utilizados (`ClassProgression`, `SkillEntry`), já que não representam nenhum termo da linguagem ubíqua e sua presença causava inconsistências de tipo.
- Formalizar `DailyTask` (já citado no glossário) como um tipo de domínio explícito em vez de um objeto anônimo local ao componente.
- Completar o ganho de XP dos Marcos de streak (7 e 30 dias): a constante `XP_STREAK_7` existia mas nunca era usada — o Marco era criado sem conceder XP.

## User Stories

1. Como estudante, quero que a tela "Progresso Diário" renderize sem erros, para que eu possa acompanhar meu streak e minhas tarefas do dia.
2. Como estudante, quero que meu personagem RPG seja criado corretamente na primeira escolha de classe, com progresso diário e marcos zerados, para que o sistema de evolução funcione desde o primeiro login.
3. Como administrador, quero que, ao criar um novo usuário do tipo Estudante, o personagem RPG dele já nasça válido (com `dailyProgress` e `milestones`), para que ele não quebre a experiência de evolução assim que o estudante logar.
4. Como estudante, quero poder trocar de classe no meu Perfil sem perder meu progresso diário ou meus marcos já conquistados.
5. Como estudante, quero ser recompensado com XP ao atingir uma sequência de 7 ou 30 dias de estudo, e não apenas ganhar o Marco sem recompensa em XP.
6. Como desenvolvedor, quero que `DAILY_TASKS` seja tipado com um tipo de domínio (`DailyTask`), para que o glossário e o código usem exatamente os mesmos termos.
7. Como desenvolvedor, quero que o modelo `RpgCharacter` só contenha campos que correspondem a conceitos reais do domínio documentado, para que o glossário continue sendo a fonte única da verdade.
8. Como desenvolvedor, quero que `npm run build` (typecheck + bundle) rode sem erros, para poder confiar no pipeline de CI/deploy.

## Implementation Decisions

- **Fonte única de inicialização de personagem**: os três pontos de criação/edição de `RpgCharacter` (Admin/UserManagement, Profile, Student/Home) passaram a usar `createDefaultDailyProgress()` do `EvolutionEngine` para o campo `dailyProgress`, e `milestones: []` explicitamente, em vez de reimplementar a lógica de inicialização em cada tela.
- **Remoção, não deprecação, de `ClassProgression`/`SkillEntry`**: como nenhuma lógica de runtime lia esses campos (confirmado por busca em todo o código-fonte) e eles não aparecem no `UBIQUITOUS_LANGUAGE.md`, a decisão foi removê-los por completo do tipo `RpgCharacter`, do seed de dados e da migração em `database.ts`, em vez de mantê-los como "reservados para o futuro". Se houver planos de progressão multi-classe ou níveis de skill independentes, isso deve entrar como uma nova spec, com os termos formalizados primeiro no glossário.
- **`DailyTask` como tipo de domínio**: adicionado em `src/types/index.ts` com `{ id, label, xp, activity }`. O ícone (`ReactNode`) permanece como detalhe de UI, combinado ao tipo apenas dentro do componente que o consome — mantendo o tipo de domínio livre de detalhes de apresentação.
- **XP de Marcos de streak**: `XP_STREAK_7` (200 XP) passou a ser concedido quando o Marco de 7 dias é criado; foi adicionada uma constante simétrica `XP_STREAK_30` (500 XP) para o Marco de 30 dias, já que não havia nenhuma anteriormente.
- **Limpeza de imports não utilizados**: diversos componentes tinham imports de ícones (`lucide-react`) e funções do engine não utilizados, sinalizados pelo `tsc` com `noUnusedLocals`. Foram removidos para manter o build limpo.
- **Correção de null-safety em `CoursePlayer.tsx`**: `processEvolution` recebia um tipo derivado de `currentUser.rpgCharacter` sem checagem de nulidade; passou a receber `RpgCharacter | undefined` diretamente, e um `if (currentUser?.rpgCharacter)` substituiu o acesso não protegido.

## Testing Decisions

- O projeto não possui framework de testes configurado (`package.json` só tem `dev`, `build`, `lint`, `preview`). Adicionar uma suíte de testes está fora do escopo desta spec pontual de correção de bugs/alinhamento de domínio.
- Verificação usada como "loop de feedback" (seguindo o skill `diagnosing-bugs`): `npx tsc -b --noEmit` como sinal determinístico e rápido — o TypeScript, com `noUnusedLocals`/`strict` habilitados no `tsconfig`, capturou exatamente os pontos de inconsistência (propriedades faltando, variável indefinida, redeclaração). Isso foi suficiente para expor e confirmar a correção de todos os bugs encontrados, sem necessidade de um harness adicional.
- `npm run build` (typecheck + `vite build`) executado com sucesso ao final, confirmando que o bundle de produção é gerado sem erros.
- `npx oxlint` executado: 0 erros, 9 avisos pré-existentes e não relacionados a este trabalho (dependências de `useEffect`, parâmetros de `catch` não usados, um export misto em `EvolutionToast.tsx`). Não corrigidos aqui por estarem fora do escopo desta spec — candidatos a uma spec de qualidade de código separada, se desejado.
- Caso o projeto venha a adotar um framework de testes no futuro, o seam recomendado para testar o Motor de Evolução é `src/engine/EvolutionEngine.ts` diretamente (funções puras: `grantXp`, `processLevelUp`, `canLevelUp`, `performDailyCheck`), sem precisar montar componentes React.

## Out of Scope

- Implementar de fato uma progressão multi-classe (`ClassProgression`) ou níveis de skill independentes (`SkillEntry`) — os campos foram removidos por estarem inertes, não substituídos por uma implementação funcional.
- Corrigir os 9 avisos pré-existentes do `oxlint` não relacionados ao domínio de evolução.
- Adicionar framework de testes automatizados ao projeto.
- Reescrever o histórico do Git (commits antigos ainda contêm os arquivos `.freebuff` e `.bak` removidos anteriormente).

## Further Notes

- Todas as correções foram publicadas em `main` no repositório `naiffnet/EducaGameEvolui`.
- O `UBIQUITOUS_LANGUAGE.md` foi atualizado com uma entrada em "Ambiguidades sinalizadas" documentando a remoção de `ClassProgression`/`SkillEntry`, para que o histórico da decisão fique junto ao glossário.
