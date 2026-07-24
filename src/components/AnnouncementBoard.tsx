import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../db/database';
import type { Announcement } from '../types';
import { Megaphone, Plus, Trash2, Globe, Users, Calendar } from 'lucide-react';

export const AnnouncementBoard: React.FC = () => {
  const { currentUser } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audienceType, setAudienceType] = useState<'SCHOOL' | 'CLASS'>('SCHOOL');
  const [targetClass, setTargetClass] = useState('9º Ano A');

  const loadAnnouncements = useCallback(() => {
    if (currentUser) {
      setAnnouncements(db.getAnnouncementsForUser(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  if (!currentUser) return null;

  const isStaff = currentUser.role === 'ADMIN' || currentUser.role === 'INSTRUCTOR';

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    const newAnnouncement: Announcement = {
      id: `anc-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name + (currentUser.role === 'ADMIN' ? ' (Direção)' : ' (Professor)'),
      title: title.trim(),
      body: body.trim(),
      audience: audienceType === 'SCHOOL' ? 'SCHOOL' : { schoolClass: targetClass.trim() || 'Geral' },
      createdAt: new Date().toISOString(),
    };

    db.addAnnouncement(newAnnouncement);
    setTitle('');
    setBody('');
    setShowAddForm(false);
    loadAnnouncements();
  };

  const handleDelete = (id: string, ancTitle: string) => {
    if (!window.confirm(`Excluir o aviso "${ancTitle}"?`)) return;
    db.deleteAnnouncement(id);
    loadAnnouncements();
  };

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'rgba(139,92,246,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
          }}>
            <Megaphone size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Mural de Avisos & Comunicados
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-tertiary)' }}>
              Comunicados oficiais da escola e da sua turma
            </p>
          </div>
        </div>

        {isStaff && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} /> Novo Aviso
          </button>
        )}
      </div>

      {/* Staff Add Form */}
      {isStaff && showAddForm && (
        <form
          onSubmit={handleCreateAnnouncement}
          style={{
            background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
            padding: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 14,
          }}
        >
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Publicar Comunicado</h4>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Título do Aviso</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Feira de Ciências e Tecnologia"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Público Alvo (Audiência)</label>
              <select
                className="form-select"
                value={audienceType}
                onChange={e => setAudienceType(e.target.value as 'SCHOOL' | 'CLASS')}
              >
                <option value="SCHOOL">Toda a Escola (Geral)</option>
                <option value="CLASS">Turma Específica</option>
              </select>
            </div>

            {audienceType === 'CLASS' && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Nome da Turma</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: 9º Ano A"
                  value={targetClass}
                  onChange={e => setTargetClass(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Conteúdo da Mensagem</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Escreva a mensagem do aviso..."
              value={body}
              onChange={e => setBody(e.target.value)}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: 13 }}>
              Publicar Comunicado
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)} style={{ padding: '6px 14px', fontSize: 13 }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
          Nenhum aviso publicado até o momento.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {announcements.map(anc => {
            const isSchoolAudience = anc.audience === 'SCHOOL';
            const audienceText = isSchoolAudience ? 'Toda a Escola' : `Turma: ${(anc.audience as { schoolClass: string }).schoolClass}`;

            return (
              <div
                key={anc.id}
                style={{
                  padding: '16px 20px', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)',
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {anc.title}
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`badge ${isSchoolAudience ? 'badge-primary' : 'badge-info'}`} style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {isSchoolAudience ? <Globe size={12} /> : <Users size={12} />}
                      {audienceText}
                    </span>

                    {isStaff && (
                      <button
                        onClick={() => handleDelete(anc.id, anc.title)}
                        className="btn btn-secondary"
                        style={{ padding: '3px 8px', fontSize: 11, color: 'var(--danger)', borderColor: 'var(--danger)' }}
                        title="Excluir aviso"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span>Por <strong>{anc.authorName}</strong></span>
                  <span>·</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={12} /> {new Date(anc.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {anc.body}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
