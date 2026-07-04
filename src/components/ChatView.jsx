import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Send, Image, FileText, Check, CheckCheck,
  Archive, CheckCircle2, User, Search, Loader2, ArrowLeft,
  Circle
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function ChatView({ currentUser }) {
  const isSupportAdmin = currentUser?.Role === 'admin' || currentUser?.Role === 'superadmin';
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Presence and Typing states
  const [onlineUsers, setOnlineUsers] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [isTyping, setIsTyping] = useState(false);

  // Filters for Admin
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('active'); // active, archived, resolved

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 1. Fetch conversations (Admins get list of all users, Users get their own conversation only)
  useEffect(() => {
    fetchConversations();
    setupConversationsRealtime();
    setupPresence();
  }, [filterMode, searchQuery]);

  const fetchConversations = async () => {
    setLoadingConv(true);
    try {
      if (isSupportAdmin) {
        let query = supabase
          .from('chat_conversations')
          .select(`
            id,
            is_archived,
            is_resolved,
            last_message_at,
            user_id,
            profiles:user_id (full_name, avatar_url, plan, is_active)
          `);

        if (filterMode === 'archived') {
          query = query.eq('is_archived', true);
        } else if (filterMode === 'resolved') {
          query = query.eq('is_resolved', true);
        } else {
          query = query.eq('is_archived', false).eq('is_resolved', false);
        }

        const { data, error } = await query.order('last_message_at', { ascending: false });
        if (error) throw error;
        setConversations(data || []);
      } else {
        // User gets/creates single conversation
        const { data, error } = await supabase
          .from('chat_conversations')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // No conversation yet, handle creation
          const { data: newConv, error: createErr } = await supabase
            .from('chat_conversations')
            .insert([{ user_id: currentUser.id }])
            .select()
            .single();
          if (createErr) throw createErr;
          setConversations([newConv]);
          setActiveConversation(newConv);
        } else if (data) {
          setConversations([data]);
          setActiveConversation(data);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConv(false);
    }
  };

  // 2. Setup Realtime for Conversations list
  const setupConversationsRealtime = () => {
    const channel = supabase.channel('conversations-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_conversations' }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // 3. Realtime Presence for Online & Typing status
  const setupPresence = () => {
    const presenceChannel = supabase.channel('chat-presence', {
      config: { presence: { key: currentUser.id } }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const online = {};
        const typing = {};
        
        Object.keys(state).forEach(userId => {
          const userState = state[userId][0];
          online[userId] = true;
          if (userState.isTyping) {
            typing[userId] = userState.typingIn;
          }
        });

        setOnlineUsers(online);
        setTypingUsers(typing);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            isOnline: true,
            isTyping: isTyping,
            typingIn: activeConversation?.id || null,
            lastSeen: new Date().toISOString()
          });
        }
      });

    return presenceChannel;
  };

  // Trigger presence updates when isTyping changes
  useEffect(() => {
    const presenceChannel = supabase.channel('chat-presence', {
      config: { presence: { key: currentUser.id } }
    });
    presenceChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceChannel.track({
          isOnline: true,
          isTyping: isTyping,
          typingIn: activeConversation?.id || null,
          lastSeen: new Date().toISOString()
        });
      }
    });
    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [isTyping, activeConversation]);

  // 4. Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    fetchMessages();

    // Mark messages as read
    markMessagesAsRead();

    // Setup Realtime Messages
    const channel = supabase.channel(`messages:${activeConversation.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages',
        filter: `conversation_id=eq.${activeConversation.id}`
      }, payload => {
        setMessages(prev => [...prev, payload.new]);
        markMessagesAsRead();
        scrollToBottom();
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'chat_messages',
        filter: `conversation_id=eq.${activeConversation.id}`
      }, payload => {
        setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation]);

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          message_attachments (*)
        `)
        .eq('conversation_id', activeConversation.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      scrollToBottom();
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', activeConversation.id)
        .neq('sender_id', currentUser.id)
        .eq('is_read', false);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 5. Send message handler
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const messageText = inputText.trim();
    setInputText('');
    handleTyping(false);

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          conversation_id: activeConversation.id,
          sender_id: currentUser.id,
          content: messageText
        }]);

      if (error) throw error;
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // 6. Typing indicators
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    handleTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      handleTyping(false);
    }, 2000);
  };

  const handleTyping = (typingState) => {
    if (isTyping !== typingState) {
      setIsTyping(typingState);
    }
  };

  // 7. File uploads (max 5MB)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeConversation) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Limite de ficheiro excedido! Escolha um ficheiro com menos de 5MB.');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${activeConversation.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat_attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat_attachments')
        .getPublicUrl(filePath);

      // Create message first
      const { data: msg, error: msgError } = await supabase
        .from('chat_messages')
        .insert([{
          conversation_id: activeConversation.id,
          sender_id: currentUser.id,
          content: `Enviou um anexo: ${file.name}`
        }])
        .select()
        .single();

      if (msgError) throw msgError;

      // Add attachment entry
      const { error: attachError } = await supabase
        .from('message_attachments')
        .insert([{
          message_id: msg.id,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type.startsWith('image/') ? 'image' : 'pdf'
        }]);

      if (attachError) throw attachError;
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Ocorreu um erro no upload do anexo.');
    } finally {
      setUploading(false);
    }
  };

  // 8. Admin controls (Archive, Resolve)
  const handleToggleArchive = async () => {
    if (!activeConversation) return;
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ is_archived: !activeConversation.is_archived })
        .eq('id', activeConversation.id);

      if (error) throw error;
      setActiveConversation(prev => ({ ...prev, is_archived: !prev.is_archived }));
      fetchConversations();
    } catch (err) {
      console.error('Error toggling archive:', err);
    }
  };

  const handleToggleResolve = async () => {
    if (!activeConversation) return;
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ is_resolved: !activeConversation.is_resolved })
        .eq('id', activeConversation.id);

      if (error) throw error;
      setActiveConversation(prev => ({ ...prev, is_resolved: !prev.is_resolved }));
      fetchConversations();
    } catch (err) {
      console.error('Error toggling resolve:', err);
    }
  };

  const filteredConversations = conversations.filter(c => {
    if (!isSupportAdmin) return true;
    const name = c.profiles?.full_name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', height: '70vh', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
      
      {/* ── LISTA DE CONVERSAS (APENAS ADMIN) ── */}
      {isSupportAdmin && (!activeConversation || window.innerWidth > 768) && (
        <div style={{ width: window.innerWidth <= 768 ? '100%' : '320px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.1)' }}>
          {/* Header & Filter */}
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Suporte de Conversas</h3>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Pesquisar utilizador..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '6px 10px 6px 30px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
              />
            </div>
            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {['active', 'resolved', 'archived'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  style={{
                    flex: 1, padding: '4px 8px', fontSize: '0.72rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    background: filterMode === mode ? 'var(--color-accent)' : 'rgba(255,255,255,0.04)',
                    color: filterMode === mode ? '#fff' : 'var(--text-secondary)', fontWeight: 600
                  }}
                >
                  {mode === 'active' ? 'Ativas' : mode === 'resolved' ? 'Resolvidas' : 'Arquivadas'}
                </button>
              ))}
            </div>
          </div>

          {/* List content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {loadingConv ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Loader2 className="animate-spin" size={20} /></div>
            ) : filteredConversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sem conversas encontradas.</div>
            ) : (
              filteredConversations.map(c => {
                const userProfile = c.profiles || {};
                const isOnline = onlineUsers[c.user_id];
                const activeTyping = typingUsers[c.user_id] === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveConversation(c)}
                    style={{
                      padding: '12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px',
                      background: activeConversation?.id === c.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                      border: activeConversation?.id === c.id ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
                        {(userProfile.full_name || 'U')[0]}
                      </div>
                      {isOnline && (
                        <Circle size={10} fill="#34d399" color="#34d399" style={{ position: 'absolute', bottom: 0, right: 0, border: '2px solid #000' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userProfile.full_name || 'Utilizador'}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: activeTyping ? 'var(--color-success)' : 'var(--text-muted)' }}>
                        {activeTyping ? 'A escrever...' : `Plano: ${userProfile.plan || 'Gratuito'}`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── CAIXA DE CHAT ── */}
      {activeConversation ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.05)' }}>
          {/* Header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isSupportAdmin && (
                <button onClick={() => setActiveConversation(null)} style={{ display: window.innerWidth > 768 ? 'none' : 'block', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', paddingRight: '8px' }}>
                  <ArrowLeft size={18} />
                </button>
              )}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                  {isSupportAdmin ? (activeConversation.profiles?.full_name || 'Utilizador') : 'Fale com o Administrador'}
                </h4>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isSupportAdmin && (
                    <>
                      <span>{onlineUsers[activeConversation.user_id] ? '🟢 Online' : '⚪ Offline'}</span>
                      {typingUsers[activeConversation.user_id] === activeConversation.id && (
                        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>· A escrever...</span>
                      )}
                    </>
                  )}
                  {!isSupportAdmin && <span>Suporte Oficial Finança ao Ponto</span>}
                </div>
              </div>
            </div>

            {/* Admin toggle resolve/archive */}
            {isSupportAdmin && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={handleToggleResolve}
                  style={{
                    padding: '6px 12px', border: '1px solid var(--border-color)', background: activeConversation.is_resolved ? 'rgba(52,211,153,0.1)' : 'transparent',
                    color: activeConversation.is_resolved ? 'var(--color-success)' : 'var(--text-secondary)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  <CheckCircle2 size={13} /> {activeConversation.is_resolved ? 'Resolvida' : 'Marcar Resolvida'}
                </button>
                <button
                  onClick={handleToggleArchive}
                  style={{
                    padding: '6px 12px', border: '1px solid var(--border-color)', background: activeConversation.is_archived ? 'rgba(245,158,11,0.1)' : 'transparent',
                    color: activeConversation.is_archived ? '#f59e0b' : 'var(--text-secondary)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  <Archive size={13} /> {activeConversation.is_archived ? 'Arquivada' : 'Arquivar'}
                </button>
              </div>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {loadingMessages ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Loader2 className="animate-spin" size={24} /></div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <MessageSquare size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p style={{ fontSize: '0.85rem' }}>Olá! Escreva a sua mensagem abaixo. Pode anexar comprovativos de pagamento ou imagens.</p>
              </div>
            ) : (
              messages.map(m => {
                const isOwn = m.sender_id === currentUser.id;
                return (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: isOwn ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                      padding: '10px 14px',
                      borderRadius: isOwn ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      background: isOwn ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
                      border: isOwn ? 'none' : '1px solid var(--border-color)',
                      color: '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      position: 'relative'
                    }}
                  >
                    {/* Attachments */}
                    {m.message_attachments && m.message_attachments.map(att => (
                      <div key={att.id} style={{ marginBottom: '6px', background: 'rgba(0,0,0,0.15)', padding: '8px', borderRadius: '8px' }}>
                        {att.file_type === 'image' ? (
                          <img
                            src={att.file_url}
                            alt={att.file_name}
                            style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '6px', cursor: 'pointer' }}
                            onClick={() => window.open(att.file_url, '_blank')}
                          />
                        ) : (
                          <a
                            href={att.file_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60a5fa', textDecoration: 'underline', fontSize: '0.8rem' }}
                          >
                            <FileText size={16} /> {att.file_name}
                          </a>
                        )}
                      </div>
                    ))}
                    <span style={{ fontSize: '0.88rem', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{m.content}</span>
                    <div style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.62rem', color: 'rgba(255,255,255,0.6)' }}>
                      <span>{new Date(m.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>
                      {isOwn && (
                        m.is_read ? <CheckCheck size={11} style={{ color: '#34d399' }} /> : <Check size={11} />
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing Indicator for user */}
          {!isSupportAdmin && typingUsers['admin'] === activeConversation.id && (
            <div style={{ padding: '4px 16px', fontSize: '0.75rem', color: 'var(--color-success)' }}>
              Administrador está a escrever...
            </div>
          )}

          {/* Input Box */}
          <form onSubmit={handleSendMessage} style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              {uploading ? <Loader2 className="animate-spin" size={16} /> : <Image size={16} />}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,application/pdf"
              style={{ display: 'none' }}
            />
            <input
              type="text"
              placeholder="Escreva a sua mensagem..."
              value={inputText}
              onChange={handleInputChange}
              style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem' }}
            />
            <button
              type="submit"
              style={{ background: 'var(--color-accent)', border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <p style={{ fontSize: '0.9rem' }}>Selecione uma conversa para começar a responder.</p>
        </div>
      )}
    </div>
  );
}
