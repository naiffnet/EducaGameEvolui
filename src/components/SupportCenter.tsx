import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../db/database';
import type { StudentAppointment, SchoolReport, User } from '../types';
import { 
  Calendar, 
  ShieldAlert, 
  Clock, 
  Video, 
  MapPin, 
  Lock, 
  PlusCircle, 
  Send,
  UserCheck
} from 'lucide-react';

export const SupportCenter: React.FC = () => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const [activeSubTab, setActiveSubTab] = useState<'appointments' | 'reports'>('appointments');
  const [appointments, setAppointments] = useState<StudentAppointment[]>(() => db.getStudentAppointments());
  const [reports, setReports] = useState<SchoolReport[]>(() => db.getSchoolReports());
  const [allUsers] = useState<User[]>(() => db.getUsers());

  // Staff options for appointment (Instructors, Coordinators, Directors)
  const staffList = allUsers.filter(u => ['INSTRUCTOR', 'COORDINATOR', 'DIRECTOR'].includes(u.role));

  // Form states for Appointment
  const [showApptForm, setShowApptForm] = useState(false);
  const [targetStaffId, setTargetStaffId] = useState(staffList[0]?.id || '');
  const [mode, setMode] = useState<'PRESENTIAL' | 'VIRTUAL'>('PRESENTIAL');
  const [category, setCategory] = useState<'ACADEMIC_DOUBT' | 'PEDAGOGICAL_SUPPORT' | 'EMOTIONAL_SUPPORT' | 'COMPLAINT_SUGGESTION'>('ACADEMIC_DOUBT');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('10:30');
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');

  // Form states for School Report / Bullying
  const [showReportForm, setShowReportForm] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [repCategory, setRepCategory] = useState<'BULLYING' | 'CYBERBULLYING' | 'AGGRESSION' | 'DISCRIMINATION' | 'VANDALISM' | 'OTHER'>('BULLYING');
  const [urgency, setUrgency] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [location, setLocation] = useState('Pátio Escolar / Intervalo');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [involvedPeople, setInvolvedPeople] = useState('');

  // Handle appointment submission
  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      alert('Por favor, informe o assunto do atendimento.');
      return;
    }

    const staffMember = staffList.find(s => s.id === targetStaffId);

    const newAppt: StudentAppointment = {
      id: `appt-${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      targetStaffId,
      targetStaffName: staffMember?.name || 'Coordenação',
      targetStaffRole: (staffMember?.role as any) || 'COORDINATOR',
      mode,
      category,
      date,
      timeSlot,
      subject,
      notes,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    db.saveStudentAppointment(newAppt);
    setAppointments(db.getStudentAppointments());
    setShowApptForm(false);
    setSubject('');
    setNotes('');
    alert('✅ Atendimento solicitado com sucesso! Você receberá a confirmação em seu painel.');
  };

  // Handle report submission
  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Por favor, descreva detalhadamente a ocorrência.');
      return;
    }

    const protocol = `PROT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReport: SchoolReport = {
      id: `rep-${Date.now()}`,
      protocolNumber: protocol,
      isAnonymous,
      reporterStudentId: isAnonymous ? undefined : currentUser.id,
      reporterStudentName: isAnonymous ? undefined : currentUser.name,
      category: repCategory,
      urgency,
      location,
      incidentDate,
      description,
      involvedPeople,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    db.saveSchoolReport(newReport);
    setReports(db.getSchoolReports());
    setShowReportForm(false);
    setDescription('');
    setInvolvedPeople('');
    alert(`🛡️ Ocorrência enviada com sucesso! Guarde o seu número de protocolo: ${protocol}`);
  };

  // Filter user records
  const myAppointments = currentUser.role === 'STUDENT'
    ? appointments.filter(a => a.studentId === currentUser.id)
    : appointments;

  const myReports = currentUser.role === 'STUDENT'
    ? reports.filter(r => r.reporterStudentId === currentUser.id || r.isAnonymous)
    : reports;

  const reportCategories: { id: typeof repCategory; label: string }[] = [
    { id: 'BULLYING', label: '🛑 Bullying Escolar' },
    { id: 'CYBERBULLYING', label: '🌐 Cyberbullying' },
    { id: 'AGGRESSION', label: '⚠️ Agressão Verbal / Física' },
    { id: 'DISCRIMINATION', label: '⚖️ Preconceito / Discriminação' },
    { id: 'VANDALISM', label: '🏚️ Vandalismo' },
    { id: 'OTHER', label: '❓ Outros Incidentes' },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'left' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calendar size={28} style={{ color: 'var(--primary)' }} /> Central de Apoio & Ouvidoria Escolar
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.92rem' }}>
            Agendamento de atendimentos presenciais ou virtuais e Canal Seguro de Proteção contra Bullying e Incidentes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn ${activeSubTab === 'appointments' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: 13 }}
            onClick={() => setActiveSubTab('appointments')}
          >
            📅 Atendimento Individual
          </button>
          <button
            className={`btn ${activeSubTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: 13 }}
            onClick={() => setActiveSubTab('reports')}
          >
            🛡️ Canal de Denúncias & Proteção
          </button>
        </div>
      </div>

      {/* TAB 1: APPOINTMENTS */}
      {activeSubTab === 'appointments' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
              Meus Agendamentos de Atendimento
            </h3>
            {currentUser.role === 'STUDENT' && (
              <button
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => setShowApptForm(!showApptForm)}
              >
                <PlusCircle size={16} /> Agendar Novo Atendimento
              </button>
            )}
          </div>

          {/* Appointment Form — Harmonized Layout */}
          {showApptForm && (
            <form onSubmit={handleCreateAppointment} className="card" style={{ padding: 28, marginBottom: 28, background: 'var(--bg-secondary)', border: '1px solid var(--primary)', boxShadow: 'var(--shadow-glow)' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 20px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                <UserCheck size={20} /> Formulário de Agendamento de Atendimento
              </h4>

              {/* Row 1: 2 Equal Columns (Profissional & Motivo) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 18 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Profissional Responsável</label>
                  <select className="form-select" value={targetStaffId} onChange={e => setTargetStaffId(e.target.value)}>
                    {staffList.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.role === 'INSTRUCTOR' ? 'Professor' : 'Coordenação'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Motivo do Atendimento</label>
                  <select className="form-select" value={category} onChange={e => setCategory(e.target.value as any)}>
                    <option value="ACADEMIC_DOUBT">📚 Dúvida Acadêmica</option>
                    <option value="PEDAGOGICAL_SUPPORT">🎯 Suporte Pedagógico</option>
                    <option value="EMOTIONAL_SUPPORT">💙 Apoio Emocional</option>
                    <option value="COMPLAINT_SUGGESTION">💬 Reclamação / Sugestão</option>
                  </select>
                </div>
              </div>

              {/* Row 2: 3 Equal Columns (Modalidade, Data & Horário) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 18 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Modalidade de Atendimento</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className={`btn ${mode === 'PRESENTIAL' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, padding: '8px 10px', fontSize: 12 }}
                      onClick={() => setMode('PRESENTIAL')}
                    >
                      📍 Presencial
                    </button>
                    <button
                      type="button"
                      className={`btn ${mode === 'VIRTUAL' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, padding: '8px 10px', fontSize: 12 }}
                      onClick={() => setMode('VIRTUAL')}
                    >
                      💻 Virtual
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Data Pretendida</label>
                  <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Horário Pretendido</label>
                  <select className="form-select" value={timeSlot} onChange={e => setTimeSlot(e.target.value)}>
                    <option value="08:30">08:30h</option>
                    <option value="10:00">10:00h</option>
                    <option value="11:30">11:30h</option>
                    <option value="14:00">14:00h</option>
                    <option value="15:30">15:30h</option>
                    <option value="16:40">16:40h</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Full Width Assunto Principal */}
              <div className="form-group">
                <label className="form-label">Assunto Principal</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Dúvida sobre o trabalho de algoritmos ou dificuldades em exatas"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
              </div>

              {/* Row 4: Full Width Observações */}
              <div className="form-group">
                <label className="form-label">Observações Adicionais (Opcional)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Detalhes que ajudem o profissional a se preparar para o atendimento..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowApptForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
                  <Send size={15} /> Confirmar Solicitação
                </button>
              </div>
            </form>
          )}

          {/* Appointment List */}
          {myAppointments.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>
              Nenhum agendamento de atendimento registrado. Clique no botão acima para marcar uma conversa presencial ou virtual!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {myAppointments.map(app => (
                <div key={app.id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span className={`badge ${app.status === 'CONFIRMED' ? 'badge-student' : 'badge-maintenance'}`}>
                        {app.status === 'CONFIRMED' ? 'CONFIRMADO' : app.status === 'PENDING' ? 'AGUARDANDO CONFIRMAÇÃO' : app.status}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {app.mode === 'VIRTUAL' ? <Video size={14} style={{ color: 'var(--primary)' }} /> : <MapPin size={14} style={{ color: 'var(--accent)' }} />}
                        {app.mode === 'VIRTUAL' ? 'Virtual' : 'Presencial'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                      {app.subject}
                    </h4>

                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      Atendimento com: <strong style={{ color: 'var(--primary)' }}>{app.targetStaffName}</strong>
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} /> Data: {app.date} às {app.timeSlot}h
                    </div>

                    {app.notes && (
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, fontStyle: 'italic', background: 'var(--bg-tertiary)', padding: 10, borderRadius: 8 }}>
                        "{app.notes}"
                      </p>
                    )}
                  </div>

                  {app.meetingLink && app.mode === 'VIRTUAL' && (
                    <a
                      href={app.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ padding: '8px 14px', fontSize: 12, textDecoration: 'none', textAlign: 'center' }}
                    >
                      <Video size={14} /> Entrar na Sala Virtual
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SCHOOL REPORTS & BULLYING PREVENTION */}
      {activeSubTab === 'reports' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={22} style={{ color: 'var(--danger)' }} /> Canal de Proteção Escolar & Denúncias
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Espaço seguro e sigiloso para relatar episódios de bullying, intimidação, discriminação ou intercorrências.
              </p>
            </div>

            <button
              className="btn btn-danger"
              style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setShowReportForm(!showReportForm)}
            >
              <Lock size={15} /> Fazer Relato / Denúncia Sigilosa
            </button>
          </div>

          {/* School Report Form */}
          {showReportForm && (
            <form 
              onSubmit={handleCreateReport} 
              className="card" 
              style={{ 
                padding: 28, 
                marginBottom: 28, 
                border: '2px solid var(--danger)', 
                background: 'var(--bg-secondary)',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              {/* Header with Title & Anonymous Mode Highlight Pill */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldAlert size={22} /> Registrar Ocorrência / Denúncia Escolar
                </h4>

                <div style={{ padding: '8px 16px', background: isAnonymous ? 'rgba(52, 211, 153, 0.12)' : 'var(--bg-tertiary)', border: `1px solid ${isAnonymous ? 'var(--success)' : 'var(--border)'}`, borderRadius: 'var(--radius-full)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 800, color: isAnonymous ? 'var(--success)' : 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
                    <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} style={{ width: 16, height: 16 }} />
                    🔒 Enviar em Modo 100% ANÔNIMO
                  </label>
                </div>
              </div>

              {/* Interactive Pill Selector for Nível de Urgência */}
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Nível de Urgência da Ocorrência</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`btn ${urgency === 'NORMAL' ? 'btn-secondary' : 'btn-ghost'}`}
                    style={{ padding: '8px 16px', fontSize: 13, border: urgency === 'NORMAL' ? '2px solid var(--primary)' : '1px solid var(--border)', background: urgency === 'NORMAL' ? 'var(--primary-glow)' : 'transparent' }}
                    onClick={() => setUrgency('NORMAL')}
                  >
                    Normal
                  </button>

                  <button
                    type="button"
                    className={`btn ${urgency === 'HIGH' ? 'btn-warning' : 'btn-ghost'}`}
                    style={{ padding: '8px 16px', fontSize: 13, border: urgency === 'HIGH' ? '2px solid var(--warning)' : '1px solid var(--border)', background: urgency === 'HIGH' ? 'var(--warning-glow)' : 'transparent' }}
                    onClick={() => setUrgency('HIGH')}
                  >
                    ⚡ Alta Prioridade
                  </button>

                  <button
                    type="button"
                    className={`btn ${urgency === 'URGENT' ? 'btn-danger' : 'btn-ghost'}`}
                    style={{ padding: '8px 16px', fontSize: 13, border: urgency === 'URGENT' ? '2px solid var(--danger)' : '1px solid var(--border)', background: urgency === 'URGENT' ? 'var(--danger-glow)' : 'transparent', fontWeight: 800 }}
                    onClick={() => setUrgency('URGENT')}
                  >
                    🚨 Urgente (Alerta Vermelho)
                  </button>
                </div>
              </div>

              {/* Interactive Pill Selector for Tipo de Ocorrência */}
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Tipo de Ocorrência</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                  {reportCategories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`btn ${repCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ 
                        padding: '10px 12px', 
                        fontSize: 12, 
                        justifyContent: 'flex-start',
                        border: repCategory === cat.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: repCategory === cat.id ? 'var(--primary)' : 'var(--bg-tertiary)'
                      }}
                      onClick={() => setRepCategory(cat.id)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Grid Section: Local & Data */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18, marginBottom: 18 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Local do Ocorrido</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Pátio da escola, Quadra, Refeitório"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Data da Ocorrência</label>
                  <input type="date" className="form-input" value={incidentDate} onChange={e => setIncidentDate(e.target.value)} />
                </div>
              </div>

              {/* Full Width Section: Descrição Detalhada */}
              <div className="form-group">
                <label className="form-label">Descrição Detalhada do Fato</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  style={{ width: '100%', minHeight: 110 }}
                  placeholder="Relate com detalhes o que aconteceu para que a coordenação possa tomar providências imediatas..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pessoas Envolvidas (Opcional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nomes ou turmas das pessoas envolvidas (se souber)..."
                  value={involvedPeople}
                  onChange={e => setInvolvedPeople(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowReportForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-danger" style={{ padding: '10px 24px' }}>
                  <Lock size={15} /> Enviar Denúncia Sigilosa
                </button>
              </div>
            </form>
          )}

          {/* Reports History */}
          {myReports.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>
              Nenhuma denúncia ou protocolo registrado.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {myReports.map(rep => (
                <div key={rep.id} className="card" style={{ padding: 20, borderLeft: `5px solid ${rep.urgency === 'URGENT' ? 'var(--danger)' : 'var(--warning)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="badge badge-admin" style={{ fontSize: 11 }}>
                        {rep.protocolNumber}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-secondary)' }}>
                        {rep.isAnonymous ? '🔒 100% Anônimo' : `Identificado: ${rep.reporterStudentName}`}
                      </span>
                    </div>

                    <span className={`badge ${rep.status === 'UNDER_REVIEW' ? 'badge-maintenance' : 'badge-student'}`}>
                      {rep.status === 'UNDER_REVIEW' ? 'EM ANÁLISE PELA COORDENAÇÃO' : rep.status}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                    {rep.category} · Local: {rep.location}
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.5 }}>
                    {rep.description}
                  </p>

                  {rep.resolutionNotes && (
                    <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 700, background: 'var(--success-glow)', padding: 12, borderRadius: 8, border: '1px solid var(--success)' }}>
                      💬 Parecer da Coordenação: {rep.resolutionNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
