import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SEED_DEMO_PASSWORD } from '../db/seedData';
import { Sparkles, LogIn, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { loginWithPassword, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    loginWithPassword(email, password);
    setSubmitting(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', color: '#fff',
        }} aria-hidden="true">A</div>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            Antigravity LMS <Sparkles size={17} style={{ color: 'var(--accent)' }} />
          </h1>
          <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--text-tertiary)' }}>Plataforma de Ensino Inclusiva</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%', maxWidth: '380px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '32px', boxShadow: 'var(--shadow-lg)',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}
      >
        <h2 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>Entrar</h2>

        <div>
          <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>E-mail</label>
          <input
            id="login-email"
            type="email"
            className="form-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="voce@escola.com"
            autoComplete="username"
            required
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="login-password" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Senha</label>
          <input
            id="login-password"
            type="password"
            className="form-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        {authError && (
          <div role="alert" style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px',
            background: 'var(--danger-glow)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)',
            color: 'var(--danger)', fontSize: '0.85rem',
          }}>
            <AlertCircle size={16} /> {authError}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || !email.trim() || !password}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}
        >
          <LogIn size={16} /> Entrar
        </button>

        <div style={{
          marginTop: '4px', padding: '14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--text-tertiary)', lineHeight: 1.5,
        }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Ambiente de demonstração:</strong> use qualquer e-mail de conta semente
          (ex: <code>ana.silva@escola.com</code>, <code>marcos.paulo@escola.com</code>, <code>mariana.admin@escola.com</code>)
          com a senha <code>{SEED_DEMO_PASSWORD}</code>.
        </div>
      </form>
    </div>
  );
};
