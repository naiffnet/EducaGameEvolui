import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../db/database';
import type { Invoice, User } from '../../types';
import { useSystem } from '../../context/SystemContext';
import {
  DollarSign, Plus, Search, CheckCircle2, AlertCircle, Clock, Trash2
} from 'lucide-react';

export const Financial: React.FC = () => {
  const { addLog } = useSystem();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal / Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const loadData = useCallback(() => {
    const allUsers = db.getUsers();
    setStudents(allUsers.filter(u => u.role === 'STUDENT'));
    setInvoices(db.getInvoices());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !description.trim() || !amount || !dueDate) {
      alert('Preencha todos os campos da cobrança.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Informe um valor válido.');
      return;
    }

    const student = students.find(s => s.id === selectedStudentId);

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      studentId: selectedStudentId,
      description: description.trim(),
      amount: numericAmount,
      dueDate,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    db.addInvoice(newInvoice);
    addLog(
      'Lançamento Financeiro',
      `Fatura "${newInvoice.description}" de R$ ${numericAmount.toFixed(2)} lançada para ${student?.name || 'Estudante'}.`,
      'success'
    );

    setDescription('');
    setAmount('');
    setDueDate('');
    setShowAddForm(false);
    loadData();
  };

  const handleMarkPaid = (inv: Invoice) => {
    db.markInvoicePaid(inv.id);
    const student = students.find(s => s.id === inv.studentId);
    addLog(
      'Baixa Financeira',
      `Pagamento da fatura "${inv.description}" (R$ ${inv.amount.toFixed(2)}) de ${student?.name || 'Estudante'} confirmado.`,
      'success'
    );
    loadData();
  };

  const handleDeleteInvoice = (inv: Invoice) => {
    if (!window.confirm(`Excluir a cobrança "${inv.description}" de R$ ${inv.amount.toFixed(2)}?`)) return;
    db.deleteInvoice(inv.id);
    addLog('Exclusão de Fatura', `Fatura "${inv.description}" excluída do sistema.`, 'warning');
    loadData();
  };

  // Financial Stats
  const totalAmount = invoices.reduce((acc, i) => acc + i.amount, 0);
  const paidAmount = invoices.filter(i => i.status === 'PAID').reduce((acc, i) => acc + i.amount, 0);
  const pendingAmount = invoices.filter(i => i.status === 'PENDING').reduce((acc, i) => acc + i.amount, 0);
  const overdueAmount = invoices.filter(i => i.status === 'OVERDUE').reduce((acc, i) => acc + i.amount, 0);

  // Filtered invoices
  const filteredInvoices = invoices.filter(inv => {
    const student = students.find(s => s.id === inv.studentId);
    const studentName = student?.name.toLowerCase() || '';
    const matchQuery = studentName.includes(searchQuery.toLowerCase()) || inv.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchQuery && matchStatus;
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '4px 0' }} role="region" aria-label="Gestão Financeira Escolar">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
            Gestão Financeira & Mensalidades
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
            Lançamento de cobranças · Controle de mensalidades · Baixa manual · Status de vencimento automático (Regra F1)
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Plus size={18} /> Lançar Mensalidade / Cobrança
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>R$ {totalAmount.toFixed(2)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Faturamento Total</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--success)' }}>R$ {paidAmount.toFixed(2)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Recebido (Pago)</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(234,179,8,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--warning)' }}>R$ {pendingAmount.toFixed(2)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Pendente A Vencer</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
            <AlertCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--danger)' }}>R$ {overdueAmount.toFixed(2)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Em Atraso (Vencido)</div>
          </div>
        </div>
      </div>

      {/* Add Invoice Form */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: 28, borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <DollarSign size={18} style={{ color: 'var(--primary)' }} /> Lançar Nova Mensalidade / Cobrança
          </h3>
          <form onSubmit={handleCreateInvoice} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <label htmlFor="inv-student" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 13 }}>Estudante</label>
              <select
                id="inv-student"
                className="form-select"
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                required
              >
                <option value="">-- Selecionar Estudante --</option>
                {students.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.schoolClass || 'Sem turma'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="inv-desc" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 13 }}>Descrição da Cobrança</label>
              <input
                id="inv-desc"
                type="text"
                className="form-input"
                placeholder="Ex: Mensalidade Agosto/2026"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="inv-amount" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 13 }}>Valor (R$)</label>
              <input
                id="inv-amount"
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                placeholder="450.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="inv-duedate" style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 13 }}>Data de Vencimento</label>
              <input
                id="inv-duedate"
                type="date"
                className="form-input"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                required
              />
            </div>

            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={16} /> Confirmar Lançamento
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-tertiary)', padding: '7px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Buscar por estudante ou descrição..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: 13 }}
          />
        </div>
        <select
          className="form-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '7px 12px', fontSize: 13 }}
        >
          <option value="ALL">Todos os Status</option>
          <option value="PAID">Pagas</option>
          <option value="PENDING">Pendentes</option>
          <option value="OVERDUE">Atrasadas</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)' }}>
                <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Estudante</th>
                <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Descrição</th>
                <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Vencimento</th>
                <th style={{ padding: '14px 18px', textAlign: 'right', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Valor</th>
                <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', minWidth: 160 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv, idx) => {
                const student = students.find(s => s.id === inv.studentId);
                return (
                  <tr key={inv.id} style={{ background: idx % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>
                        {student?.name || 'Estudante Desconhecido'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                        {student?.schoolClass || 'Sem turma'} · {student?.email}
                      </div>
                    </td>

                    <td style={{ padding: '13px 18px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>
                      {inv.description}
                    </td>

                    <td style={{ padding: '13px 18px', fontSize: 13, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                      {new Date(inv.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </td>

                    <td style={{ padding: '13px 18px', textAlign: 'right', fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>
                      R$ {inv.amount.toFixed(2)}
                    </td>

                    <td style={{ padding: '13px 18px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                      {inv.status === 'PAID' && (
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={13} /> PAGO
                        </span>
                      )}
                      {inv.status === 'PENDING' && (
                        <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={13} /> PENDENTE
                        </span>
                      )}
                      {inv.status === 'OVERDUE' && (
                        <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <AlertCircle size={13} /> ATRASADO
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        {inv.status !== 'PAID' && (
                          <button
                            onClick={() => handleMarkPaid(inv)}
                            className="btn btn-primary"
                            style={{ padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                            title="Dar baixa e marcar como pago"
                          >
                            <CheckCircle2 size={13} /> Dar Baixa
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteInvoice(inv)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--danger)', borderColor: 'var(--danger)' }}
                          title="Excluir cobrança"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                    Nenhuma mensalidade ou cobrança encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
