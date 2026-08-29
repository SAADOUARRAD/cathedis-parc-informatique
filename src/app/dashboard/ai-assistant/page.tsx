'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Avatar,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  SmartToy as AiIcon,
  Send as SendIcon,
  AutoAwesome as SparklesIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Assessment as ReportIcon,
  Psychology as BrainIcon,
  CheckCircle as CheckIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Help as HelpIcon,
  AccountTree as TopologyIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  category?: string;
  suggestedActions?: string[];
  timestamp: string;
}

export default function AiAssistantPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `👋 **Bonjour ! Je suis votre Assistant IA DSI Cathedis.**\n\nJe suis connecté en direct à votre base de données pour analyser le parc, prévoir les pannes, auditer la conformité juridique et calculer les coûts SAV.\n\nPosez-moi n'importe quelle question en français naturel ou cliquez sur l'un des raccourcis ci-dessous ! 🚀`,
      suggestedActions: [
        'Combien de PC disponibles en stock ?',
        'Qui n\'a pas encore signé son PV ?',
        'Quel est le coût total des réparations ?',
        'Diagnostic prédictif et santé du parc',
        'Rédige une note de synthèse pour la DG'
      ],
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (queryToSend?: string) => {
    const text = queryToSend || inputQuery;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text })
      });

      const data = await res.json();

      if (data.success) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.answer,
          category: data.category,
          suggestedActions: data.suggestedActions,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ **Désolé, une erreur est survenue lors de l'analyse :** ${err.message || 'Service indisponible'}. Veuillez réessayer.`,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    if (action.includes('Rapport') || action.includes('Bilan') || action.includes('Registre')) {
      router.push('/dashboard/reports');
    } else if (action.includes('Garantie')) {
      router.push('/dashboard/warranties');
    } else if (action.includes('affectation') || action.includes('signature') || action.includes('PV') || action.includes('bureaux') || action.includes('Visual')) {
      router.push('/dashboard/assignments');
    } else if (action.includes('équipement') || action.includes('stock')) {
      router.push('/dashboard/equipments');
    } else if (action.includes('Technicien') || action.includes('panne') || action.includes('urgente')) {
      router.push('/dashboard/technician/maintenances');
    } else {
      handleSendMessage(action);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Render markdown text with bolding, lists and emojis
  const renderFormattedText = (content: string) => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {content.split('\n').map((line, idx) => {
          if (!line.trim()) return <Box key={idx} sx={{ height: 4 }} />;

          // Process bold formatting **bold**
          const parts = line.split(/(\*\*.*?\*\*)/g);

          return (
            <Typography
              key={idx}
              sx={{
                fontSize: '0.92rem',
                color: '#1E293B',
                lineHeight: 1.6,
                fontWeight: line.startsWith('#') ? 800 : 500
              }}
            >
              {parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <Box component="span" key={pIdx} sx={{ fontWeight: 800, color: '#0F172A' }}>
                      {part.slice(2, -2)}
                    </Box>
                  );
                }
                return part;
              })}
            </Typography>
          );
        })}
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 4 }}>
      {/* 🌟 1. MASTER HERO BANNER DSI 🌟 */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          background: 'linear-gradient(135deg, #0D0F1D 0%, #1A1A2E 45%, #7B0000 100%)',
          color: '#FFFFFF',
          p: { xs: 2.5, md: 3.5 },
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Avatar
              sx={{
                width: 58,
                height: 58,
                bgcolor: '#E31E24',
                color: '#FFFFFF',
                boxShadow: '0 0 20px rgba(227, 30, 36, 0.6)',
                border: '2px solid rgba(255,255,255,0.2)'
              }}
            >
              <AiIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                  Assistant IA DSI & Intelligence Prédictive
                </Typography>
                <Chip
                  icon={<SparklesIcon sx={{ fontSize: 16, color: '#38BDF8' }} />}
                  label="Moteur NLP & Requêtes Temps Réel"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38BDF8',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    border: '1px solid rgba(56, 189, 248, 0.3)'
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mt: 0.5, fontWeight: 500 }}>
                Interrogez toute votre flotte en langage naturel, auditez la conformité légale et pilotez les coûts SAV.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              label="● IA 100% Opérationnelle"
              size="small"
              sx={{
                bgcolor: 'rgba(34, 197, 94, 0.2)',
                color: '#4ADE80',
                fontWeight: 800,
                border: '1px solid rgba(34, 197, 94, 0.4)'
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* 🚀 2. QUICK PROMPT ACCELERATORS (1-CLICK CARDS) 🚀 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
        {[
          {
            title: 'Stock & Disponibilités',
            desc: 'Combien de PC portables disponibles en stock ?',
            icon: <SpeedIcon sx={{ color: '#2563EB', fontSize: 22 }} />,
            bg: '#EFF6FF',
            border: '#DBEAFE',
            query: 'Combien d\'équipements sont disponibles en stock ?'
          },
          {
            title: 'Audit Décharges (PV)',
            desc: 'Qui n\'a pas encore signé son PV de décharge ?',
            icon: <SecurityIcon sx={{ color: '#059669', fontSize: 22 }} />,
            bg: '#ECFDF5',
            border: '#A7F3D0',
            query: 'Quels collaborateurs n\'ont pas encore signé leur PV ?'
          },
          {
            title: 'Analyse Coûts SAV',
            desc: 'Quel est le coût total des réparations ?',
            icon: <TrendingUpIcon sx={{ color: '#D97706', fontSize: 22 }} />,
            bg: '#FFFBEB',
            border: '#FDE68A',
            query: 'Fais-moi un bilan des pannes et des coûts de maintenance'
          },
          {
            title: 'Diagnostic Prédictif',
            desc: 'Indice de santé global et pannes prévisibles.',
            icon: <BrainIcon sx={{ color: '#7C3AED', fontSize: 22 }} />,
            bg: '#F5F3FF',
            border: '#DDD6FE',
            query: 'Fais-moi un diagnostic prédictif de santé du parc et obsolescence'
          }
        ].map((card, idx) => (
          <Paper
            key={idx}
            elevation={0}
            onClick={() => handleSendMessage(card.query)}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: `1px solid ${card.border}`,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 1.5,
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                borderColor: '#E31E24'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: card.bg, borderRadius: 2 }}>
                {card.icon}
              </Avatar>
              <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#1A1A2E' }}>
                {card.title}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, lineHeight: 1.3 }}>
              {card.desc}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* 💬 3. MAIN INTERACTIVE AI CONVERSATION FEED 💬 */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '480px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}
      >
        {/* Chat Stream Header */}
        <Box sx={{ p: 2, px: 3, bgcolor: '#FAFAFA', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SparklesIcon sx={{ color: '#E31E24', fontSize: 20 }} />
            <Typography sx={{ fontWeight: 800, color: '#1E293B', fontSize: '0.92rem' }}>
              Fil de Discussion Intelligent • Requêtes Directes
            </Typography>
          </Box>
          <Button
            size="small"
            startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
            onClick={() => setMessages([messages[0]])}
            sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'none', color: '#64748B' }}
          >
            Effacer la conversation
          </Button>
        </Box>

        {/* Message Thread List */}
        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5, overflowY: 'auto', maxHeight: '520px' }}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  gap: 1.8,
                  alignItems: 'flex-start',
                  justifyContent: isUser ? 'flex-end' : 'flex-start'
                }}
              >
                {!isUser && (
                  <Avatar sx={{ width: 38, height: 38, bgcolor: '#1A1A2E', color: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                    <AiIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                )}

                <Box sx={{ maxWidth: { xs: '88%', md: '75%' } }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.2,
                      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      bgcolor: isUser ? '#1A1A2E' : '#F8FAFC',
                      color: isUser ? '#FFFFFF' : '#1E293B',
                      border: isUser ? 'none' : '1px solid #E2E8F0',
                      boxShadow: isUser ? '0 4px 12px rgba(26, 26, 46, 0.25)' : 'none'
                    }}
                  >
                    {isUser ? (
                      <Typography sx={{ fontWeight: 600, fontSize: '0.92rem', color: '#FFFFFF' }}>
                        {msg.text}
                      </Typography>
                    ) : (
                      <>
                        {renderFormattedText(msg.text)}

                        {/* Quick Suggested Action Buttons */}
                        {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                          <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #E2E8F0', display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="caption" sx={{ width: '100%', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                              Actions Recommandées & Raccourcis :
                            </Typography>
                            {msg.suggestedActions.map((action, aIdx) => (
                              <Button
                                key={aIdx}
                                size="small"
                                variant="outlined"
                                onClick={() => handleActionClick(action)}
                                sx={{
                                  borderRadius: 2,
                                  fontWeight: 800,
                                  fontSize: '0.72rem',
                                  textTransform: 'none',
                                  color: '#1A1A2E',
                                  borderColor: '#CBD5E1',
                                  bgcolor: '#FFFFFF',
                                  '&:hover': { bgcolor: '#F1F5F9', borderColor: '#E31E24', color: '#E31E24' }
                                }}
                              >
                                ➔ {action}
                              </Button>
                            ))}
                          </Box>
                        )}
                      </>
                    )}
                  </Paper>

                  {/* Timestamp & Copy action */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, px: 0.5, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem' }}>
                      {msg.timestamp}
                    </Typography>
                    {!isUser && (
                      <Tooltip title={copiedId === msg.id ? 'Copié !' : 'Copier la réponse'}>
                        <IconButton size="small" onClick={() => copyToClipboard(msg.text, msg.id)} sx={{ p: 0.2, color: '#94A3B8' }}>
                          {copiedId === msg.id ? <CheckIcon sx={{ fontSize: 16, color: '#059669' }} /> : <CopyIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>

                {isUser && (
                  <Avatar sx={{ width: 38, height: 38, bgcolor: '#E31E24', color: '#FFFFFF', fontWeight: 800, fontSize: '0.9rem' }}>
                    A
                  </Avatar>
                )}
              </Box>
            );
          })}

          {/* Loading Indicator */}
          {loading && (
            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
              <Avatar sx={{ width: 38, height: 38, bgcolor: '#1A1A2E', color: '#FFFFFF' }}>
                <AiIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Paper elevation={0} sx={{ p: 2, borderRadius: '16px 16px 16px 4px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CircularProgress size={16} sx={{ color: '#E31E24' }} />
                <Typography sx={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
                  Analyse de la base de données en cours...
                </Typography>
              </Paper>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* ⌨️ Bottom Prompt Input Bar ⌨️ */}
        <Box sx={{ p: 2, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Posez une question sur le parc, les pannes, les stocks ou les PV..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={loading}
              variant="outlined"
              size="small"
              slotProps={{
                input: {
                  sx: {
                    borderRadius: 3,
                    bgcolor: '#F8FAFC',
                    fontSize: '0.92rem',
                    '&:hover': { bgcolor: '#F1F5F9' }
                  }
                }
              }}
            />

            <Button
              variant="contained"
              onClick={() => handleSendMessage()}
              disabled={!inputQuery.trim() || loading}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1,
                fontWeight: 800,
                textTransform: 'none',
                background: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
                boxShadow: '0 4px 14px rgba(227, 30, 36, 0.4)',
                color: '#FFFFFF',
                '&:hover': { background: 'linear-gradient(90deg, #C41018 0%, #991B1B 100%)' }
              }}
            >
              <SendIcon sx={{ fontSize: 18 }} />
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
