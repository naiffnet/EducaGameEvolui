import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SEED_DEMO_PASSWORD } from '../db/seedData';
import { Sparkles, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const { loginWithPassword, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              style={{ width: '100%', paddingRight: '40px' }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
              }}
              title={showPassword ? 'Ocultar senha' : 'Revelar senha'}
              aria-label={showPassword ? 'Ocultar senha' : 'Revelar senha'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
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
          marginTop: '12px', padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>⚡ Atalhos de Acesso Rápido (Demonstração):</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: '6px 8px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
              onClick={() => {
                setEmail('ana.silva@escola.com');
                setPassword(SEED_DEMO_PASSWORD);
                loginWithPassword('ana.silva@escola.com', SEED_DEMO_PASSWORD);
              }}
            >
              🎓 Estudante (Ana)
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: '6px 8px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
              onClick={() => {
                setEmail('marcos.paulo@escola.com');
                setPassword(SEED_DEMO_PASSWORD);
                loginWithPassword('marcos.paulo@escola.com', SEED_DEMO_PASSWORD);
              }}
            >
              👨‍🏫 Professor
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: '6px 8px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
              onClick={() => {
                setEmail('paulo.silva@escola.com');
                setPassword(SEED_DEMO_PASSWORD);
                loginWithPassword('paulo.silva@escola.com', SEED_DEMO_PASSWORD);
              }}
            >
              👨‍👩‍👧 Responsável
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: '6px 8px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
              onClick={() => {
                setEmail('mariana.admin@escola.com');
                setPassword(SEED_DEMO_PASSWORD);
                loginWithPassword('mariana.admin@escola.com', SEED_DEMO_PASSWORD);
              }}
            >
              👑 Admin
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: '6px 8px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
              onClick={() => {
                setEmail('carla.coordenacao@escola.com');
                setPassword(SEED_DEMO_PASSWORD);
                loginWithPassword('carla.coordenacao@escola.com', SEED_DEMO_PASSWORD);
              }}
            >
              🏛️ Coordenação
            </button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            Senha padrão de demonstração: <code>{SEED_DEMO_PASSWORD}</code>
          </div>
        </div>
      </form>
    </div>
  );
};
