import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../db/database';
import type { User, DirectMessage } from '../types';
import { MessageSquare, Send, User as UserIcon, Clock } from 'lucide-react';

export const DirectMessaging: React.FC = () => {
  const { currentUser } = useAuth();
  const [contacts, setContacts] = useState<User[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');

  const loadData = useCallback(() => {
    if (!currentUser) return;
    const allUsers = db.getUsers();

    let eligibleContacts: User[] = [];
    if (currentUser.role === 'GUARDIAN') {
      // Guardians chat with Instructors and Admins
      eligibleContacts = allUsers.filter(u => u.role === 'INSTRUCTOR' || u.role === 'ADMIN');
    } else if (currentUser.role === 'INSTRUCTOR' || currentUser.role === 'ADMIN') {
      // Staff chat with Guardians
      eligibleContacts = allUsers.filter(u => u.role === 'GUARDIAN');
    } else {
      // Students or Support
      eligibleContacts = allUsers.filter(u => u.id !== currentUser.id && (u.role === 'INSTRUCTOR' || u.role === 'ADMIN'));
    }

    setContacts(eligibleContacts);
    if (eligibleContacts.length > 0 && !selectedContactId) {
      setSelectedContactId(eligibleContacts[0].id);
    }

    setMessages(db.getDirectMessagesForUser(currentUser.id));
  }, [currentUser, selectedContactId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!currentUser) return null;

  const selectedContact = contacts.find(c => c.id === selectedContactId) || contacts[0];

  // Conversation history between currentUser and selectedContact
  const conversation = selectedContact
    ? messages.filter(
        m =>
          (m.fromUserId === currentUser.id && m.toUserId === selectedContact.id) ||
          (m.fromUserId === selectedContact.id && m.toUserId === currentUser.id)
      )
    : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedContact) return;

    db.sendDirectMessage(currentUser, selectedContact, newMessageText.trim());
    setNewMessageText('');
    loadData();
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', minHeight: 480, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <MessageSquare size={20} style={{ color: 'var(--primary)' }} />
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Mensagens Diretas com Professores & Responsáveis
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-tertiary)' }}>
            Canal de comunicação direta assíncrona entre a família e a equipe pedagógica
          </p>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 420 }}>
        {/* Left Sidebar: Contacts */}
        <div style={{ borderRight: '1px solid var(--border)', background: 'var(--bg-secondary)', padding: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 8, paddingLeft: 8 }}>
            Contatos Disponíveis
          </div>

          {contacts.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', padding: 8 }}>Nenhum contato encontrado.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {contacts.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedContactId(c.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-md)',
                    background: selectedContactId === c.id ? 'var(--primary)' : 'transparent',
                    color: selectedContactId === c.id ? '#fff' : 'var(--text-primary)',
                    border: 'none', textAlign: 'left', cursor: 'pointer', transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: selectedContactId === c.id ? 'rgba(255,255,255,0.2)' : 'var(--bg-tertiary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13,
                  }}>
                    {c.name[0]}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{c.name}</div>
                    <div style={{ fontSize: 11, opacity: 0.8 }}>{c.role === 'INSTRUCTOR' ? 'Professor' : c.role === 'ADMIN' ? 'Direção' : 'Responsável'}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Area: Conversation Messages */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)' }}>
          {selectedContact ? (
            <>
              {/* Chat Contact Bar */}
              <div style={{ padding: '12px 18px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <UserIcon size={16} style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{selectedContact.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{selectedContact.email}</div>
                </div>
              </div>

              {/* Message History */}
              <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {conversation.length === 0 ? (
                  <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-tertiary)', fontSize: 13 }}>
                    Nenhuma mensagem anterior com {selectedContact.name}. Envie a primeira mensagem abaixo!
                  </div>
                ) : (
                  conversation.map(msg => {
                    const isMe = msg.fromUserId === currentUser.id;
                    return (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          background: isMe ? 'var(--primary)' : 'var(--bg-tertiary)',
                          color: isMe ? '#fff' : 'var(--text-primary)',
                          borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                          padding: '12px 16px',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4, fontWeight: 600 }}>
                          {msg.fromUserName}
                        </div>
                        <div style={{ fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word' }}>
                          {msg.body}
                        </div>
                        <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                          <Clock size={10} /> {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} style={{ padding: 14, borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder={`Enviar mensagem para ${selectedContact.name}...`}
                  value={newMessageText}
                  onChange={e => setNewMessageText(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" disabled={!newMessageText.trim()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}>
                  <Send size={15} /> Enviar
                </button>
              </form>
            </>
          ) : (
            <div style={{ margin: 'auto', color: 'var(--text-tertiary)', fontSize: 13 }}>
              Selecione um contato ao lado para iniciar a conversa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
