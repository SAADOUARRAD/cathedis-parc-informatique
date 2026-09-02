'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Fab,
  Badge,
  Paper,
  Typography,
  IconButton,
  TextField,
  Avatar,
  Chip,
  InputBase,
  CircularProgress,
  Tooltip,
  Divider,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Contact {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TECHNICIAN' | 'EMPLOYEE';
  avatar?: string | null;
  department: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastMessageIsMine?: boolean;
  unreadCount: number;
}

interface MessageItem {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  read: boolean;
  createdAt: string;
}

export default function FloatingChatWidget() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'TECHNICIAN' | 'EMPLOYEE'>('ALL');
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const currentUserId = session?.user?.id;

  // 1. Fetch Contacts list and total unread count
  const fetchContacts = async (showLoader = false) => {
    if (showLoader) setLoadingContacts(true);
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
        setTotalUnread(data.totalUnreadCount || 0);
      }
    } catch (err) {
      console.error('Erreur chargement contacts messagerie:', err);
    } finally {
      if (showLoader) setLoadingContacts(false);
    }
  };

  // 2. Fetch conversation history with active contact
  const fetchActiveMessages = async (contactId: string, markRead: boolean = true) => {
    try {
      const res = await fetch(`/api/messages?userId=${contactId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        if (markRead) {
          // Update local unread for this contact
          setContacts((prev) =>
            prev.map((c) => (c.id === contactId ? { ...c, unreadCount: 0 } : c))
          );
        }
      }
    } catch (err) {
      console.error('Erreur chargement messages:', err);
    }
  };

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial fetch and global polling every 4 seconds
  useEffect(() => {
    fetchContacts(true);

    pollingRef.current = setInterval(() => {
      fetchContacts(false);
      if (activeContact) {
        fetchActiveMessages(activeContact.id, false);
      }
    }, 4000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [session?.user, activeContact?.id]);

  // Trigger fetch when widget is opened
  useEffect(() => {
    if (isOpen) {
      fetchContacts(contacts.length === 0);
    }
  }, [isOpen]);

  // Open a specific contact conversation
  const handleSelectContact = (contact: Contact) => {
    setActiveContact(contact);
    setLoadingMessages(true);
    fetchActiveMessages(contact.id, true).finally(() => setLoadingMessages(false));
  };

  // Back to contact list
  const handleBackToList = () => {
    setActiveContact(null);
    fetchContacts();
  };

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !activeContact || sending) return;

    const contentToSend = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    // Optimistic message update
    const optimisticMsg: MessageItem = {
      id: 'temp-' + Date.now(),
      content: contentToSend,
      senderId: currentUserId!,
      receiverId: activeContact.id,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: activeContact.id,
          content: contentToSend,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Replace temp message with server response
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? data.message : m))
        );
      }
    } catch (err) {
      console.error('Erreur envoi message:', err);
    } finally {
      setSending(false);
    }
  };

  // Filter contacts by search and role
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || c.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'DSI / Admin', color: '#E31E24', bg: '#FEE2E2' };
      case 'TECHNICIAN':
        return { label: 'Technicien', color: '#0284C7', bg: '#E0F2FE' };
      default:
        return { label: 'Employé', color: '#059669', bg: '#D1FAE5' };
    }
  };

  if (!session) return null;

  return (
    <>
      {/* 🔘 1. FLOATING ACTION BUTTON (FAB) IN BOTTOM-RIGHT CORNER 🔘 */}
      <Tooltip title="Messagerie Interne Cathedis" placement="left" arrow>
        <Fab
          onClick={() => setIsOpen(!isOpen)}
          aria-label="chat"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1300,
            width: 58,
            height: 58,
            background: isOpen
              ? '#1A1A2E'
              : 'linear-gradient(135deg, #E31E24 0%, #B91C1C 100%)',
            color: '#FFFFFF',
            boxShadow: isOpen
              ? '0 8px 24px rgba(26, 26, 46, 0.4)'
              : '0 8px 28px rgba(227, 30, 36, 0.5)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.08) translateY(-2px)',
              background: isOpen
                ? '#111827'
                : 'linear-gradient(135deg, #B91C1C 0%, #991B1B 100%)',
              boxShadow: '0 12px 32px rgba(227, 30, 36, 0.65)',
            },
          }}
        >
          <Badge
            badgeContent={isOpen ? 0 : totalUnread}
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '0.72rem',
                border: '2px solid #FFFFFF',
                height: 22,
                minWidth: 22,
                borderRadius: '11px',
                top: -4,
                right: -4,
              },
            }}
          >
            {isOpen ? <CloseIcon sx={{ fontSize: 28 }} /> : <ChatIcon sx={{ fontSize: 28 }} />}
          </Badge>
        </Fab>
      </Tooltip>

      {/* 💬 2. FLOATING CHAT BOX POPUP (380px x 540px) 💬 */}
      {isOpen && (
        <Paper
          elevation={12}
          sx={{
            position: 'fixed',
            bottom: 92,
            right: 24,
            width: { xs: 'calc(100vw - 32px)', sm: 390 },
            height: 540,
            maxHeight: 'calc(100vh - 120px)',
            borderRadius: 4,
            zIndex: 1300,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#FFFFFF',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.22), 0 0 1px rgba(0, 0, 0, 0.15)',
            animation: 'slideUpChat 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            '@keyframes slideUpChat': {
              from: { opacity: 0, transform: 'translateY(18px) scale(0.96)' },
              to: { opacity: 1, transform: 'translateY(0) scale(1)' },
            },
          }}
        >
          {/* 🔴 HEADER BAR 🔴 */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1A1A2E 0%, #2A1B28 50%, #991B1B 100%)',
              color: '#FFFFFF',
              p: 1.8,
              px: 2.2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
              flexShrink: 0,
            }}
          >
            {activeContact ? (
              // Active Conversation Header
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0, flex: 1 }}>
                <IconButton
                  size="small"
                  onClick={handleBackToList}
                  sx={{ color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: getRoleBadge(activeContact.role).color,
                    fontSize: '0.9rem',
                    fontWeight: 800,
                  }}
                >
                  {activeContact.name.charAt(0)}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography noWrap sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#FFFFFF' }}>
                    {activeContact.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <FiberManualRecordIcon sx={{ fontSize: 9, color: '#10B981' }} />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.7rem' }}>
                      {getRoleBadge(activeContact.role).label} • {activeContact.department}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ) : (
              // Contacts Directory Header
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: 'rgba(227, 30, 36, 0.2)',
                    border: '1px solid rgba(227, 30, 36, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FF6B6B',
                  }}
                >
                  <ChatIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#FFFFFF', lineHeight: 1.2 }}>
                    Messagerie Cathedis
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem' }}>
                    Support IT & Échanges en direct
                  </Typography>
                </Box>
              </Box>
            )}

            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* 👥 VIEW 1: CONTACTS DIRECTORY 👥 */}
          {!activeContact ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', bgcolor: '#F8FAFC' }}>
              {/* Search Bar */}
              <Box sx={{ p: 1.8, pb: 1, bgcolor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: '#F1F5F9',
                    borderRadius: 2.5,
                    px: 1.5,
                    py: 0.6,
                  }}
                >
                  <SearchIcon sx={{ color: '#94A3B8', fontSize: 20, mr: 1 }} />
                  <InputBase
                    fullWidth
                    placeholder="Rechercher un collègue..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ fontSize: '0.85rem' }}
                  />
                </Box>

                {/* Role Filter Chips */}
                <Box sx={{ display: 'flex', gap: 0.8, mt: 1.2, overflowX: 'auto', pb: 0.5 }}>
                  {[
                    { id: 'ALL', label: 'Tous' },
                    { id: 'ADMIN', label: 'DSI' },
                    { id: 'TECHNICIAN', label: 'Techniciens' },
                    { id: 'EMPLOYEE', label: 'Employés' },
                  ].map((filter) => (
                    <Chip
                      key={filter.id}
                      label={filter.label}
                      size="small"
                      clickable
                      onClick={() => setRoleFilter(filter.id as any)}
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        bgcolor: roleFilter === filter.id ? '#1A1A2E' : '#F1F5F9',
                        color: roleFilter === filter.id ? '#FFFFFF' : '#475569',
                        '&:hover': { bgcolor: roleFilter === filter.id ? '#2A1B28' : '#E2E8F0' },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Contacts List */}
              <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
                {loadingContacts ? (
                  <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={26} sx={{ color: '#E31E24' }} />
                  </Box>
                ) : filteredContacts.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center', color: '#64748B' }}>
                    <Typography sx={{ fontSize: '1.5rem', mb: 1 }}>🔍</Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>
                      Aucun contact trouvé
                    </Typography>
                  </Box>
                ) : (
                  filteredContacts.map((contact) => {
                    const badge = getRoleBadge(contact.role);
                    return (
                      <Box
                        key={contact.id}
                        onClick={() => handleSelectContact(contact)}
                        sx={{
                          p: 1.4,
                          px: 1.6,
                          mb: 0.6,
                          borderRadius: 3,
                          bgcolor: contact.unreadCount > 0 ? '#FFF1F2' : '#FFFFFF',
                          border: contact.unreadCount > 0 ? '1px solid #FECDD3' : '1px solid #F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.4,
                          cursor: 'pointer',
                          transition: 'all 0.18s ease',
                          '&:hover': {
                            bgcolor: '#F1F5F9',
                            transform: 'translateX(3px)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                          },
                        }}
                      >
                        {/* Avatar with Status indicator */}
                        <Box sx={{ position: 'relative' }}>
                          <Avatar
                            sx={{
                              width: 42,
                              height: 42,
                              bgcolor: badge.color,
                              fontWeight: 800,
                              fontSize: '1rem',
                            }}
                          >
                            {contact.name.charAt(0)}
                          </Avatar>
                          <FiberManualRecordIcon
                            sx={{
                              position: 'absolute',
                              bottom: -2,
                              right: -2,
                              fontSize: 14,
                              color: '#10B981',
                              bgcolor: '#FFFFFF',
                              borderRadius: '50%',
                            }}
                          />
                        </Box>

                        {/* Name, Role & Last Message */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.2 }}>
                            <Typography noWrap sx={{ fontWeight: contact.unreadCount > 0 ? 900 : 700, fontSize: '0.88rem', color: '#0F172A' }}>
                              {contact.name}
                            </Typography>
                            {contact.lastMessageAt && (
                              <Typography variant="caption" sx={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                                {new Date(contact.lastMessageAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            )}
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Chip
                              label={badge.label}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.62rem',
                                fontWeight: 800,
                                bgcolor: badge.bg,
                                color: badge.color,
                              }}
                            />
                            <Typography
                              noWrap
                              sx={{
                                fontSize: '0.78rem',
                                color: contact.unreadCount > 0 ? '#1E293B' : '#64748B',
                                fontWeight: contact.unreadCount > 0 ? 800 : 500,
                              }}
                            >
                              {contact.lastMessage
                                ? `${contact.lastMessageIsMine ? 'Vous: ' : ''}${contact.lastMessage}`
                                : 'Démarrer une conversation...'}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Unread Counter Badge */}
                        {contact.unreadCount > 0 && (
                          <Chip
                            label={contact.unreadCount}
                            size="small"
                            sx={{
                              bgcolor: '#E31E24',
                              color: '#FFFFFF',
                              fontWeight: 900,
                              height: 20,
                              minWidth: 20,
                              fontSize: '0.68rem',
                            }}
                          />
                        )}
                      </Box>
                    );
                  })
                )}
              </Box>
            </Box>
          ) : (
            // 💬 VIEW 2: ACTIVE CONVERSATION STREAM & INPUT 💬
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', bgcolor: '#F8FAFC' }}>
              
              {/* Message History Stream */}
              <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {loadingMessages ? (
                  <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={26} sx={{ color: '#E31E24' }} />
                  </Box>
                ) : messages.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center', color: '#64748B', my: 'auto' }}>
                    <Typography sx={{ fontSize: '2rem', mb: 1 }}>👋</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
                      Échangez avec {activeContact.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      Posez vos questions ou donnez des nouvelles de votre matériel.
                    </Typography>
                  </Box>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId === currentUserId;
                    const timeStr = new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <Box
                        key={msg.id}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMine ? 'flex-end' : 'flex-start',
                        }}
                      >
                        {/* Bubble */}
                        <Box
                          sx={{
                            maxWidth: '78%',
                            p: 1.4,
                            px: 1.8,
                            borderRadius: 3.5,
                            borderTopRightRadius: isMine ? 1 : 3.5,
                            borderTopLeftRadius: isMine ? 3.5 : 1,
                            bgcolor: isMine ? '#E31E24' : '#FFFFFF',
                            color: isMine ? '#FFFFFF' : '#0F172A',
                            border: isMine ? 'none' : '1px solid #E2E8F0',
                            boxShadow: isMine
                              ? '0 4px 12px rgba(227, 30, 36, 0.25)'
                              : '0 2px 8px rgba(0, 0, 0, 0.04)',
                            wordBreak: 'break-word',
                          }}
                        >
                          <Typography sx={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
                            {msg.content}
                          </Typography>
                        </Box>

                        {/* Timestamp & Status */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.4, px: 0.5 }}>
                          <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#94A3B8' }}>
                            {timeStr}
                          </Typography>
                          {isMine && (
                            <CheckCircleIcon sx={{ fontSize: 11, color: msg.read ? '#10B981' : '#CBD5E1' }} />
                          )}
                        </Box>
                      </Box>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Bottom Message Input Bar */}
              <Box
                component="form"
                onSubmit={handleSendMessage}
                sx={{
                  p: 1.5,
                  bgcolor: '#FFFFFF',
                  borderTop: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <InputBase
                  fullWidth
                  placeholder="Écrivez votre message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  sx={{
                    bgcolor: '#F1F5F9',
                    borderRadius: 3,
                    px: 2,
                    py: 0.8,
                    fontSize: '0.85rem',
                  }}
                />
                <IconButton
                  type="submit"
                  disabled={!inputMessage.trim() || sending}
                  sx={{
                    bgcolor: '#E31E24',
                    color: '#FFFFFF',
                    width: 40,
                    height: 40,
                    '&:hover': { bgcolor: '#B91C1C' },
                    '&.Mui-disabled': { bgcolor: '#F1F5F9', color: '#94A3B8' },
                  }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          )}
        </Paper>
      )}
    </>
  );
}
