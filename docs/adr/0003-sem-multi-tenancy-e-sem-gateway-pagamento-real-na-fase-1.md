---
status: accepted
---

# Fase 0/1 não introduz multi-tenancy real nem gateway de pagamento real

O Blueprint (`docs/blueprint/Construcao_do_Projeto_Educacional_Primeira_Etapa.pdf`, §12.4) trata `Tenant` (instituição) como uma entidade fundamental desde o início do modelo de dados, e o roadmap do próprio documento (§27.3) inclui financeiro entre os itens da Fase 1. Este projeto, no entanto, é uma SPA React + TypeScript com persistência em `localStorage`, sem backend, sem banco de dados real e sem processador de pagamentos — a distância entre "Tenant multi-inquilino com isolamento de dados" ou "gateway de pagamento PCI-compliant" e o que este código pode honestamente suportar hoje é enorme.

Decidimos que a Fase 1 deste projeto **não** introduz uma entidade `Tenant`/multi-tenancy — o sistema continua assumindo uma única instituição, como já é o caso hoje. Da mesma forma, o módulo **Financeiro Básico** desta fase registra mensalidades e status de pagamento como dados administrativos (valor, vencimento, status: pendente/pago/atrasado), mas **não processa pagamentos de verdade** — não há integração com gateway, não há dados de cartão, não há nada que se pareça com uma transação financeira real. É um painel de acompanhamento, não um sistema de cobrança.

Ambas as decisões evitam o mesmo risco: simular uma capacidade que o sistema não tem de verdade (isolamento multi-inquilino, ou processamento de pagamento seguro) cria uma falsa sensação de prontidão para produção. É melhor deixar essas capacidades claramente marcadas como não implementadas do que fingir que existem com uma versão simplificada e insegura.

Alternativa rejeitada: implementar uma versão "simplificada" de multi-tenancy (um campo `tenantId` decorativo) ou de pagamento (formulário de cartão que não processa nada de verdade). Rejeitada porque um campo ou formulário que não faz o que aparenta fazer é pior do que a ausência da funcionalidade — engana quem olha o código ou a tela achando que aquilo já resolve o problema.
