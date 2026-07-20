/**
 * Assistente de Aula — v1 (ver docs/adr/0002-assistente-de-aula-nao-chama-llm-do-cliente.md)
 *
 * Gera um RASCUNHO estruturado de aula a partir de um tema, para o instrutor editar — não é
 * uma chamada a um provedor de LLM. Este projeto é 100% front-end (sem backend), e embutir uma
 * chave de API de IA no bundle do navegador exporia essa chave a qualquer pessoa com o DevTools
 * aberto. Por isso a v1 é um gerador local por template: previsível, sem custo, sem rede — só
 * uma base para o professor não partir da página em branco.
 */

export interface LessonDraft {
  title: string;
  duration: string;
  content: string;
  problemContent?: string;
  solutionContent?: string;
  explainerContent?: string;
}

export type LessonFormat = 'video' | 'text' | 'exercise';

export function generateLessonDraft(topic: string, format: LessonFormat): LessonDraft {
  const t = topic.trim() || 'o tema da aula';

  if (format === 'video') {
    return {
      title: `Introdução a ${t}`,
      duration: '12 min',
      content: `Aula em vídeo apresentando os conceitos fundamentais de ${t}. Cole o link de incorporação (embed) do vídeo no campo abaixo.`,
    };
  }

  if (format === 'text') {
    return {
      title: `Entendendo ${t}`,
      duration: '15 min',
      content:
        `<h2>O que é ${t}?</h2>\n` +
        `<p>[Escreva aqui uma introdução ao tema, explicando por que ${t} é importante.]</p>\n` +
        `<h2>Conceitos-chave</h2>\n` +
        `<ul>\n<li>[Primeiro conceito relacionado a ${t}]</li>\n<li>[Segundo conceito]</li>\n<li>[Terceiro conceito]</li>\n</ul>\n` +
        `<h2>Exemplo prático</h2>\n` +
        `<p>[Inclua um exemplo do dia a dia, ou de código, que ilustre ${t} na prática.]</p>\n` +
        `<h2>Resumo</h2>\n` +
        `<p>[Feche com os pontos principais que o aluno deve levar desta aula.]</p>`,
    };
  }

  // exercise
  return {
    title: `Pratique: ${t}`,
    duration: '20 min',
    content: `Neste exercício, você vai aplicar o que aprendeu sobre ${t}. Leia a descrição, complete o código abaixo e confira o gabarito ao final.`,
    problemContent: `// TODO: implemente a solução para ${t} abaixo\n\n`,
    solutionContent: `// Gabarito de referência para ${t}\n// Substitua por uma implementação real antes de publicar.\n`,
    explainerContent: `[Explique aqui, passo a passo, como chegar na solução de ${t} — isso aparece para o aluno depois que ele conferir o gabarito.]`,
  };
}
