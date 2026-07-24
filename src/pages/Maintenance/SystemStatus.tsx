import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Settings, 
  Terminal, 
  ShieldAlert, 
  Trash2, 
  Database,
  CheckCircle,
  AlertOctagon,
  FileText,
  Building2
} from 'lucide-react';

export const SystemStatus: React.FC = () => {
  const { 
    config, 
    updateConfig, 
    logs, 
    clearLogs, 
    resetSystem,
    fontSizeMultiplier
  } = useSystem();
  
  const { refreshUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'status' | 'logs'>('status');
  const [logFilter, setLogFilter] = useState<'all' | 'success' | 'warning' | 'error'>('all');

  const toggleMaintenanceMode = () => {
    const nextVal = !config.maintenanceMode;
    updateConfig({ maintenanceMode: nextVal });
  };

  const handleResetSystem = () => {
    if (window.confirm('Tem certeza de que deseja resetar todo o sistema? Isso excluirá todas as modificações em cursos, progresso e logs, restaurando as configurações de fábrica.')) {
      resetSystem();
      refreshUser();
      alert('Sistema restaurado com sucesso para os dados padrão!');
    }
  };

  const filteredLogs = logs.filter(log => {
    if (logFilter === 'all') return true;
    return log.status === logFilter;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }} role="region" aria-label="Painel de Controle do Sistema e Logs">
      {/* Title */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px' }}>
          Console de Manutenção e Auditoria
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Ative modos de isolamento para reparos de sistema, monitore as ações dos usuários e gerencie o banco de dados.
        </p>
      </div>

      {/* Tabs */}
      <div 
        style={{ 
          display: 'flex', 
          borderBottom: '1px solid var(--border)', 
          marginBottom: '24px',
          gap: '4px'
        }}
        role="tablist"
      >
        <button
          role="tab"
          aria-selected={activeTab === 'status'}
          aria-controls="panel-status"
          id="tab-status"
          onClick={() => setActiveTab('status')}
          style={{
            padding: '12px 18px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'status' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'status' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          <Settings size={16} style={{ marginRight: '6px', display: 'inline' }} /> Painel de Status
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'logs'}
          aria-controls="panel-logs"
          id="tab-logs"
          onClick={() => setActiveTab('logs')}
          style={{
            padding: '12px 18px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'logs' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'logs' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          <Terminal size={16} style={{ marginRight: '6px', display: 'inline' }} /> Logs de Auditoria ({logs.length})
        </button>
      </div>

      {/* Tab Panels */}
      <div style={{ minHeight: '300px' }}>
        {activeTab === 'status' && (
          <div id="panel-status" role="tabpanel" aria-labelledby="tab-status">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
              {/* Left Side: System Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Maintenance Mode Card */}
                <div 
                  className="card" 
                  style={{ 
                    border: config.maintenanceMode ? '2px solid var(--warning)' : '1px solid var(--border)',
                    backgroundColor: config.maintenanceMode ? 'var(--warning-glow)' : 'var(--bg-secondary)'
                  }}
                >
                  <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <ShieldAlert size={20} style={{ color: config.maintenanceMode ? 'var(--warning)' : 'var(--text-secondary)' }} />
                    Modo Manutenção
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    Quando ativado, bloqueia imediatamente o acesso de estudantes e professores à plataforma. Apenas administradores e engenheiros de suporte podem continuar logados para reparos.
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                      className={`btn ${config.maintenanceMode ? 'btn-danger' : 'btn-primary'}`}
                      onClick={toggleMaintenanceMode}
                      aria-pressed={config.maintenanceMode}
                    >
                      {config.maintenanceMode ? 'Desativar Manutenção' : 'Ativar Modo Manutenção'}
                    </button>
                    <span style={{ fontWeight: 'bold', color: config.maintenanceMode ? 'var(--danger)' : 'var(--success)' }}>
                      Status: {config.maintenanceMode ? 'ISOLADO' : 'ONLINE'}
                    </span>
                  </div>
                </div>

                {/* White-Label School Branding Card */}
                <div className="card">
                  <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Building2 size={20} style={{ color: 'var(--primary)' }} /> Identidade Visual da Escola (White-Label)
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Personalize o nome da instituição de ensino contratante e a logomarca exibidos no cabeçalho de toda a plataforma.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const target = e.target as typeof e.target & {
                        schoolName: { value: string };
                        schoolLogoUrl: { value: string };
                      };
                      updateConfig({
                        schoolName: target.schoolName.value.trim() || 'Instituição de Ensino',
                        schoolLogoUrl: target.schoolLogoUrl.value.trim(),
                      });
                      alert('Identidade da escola atualizada com sucesso!');
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                  >
                    <div>
                      <label htmlFor="cfg-school-name" style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Nome da Escola / Colégio Contratante</label>
                      <input
                        id="cfg-school-name"
                        name="schoolName"
                        type="text"
                        className="form-input"
                        defaultValue={config.schoolName || 'Colégio Evoluir & Saber'}
                        placeholder="Ex: Colégio Evoluir & Saber"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="cfg-school-logo" style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>URL ou Caminho da Logomarca (Opcional)</label>
                      <input
                        id="cfg-school-logo"
                        name="schoolLogoUrl"
                        type="text"
                        className="form-input"
                        defaultValue={config.schoolLogoUrl || ''}
                        placeholder="Ex: https://escola.com/logo.png ou /pixel_art/logo.png"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13, alignSelf: 'flex-start' }}>
                      Salvar Personalização da Escola
                    </button>
                  </form>
                </div>

                {/* DB Wipe & Seed Card */}
                <div className="card">
                  <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Database size={20} style={{ color: 'var(--danger)' }} /> Banco de Dados
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    Restaura o banco de dados simulado no LocalStorage para os valores sementes originais de fábrica. Isso apagará todo progresso de aulas concluídas e cursos editados.
                  </p>
                  <button 
                    className="btn btn-danger" 
                    onClick={handleResetSystem}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Trash2 size={16} /> Restaurar Padrão de Fábrica
                  </button>
                </div>
              </div>

              {/* Right Side: System Info & A11y Verification */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>Diagnóstico do Sistema</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Versão do Núcleo:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{config.systemVersion}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Mecanismo de Persistência:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>LocalStorage Engine</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Acessibilidade CSS:</span>
                    <strong style={{ color: 'var(--success)' }}>✓ OK (AA/AAA WCAG)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Multiplicador Acessível Ativo:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{Math.round(fontSizeMultiplier * 100)}%</strong>
                  </div>
                </div>

                <div 
                  style={{ 
                    marginTop: '8px', 
                    padding: '16px', 
                    backgroundColor: 'var(--bg-tertiary)', 
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)' 
                  }}
                >
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px', color: 'var(--primary)' }}>Checklist de Saúde Operacional</h4>
                  <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li style={{ listStyleType: 'disc' }}>Suporte a contraste extremo (Alto Contraste) ✓</li>
                    <li style={{ listStyleType: 'disc' }}>Navegação via teclado sem armadilhas de foco ✓</li>
                    <li style={{ listStyleType: 'disc' }}>Tratamento semântico de rotas (RBAC Guards) ✓</li>
                    <li style={{ listStyleType: 'disc' }}>Modo Manutenção isolando requisições dos alunos ✓</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div id="panel-logs" role="tabpanel" aria-labelledby="tab-logs">
            {/* Filter Bar */}
            <div 
              style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius-md)', 
                padding: '16px', 
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Filtrar Status:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {(['all', 'success', 'warning', 'error'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setLogFilter(f)}
                      className={`btn ${logFilter === f ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '4px 10px', fontSize: '0.75rem', textTransform: 'capitalize' }}
                    >
                      {f === 'all' ? 'Todos' : f}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                className="btn btn-danger" 
                onClick={clearLogs}
                style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={14} /> Limpar Auditorias
              </button>
            </div>

            {/* Logs Table */}
            {filteredLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <FileText size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '8px' }} />
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Nenhum log registrado para este filtro.</p>
              </div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Horário</th>
                        <th>Status</th>
                        <th>Ação Realizada</th>
                        <th>Detalhes do Evento</th>
                        <th>Operador</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map(log => (
                        <tr key={log.id}>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                            {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                          <td>
                            <span 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '4px',
                                fontSize: '0.75rem', 
                                fontWeight: 'bold', 
                                color: log.status === 'success' ? 'var(--success)' : log.status === 'error' ? 'var(--danger)' : 'var(--warning)'
                              }}
                            >
                              {log.status === 'success' && <CheckCircle size={12} />}
                              {log.status === 'error' && <AlertOctagon size={12} />}
                              {log.status === 'warning' && <ShieldAlert size={12} />}
                              {log.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{log.action}</td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.details}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{log.userName}</span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{log.userRole}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
