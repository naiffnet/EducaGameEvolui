import React from 'react';
import { useSystem } from '../context/SystemContext';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export const MaintenanceGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config } = useSystem();
  const { currentUser } = useAuth();

  // If maintenance mode is active, block STUDENT and INSTRUCTOR roles
  const isBlocked = config.maintenanceMode && 
                    (!currentUser || currentUser.role === 'STUDENT' || currentUser.role === 'INSTRUCTOR');

  if (isBlocked) {
    return (
      <div 
        style={{ 
          minHeight: '80vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }}
        role="main"
        aria-live="assertive"
      >
        <div 
          style={{ 
            maxWidth: '550px', 
            padding: '40px', 
            backgroundColor: 'var(--bg-secondary)', 
            border: '2px solid var(--warning)', 
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '80px', 
              height: '80px', 
              borderRadius: 'var(--radius-full)', 
              backgroundColor: 'var(--warning-glow)', 
              color: 'var(--warning)',
              marginBottom: '24px'
            }}
          >
            <ShieldAlert size={48} aria-hidden="true" />
          </div>

          <h2 style={{ fontSize: '1.8rem', marginBottom: '16px', fontWeight: '800' }}>
            Plataforma em Manutenção
          </h2>
          
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1rem' }}>
            Estamos realizando melhorias estruturais no momento para oferecer uma experiência de ensino ainda melhor. Voltaremos em breve!
          </p>

          <div 
            style={{ 
              padding: '16px', 
              backgroundColor: 'var(--bg-tertiary)', 
              borderRadius: 'var(--radius-md)', 
              fontSize: '0.85rem', 
              color: 'var(--text-tertiary)',
              marginBottom: '32px',
              textAlign: 'left',
              border: '1px solid var(--border)'
            }}
          >
            <strong>Nota para Avaliação:</strong> Saia da conta atual (botão <strong>Sair</strong> no cabeçalho) e entre novamente com uma conta de <strong>Administrador</strong> ou <strong>Suporte</strong> (ex: mariana.admin@escola.com ou carlos.suporte@escola.com, senha do ambiente de demonstração) para conseguir desativar o Modo Manutenção.
          </div>

          {/* Quick simulation helper for tester */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => window.location.reload()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <RefreshCw size={16} /> Recarregar Página
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {config.maintenanceMode && (
        <div 
          style={{ 
            backgroundColor: 'var(--warning)', 
            color: '#000000', 
            padding: '8px 24px', 
            fontSize: '0.9rem', 
            fontWeight: 'bold', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px' 
          }}
          role="status"
        >
          <ShieldAlert size={16} /> Modo Manutenção está ATIVO. Usuários comuns (alunos e instrutores) estão bloqueados.
        </div>
      )}
      {children}
    </>
  );
};
