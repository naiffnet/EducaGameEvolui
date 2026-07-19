---
status: proposed
---

# Assistente de Aula não chama uma API de LLM diretamente do navegador

O plano de implementação da Plataforma inclui um "Assistente de Aula com IA" no `CourseEditor`, que geraria conteúdo de aula a partir de um tema digitado pelo professor. Este projeto é inteiramente front-end (Vite + React + localStorage, sem backend/servidor próprio). Chamar uma API de LLM diretamente do navegador exigiria embutir uma chave de API no bundle JavaScript entregue ao cliente — qualquer pessoa pode abrir o DevTools e extrair essa chave, o que é uma falha de segurança grave e pode gerar uso indevido/custo não controlado na conta de quem a forneceu.

Decidimos que a primeira versão do Assistente usa um **gerador local baseado em template** (sem chamada de rede), suficiente para validar a UI e o fluxo do professor. A integração com um provedor de LLM real fica fora de escopo até existir algum componente de servidor (ainda que uma função serverless simples) que guarde a chave do lado do backend.

Alternativa rejeitada: embutir a chave diretamente no cliente "só para a demo". Rejeitada porque uma vez que o padrão existe no código, é fácil esquecer de trocar antes de produção — o custo de reverter depois de exposto (chave vazada, possível abuso) é maior que o custo de não ter a geração real desde o início.
