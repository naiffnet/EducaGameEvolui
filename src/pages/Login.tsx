import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { db } from '../db/database';
import { SEED_DEMO_PASSWORD } from '../db/seedData';
import { Sparkles, LogIn, AlertCircle, Eye, EyeOff, GraduationCap } from 'lucide-react';

export const Login: React.FC = () => {
  const { loginWithPassword, authError } = useAuth();
  const { config } = useSystem();
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

  const schoolName = config.schoolName || 'Colégio Evoluir & Saber';

  const getFirstName = (fullName?: string, fallback = '') => {
    if (!fullName) return fallback;
    return fullName.trim().split(' ')[0];
  };

  const studentUser = db.getUsers().find(u => u.role === 'STUDENT');
  const instructorUser = db.getUsers().find(u => u.role === 'INSTRUCTOR');
  const guardianUser = db.getUsers().find(u => u.role === 'GUARDIAN');
  const coordUser = db.getUsers().find(u => u.role === 'COORDINATOR' || u.role === 'DIRECTOR');
  const adminUser = db.getUsers().find(u => u.role === 'ADMIN');

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
        {config.schoolLogoUrl ? (
          <img
            src={config.schoolLogoUrl}
            alt={schoolName}
            style={{ height: 50, width: 'auto', borderRadius: 'var(--radius-md)', objectFit: 'contain' }}
          />
        ) : (
          <div style={{
            width: 48, height: 48, borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.4rem', color: '#fff',
            boxShadow: 'var(--shadow-md)'
          }} aria-hidden="true" title={`Logomarca: ${schoolName}`}>
            <GraduationCap size={28} />
          </div>
        )}
        <div>
          <h1 style={{ fontSize: '1.45rem', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            {schoolName} <Sparkles size={17} style={{ color: 'var(--accent)' }} />
          </h1>
          <p style={{ fontSize: '0.8rem', margin: '2px 0 0', color: 'var(--text-tertiary)' }}>Plataforma Educacional Gamificada · EducaGame Evolui</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)',
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: '7px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}
              title={`Entrar como ${studentUser?.name || 'Ana Silva'}`}
              onClick={() => {
                const targetEmail = studentUser ? studentUser.email : 'ana.silva@escola.com';
                setEmail(targetEmail);
                setPassword(SEED_DEMO_PASSWORD);
                loginWithPassword(targetEmail, SEED_DEMO_PASSWORD);
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                🎓 Estudante ({getFirstName(studentUser?.name, 'Ana')})
              </span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: '7px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}
              title={`Entrar como ${instructorUser?.name || 'Prof. Marcos'}`}
              onClick={() => {
                const targetEmail = instructorUser ? instructorUser.email : 'marcos.paulo@escola.com';
                setEmail(targetEmail);
                setPassword(SEED_DEMO_PASSWORD);
                loginWithPassword(targetEmail, SEED_DEMO_PASSWORD);
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                👨‍🏫 Professor ({getFirstName(instructorUser?.name, 'Marcos')})
              </span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: '7px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}
              title={`Entrar como ${guardianUser?.name || 'Paulo Silva'}`}
              onClick={() => {
                const targetEmail = guardianUser ? guardianUser.email : 'paulo.silva@escola.com';
                setEmail(targetEmail);
                setPassword(SEED_DEMO_PASSWORD);
                loginWithPassword(targetEmail, SEED_DEMO_PASSWORD);
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                👨‍👩‍👧 Responsável ({getFirstName(guardianUser?.name, 'Paulo')})
              </span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: '7px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}
              title={`Entrar como ${adminUser?.name || 'Mariana Admin'}`}
              onClick={() => {
                const targetEmail = adminUser ? adminUser.email : 'mariana.admin@escola.com';
                setEmail(targetEmail);
                setPassword(SEED_DEMO_PASSWORD);
                loginWithPassword(targetEmail, SEED_DEMO_PASSWORD);
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                👑 Admin ({getFirstName(adminUser?.name, 'Mariana')})
              </span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: '7px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}
              title={`Entrar como ${coordUser?.name || 'Carla Coordenação'}`}
              onClick={() => {
                const targetEmail = coordUser ? coordUser.email : 'carla.coordenacao@escola.com';
                setEmail(targetEmail);
                setPassword(SEED_DEMO_PASSWORD);
                loginWithPassword(targetEmail, SEED_DEMO_PASSWORD);
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                🏛️ Coordenação ({getFirstName(coordUser?.name, 'Carla')})
              </span>
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
