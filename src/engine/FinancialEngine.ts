import type { Invoice, InvoiceStatus } from '../types';

/**
 * Regra de Negócio F1 (Blueprint): O status de atraso ('OVERDUE') nunca é persistido de forma estática
 * como fonte da verdade — ele é recalculado dinamicamente na leitura (computeInvoiceStatus).
 * 
 * Se a fatura já estiver 'PAID', permanece 'PAID'.
 * Se não estiver paga e a data de vencimento (dueDate YYYY-MM-DD) for anterior à data de hoje,
 * o status é 'OVERDUE'. Caso contrário, é 'PENDING'.
 */
export function computeInvoiceStatus(invoice: Invoice, todayStr?: string): InvoiceStatus {
  if (invoice.status === 'PAID') {
    return 'PAID';
  }

  const today = todayStr || new Date().toISOString().split('T')[0];
  
  if (invoice.dueDate < today) {
    return 'OVERDUE';
  }

  return 'PENDING';
}

/**
 * Processa uma lista de faturas aplicando a Regra F1 para garantir que o status
 * refletido em toda a UI esteja sempre atualizado.
 */
export function resolveInvoicesStatus(invoices: Invoice[], todayStr?: string): Invoice[] {
  return invoices.map(inv => {
    const computed = computeInvoiceStatus(inv, todayStr);
    return computed !== inv.status ? { ...inv, status: computed } : inv;
  });
}
