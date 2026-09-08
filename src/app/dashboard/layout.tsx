'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Tooltip,
  Button,
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import ComputerIcon from '@mui/icons-material/Computer';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import BuildIcon from '@mui/icons-material/Build';
import SecurityIcon from '@mui/icons-material/Security';
import InventoryIcon from '@mui/icons-material/Inventory';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FloatingChatWidget from '@/components/shared/FloatingChatWidget';

const drawerWidth = 260;

const adminMenuSections = [
  {
    label: 'PRINCIPAL',
    items: [
      { text: 'Tableau de bord', path: '/dashboard', icon: <DashboardIcon /> },
      { text: 'Équipements', path: '/dashboard/equipments', icon: <ComputerIcon /> },
    ],
  },
  {
    label: 'GESTION',
    items: [
      { text: 'Affectations', path: '/dashboard/assignments', icon: <AssignmentIcon /> },
      { text: 'Mouvements', path: '/dashboard/movements', icon: <SwapHorizIcon /> },
      { text: 'Maintenances', path: '/dashboard/maintenances', icon: <BuildIcon /> },
      { text: 'Garanties', path: '/dashboard/warranties', icon: <SecurityIcon /> },
      { text: 'Demandes Équip.', path: '/dashboard/equipment-requests', icon: <AssignmentIcon /> },
    ],
  },
  {
    label: 'ORGANISATION',
    items: [
      { text: 'Inventaires', path: '/dashboard/inventories', icon: <InventoryIcon /> },
      { text: 'Départements', path: '/dashboard/departments', icon: <BusinessIcon /> },
      { text: 'Catégories', path: '/dashboard/categories', icon: <CategoryIcon /> },
      { text: 'Fournisseurs', path: '/dashboard/suppliers', icon: <LocalShippingIcon /> },
    ],
  },
  {
    label: 'ADMINISTRATION',
    items: [
      { text: 'Utilisateurs', path: '/dashboard/users', icon: <PeopleIcon /> },
      { text: 'Rapports', path: '/dashboard/reports', icon: <AssessmentIcon /> },
      { text: 'Assistant IA', path: '/dashboard/ai-assistant', icon: <SmartToyIcon /> },
      { text: 'Journal d\'audit', path: '/dashboard/audit', icon: <HistoryIcon /> },
    ],
  },
];

const employeeMenuSections = [
  {
    label: 'MON ESPACE',
    items: [
      { text: 'Tableau de bord', path: '/dashboard/employee', icon: <DashboardIcon /> },
      { text: 'Mes Équipements', path: '/dashboard/employee/mes-equipements', icon: <ComputerIcon /> },
      { text: 'Demander un Équipement', path: '/dashboard/employee/demandes', icon: <AssignmentIcon /> },
    ],
  },
  {
    label: 'SUPPORT & COMPTE',
    items: [
      { text: 'Mes Tickets', path: '/dashboard/employee/mes-tickets', icon: <BuildIcon /> },
      { text: 'Auto-Diagnostic IA', path: '/dashboard/employee/auto-diagnostic', icon: <AutoAwesomeIcon /> },
      { text: 'Mon Profil', path: '/dashboard/employee/profil', icon: <PeopleIcon /> },
    ],
  },
];

const technicianMenuSections = [
  {
    label: 'ESPACE TECHNIQUE',
    items: [
      { text: 'Tableau de bord', path: '/dashboard/technician', icon: <DashboardIcon /> },
      { text: 'Maintenances', path: '/dashboard/technician/maintenances', icon: <BuildIcon /> },
      { text: 'Équipements', path: '/dashboard/equipments', icon: <ComputerIcon /> },
    ],
  },
  {
    label: 'SUIVI & GARANTIES',
    items: [
      { text: 'Garanties', path: '/dashboard/warranties', icon: <SecurityIcon /> },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleNotifOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notif: any) => {
    handleNotifClose();
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const currentDrawerWidth = isCollapsed ? 76 : drawerWidth;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await signOut({ redirect: false });
    router.push('/login');
  };

  // Determine user role
  const userRole = session?.user?.role || 'ADMIN';
  const roleLabel = userRole === 'ADMIN' ? 'ADMINISTRATEUR' : userRole === 'TECHNICIAN' ? 'TECHNICIEN' : 'EMPLOYÉ';

  // Select menu based on role
  const isEmployee = userRole === 'EMPLOYEE';
  const isTechnician = userRole === 'TECHNICIAN';
  const menuSections = isEmployee
    ? employeeMenuSections
    : isTechnician
    ? technicianMenuSections
    : adminMenuSections;

  // Find current page title
  let currentTitle = 'Tableau de bord';
  menuSections.forEach(section => {
    section.items.forEach(item => {
      if (pathname === item.path) {
        currentTitle = item.text;
      }
    });
  });

  // Vertical White Sidebar Component (Placed strictly underneath the Top Navy Bar)
  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        color: '#1E293B',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* 📋 Navigation List with Tooltips in Compact Mode 📋 */}
      <Box
        sx={{
          overflowY: 'auto',
          flexGrow: 1,
          py: 1.5,
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '4px' },
        }}
      >
        <List sx={{ pt: 0.5, pb: 2 }}>
          {menuSections.map((section, index) => (
            <React.Fragment key={index}>
              {!isCollapsed ? (
                <Typography
                  sx={{
                    px: 3,
                    py: 1,
                    fontSize: '0.7rem',
                    color: '#64748B',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    mt: index === 0 ? 0.5 : 1.8,
                  }}
                >
                  {section.label}
                </Typography>
              ) : (
                index > 0 && <Divider sx={{ my: 1.2, borderColor: '#E2E8F0', mx: 1.5 }} />
              )}

              {section.items.map((item) => {
                const isActive = pathname === item.path;

                const itemButton = (
                  <ListItemButton
                    component={Link}
                    href={item.path}
                    sx={{
                      borderRadius: 2.5,
                      py: 1,
                      px: isCollapsed ? 1 : 2,
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      position: 'relative',
                      overflow: 'hidden',
                      background: isActive
                        ? 'linear-gradient(90deg, #0F172A 0%, #1E293B 100%)'
                        : 'transparent',
                      color: isActive ? '#FFFFFF !important' : '#334155',
                      boxShadow: isActive
                        ? '0 4px 14px rgba(15, 23, 42, 0.25)'
                        : 'none',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: isCollapsed ? 'scale(1.06)' : 'translateX(3px)',
                        background: isActive
                          ? 'linear-gradient(90deg, #0A1128 0%, #0F172A 100%)'
                          : 'rgba(15, 23, 42, 0.06)',
                        color: isActive ? '#FFFFFF !important' : '#0F172A',
                        '& .MuiListItemIcon-root': {
                          color: isActive ? '#FFFFFF !important' : '#0F172A',
                          transform: 'scale(1.08)',
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? '#FFFFFF !important' : '#64748B',
                        minWidth: isCollapsed ? 0 : 36,
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        '& svg': { fontSize: 21 },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!isCollapsed && (
                      <ListItemText
                        primary={item.text}
                        slotProps={{
                          primary: {
                            sx: {
                              fontSize: '0.88rem',
                              fontWeight: isActive ? 700 : 600,
                              letterSpacing: isActive ? '0.01em' : 'normal',
                              color: isActive ? '#FFFFFF !important' : '#334155',
                            },
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                );

                return (
                  <ListItem key={item.path} disablePadding sx={{ px: isCollapsed ? 1 : 1.5, mb: 0.5 }}>
                    {isCollapsed ? (
                      <Tooltip
                        title={item.text}
                        placement="right"
                        arrow
                        slotProps={{
                          tooltip: {
                            sx: {
                              bgcolor: '#0F172A',
                              color: '#FFFFFF',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              py: 0.6,
                              px: 1.2,
                              borderRadius: 2,
                              boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
                            },
                          },
                        }}
                      >
                        {itemButton}
                      </Tooltip>
                    ) : (
                      itemButton
                    )}
                  </ListItem>
                );
              })}
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* 👤 User Profile Footer inside White Sidebar 👤 */}
      <Box sx={{ p: isCollapsed ? 1.2 : 1.8, borderTop: '1px solid #E2E8F0', backgroundColor: '#FAFAFA' }}>
        {!isCollapsed ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.2,
              borderRadius: 2.5,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: '#CBD5E1',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
              },
            }}
          >
            <Avatar
              sx={{
                bgcolor: '#E31E24',
                color: '#FFFFFF',
                fontWeight: 800,
                width: 36,
                height: 36,
                fontSize: '0.92rem',
                boxShadow: '0 2px 8px rgba(227, 30, 36, 0.35)',
              }}
            >
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'A'}
            </Avatar>
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <Typography noWrap sx={{ fontSize: '0.86rem', color: '#0F172A', fontWeight: 700 }}>
                {session?.user?.name || 'Ahmed Benali'}
              </Typography>
              <Chip
                label={roleLabel}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  bgcolor: 'rgba(227, 30, 36, 0.1)',
                  color: '#E31E24',
                  border: '1px solid rgba(227, 30, 36, 0.25)',
                  mt: 0.2,
                }}
              />
            </Box>
            <Tooltip title="Déconnexion" placement="top" arrow>
              <IconButton
                size="small"
                onClick={handleLogout}
                sx={{
                  color: '#64748B',
                  '&:hover': { color: '#E31E24', bgcolor: 'rgba(227, 30, 36, 0.08)' },
                }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Tooltip title={`${session?.user?.name || 'Ahmed Benali'} (${roleLabel})`} placement="right" arrow>
              <Avatar
                sx={{
                  bgcolor: '#E31E24',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  width: 36,
                  height: 36,
                  fontSize: '0.92rem',
                  boxShadow: '0 2px 8px rgba(227, 30, 36, 0.35)',
                }}
              >
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'A'}
              </Avatar>
            </Tooltip>
            <Tooltip title="Déconnexion" placement="right" arrow>
              <IconButton
                size="small"
                onClick={handleLogout}
                sx={{
                  color: '#64748B',
                  '&:hover': { color: '#E31E24', bgcolor: 'rgba(227, 30, 36, 0.08)' },
                }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* 🌟 1. Barre Horizontale Supérieure Bleu Marine Foncé (Pleine Largeur 100%, Bords Carrés) 🌟 */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: '100%',
          left: 0,
          right: 0,
          top: 0,
          borderRadius: 0, // Bords carrés et nets
          zIndex: (theme) => theme.zIndex.drawer + 1, // Au-dessus de la barre latérale
          backgroundColor: '#0F172A', // Bleu marine très foncé élégant
          backgroundImage: 'linear-gradient(90deg, #0A1128 0%, #0F172A 40%, #151F38 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          color: '#FFFFFF',
          height: 64,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        }}
      >
        <Toolbar sx={{ height: 64, px: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 0 }}>
          {/* Gauche : Zone Logo Centré + Bouton Menu + Titre décalé à droite */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
            {/* Zone Logo centré (aligné au milieu de la colonne latérale) */}
            <Box
              sx={{
                width: { xs: 'auto', md: currentDrawerWidth - 36 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'flex-start', md: 'center' },
                transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <Box
                component="img"
                src="/images/logo1.png"
                alt="Cathedis"
                sx={{
                  height: { xs: 34, sm: 40, md: 46 },
                  width: 'auto',
                  maxWidth: { xs: 155, sm: 185, md: 215 },
                  display: 'block',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5))',
                  cursor: 'pointer',
                  mx: 'auto',
                }}
                onClick={() => router.push('/dashboard')}
              />
            </Box>

            {/* Bouton Menu / Réduire sidebar */}
            <IconButton
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 900) {
                  setMobileOpen(!mobileOpen);
                } else {
                  setIsCollapsed(!isCollapsed);
                }
              }}
              size="small"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                p: 0.8,
                borderRadius: 1.5,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(227, 30, 36, 0.25)', color: '#FFFFFF', borderColor: '#E31E24' },
              }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>

            {/* Séparateur vertical */}
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                height: 24,
                my: 'auto',
                mx: { xs: 0.5, md: 1.5 },
                borderColor: 'rgba(255, 255, 255, 0.15)',
                display: { xs: 'none', sm: 'block' },
              }}
            />

            {/* Titre : "Tableau de bord", "Équipements", etc. (décalé à droite) */}
            <Typography
              sx={{
                fontSize: { xs: '0.95rem', sm: '1.15rem' },
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.2px',
                display: { xs: 'none', md: 'block' },
                ml: { md: 2.5 }, // Décalage vers la droite
              }}
            >
              {currentTitle}
            </Typography>
          </Box>

          {/* Droite : Barre de recherche + Notifications + Profil Utilisateur "A" */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.2, sm: 2 } }}>
            {/* Barre de Recherche */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 6,
                px: 1.8,
                py: 0.5,
                width: { xs: '120px', sm: '220px', md: '280px' },
                transition: 'all 0.2s ease',
                '&:hover, &:focus-within': {
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  borderColor: 'rgba(227, 30, 36, 0.6)',
                  boxShadow: '0 0 10px rgba(227, 30, 36, 0.25)',
                },
              }}
            >
              <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.55)', mr: 1, fontSize: 18 }} />
              <InputBase
                placeholder="Rechercher..."
                sx={{
                  width: '100%',
                  fontSize: '0.84rem',
                  color: '#FFFFFF',
                  '& input::placeholder': { color: 'rgba(255, 255, 255, 0.5)', opacity: 1 },
                }}
              />
            </Box>

            {/* 🔔 Notifications 🔔 */}
            <IconButton
              size="small"
              onClick={handleNotifOpen}
              sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                p: 0.8,
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(227, 30, 36, 0.2)', color: '#FFFFFF', borderColor: '#E31E24' },
              }}
            >
              <Badge
                badgeContent={unreadCount}
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#E31E24',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '0.65rem',
                    height: 18,
                    minWidth: 18,
                  },
                }}
              >
                <NotificationsIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>

            {/* Menu Notifications */}
            <Menu
              anchorEl={notifAnchorEl}
              open={Boolean(notifAnchorEl)}
              onClose={handleNotifClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{
                paper: {
                  elevation: 6,
                  sx: {
                    mt: 1.5,
                    width: 360,
                    maxWidth: '90vw',
                    borderRadius: 3.5,
                    overflow: 'hidden',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
                  },
                },
              }}
            >
              <Box sx={{ p: 2, px: 2.5, bgcolor: '#0F172A', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.95rem' }}>
                    Notifications
                  </Typography>
                  {unreadCount > 0 && (
                    <Chip
                      label={`${unreadCount} new`}
                      size="small"
                      sx={{ bgcolor: '#E31E24', color: '#FFFFFF', fontWeight: 800, height: 20, fontSize: '0.68rem' }}
                    />
                  )}
                </Box>
                {unreadCount > 0 && (
                  <Button
                    size="small"
                    onClick={handleMarkAllRead}
                    sx={{ color: '#93C5FD', textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, p: 0, '&:hover': { color: '#FFFFFF' } }}
                  >
                    Tout marquer lu
                  </Button>
                )}
              </Box>

              <Box sx={{ maxHeight: 380, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center', color: '#64748B' }}>
                    <Typography sx={{ fontSize: '1.8rem', mb: 1 }}>🎉</Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>
                      Aucune nouvelle notification
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      Votre parc informatique est parfaitement à jour !
                    </Typography>
                  </Box>
                ) : (
                  notifications.map((notif, i) => (
                    <MenuItem
                      key={notif.id || i}
                      onClick={() => handleNotificationClick(notif)}
                      sx={{
                        p: 1.8,
                        px: 2.2,
                        borderBottom: '1px solid #F1F5F9',
                        bgcolor: notif.read ? '#FFFFFF' : '#FEF2F2',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        '&:hover': { bgcolor: '#F8FAFC' },
                      }}
                    >
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: notif.read ? '#CBD5E1' : '#E31E24',
                          mt: 0.6,
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: notif.read ? 600 : 800, fontSize: '0.85rem', color: '#0F172A', lineHeight: 1.3 }}>
                          {notif.title}
                        </Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: '#475569', mt: 0.3, lineHeight: 1.35 }}>
                          {notif.message}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Box>
            </Menu>

            {/* 👤 Profil Utilisateur "A" 👤 */}
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                p: 0.3,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.05)' },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: '#E31E24',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  width: 38,
                  height: 38,
                  fontSize: '1rem',
                  boxShadow: '0 2px 10px rgba(227, 30, 36, 0.45)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'A'}
              </Avatar>
            </IconButton>

            {/* Menu Déroulant Profil */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{
                paper: {
                  elevation: 4,
                  sx: { mt: 1.5, minWidth: 210, borderRadius: 3, p: 0.5, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F1F5F9' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>
                  {session?.user?.name || 'Ahmed Benali'}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>
                  {session?.user?.email || 'admin@cathedis.com'}
                </Typography>
              </Box>

              <MenuItem onClick={() => { handleMenuClose(); router.push(isEmployee ? '/dashboard/employee/profil' : '/dashboard/profile'); }} sx={{ borderRadius: 2, my: 0.3, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <PeopleIcon fontSize="small" sx={{ color: '#64748B' }} />
                </ListItemIcon>
                <Typography sx={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155' }}>
                  Mon Profil
                </Typography>
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={handleLogout} sx={{ borderRadius: 2, color: '#E31E24', py: 1 }}>
                <ListItemIcon sx={{ color: '#E31E24', minWidth: 32 }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#E31E24' }}>
                  Déconnexion
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 🧭 2. Barre Latérale Verticale Blanche (Placée UNIQUEMENT sous la barre supérieure) 🧭 */}
      <Box
        component="nav"
        sx={{
          width: { md: currentDrawerWidth },
          flexShrink: { md: 0 },
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              top: '64px',
              height: 'calc(100vh - 64px)',
              backgroundColor: '#FFFFFF',
              borderRight: '1px solid #E2E8F0',
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop Permanent Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: currentDrawerWidth,
              top: '64px',
              height: 'calc(100vh - 64px)',
              backgroundColor: '#FFFFFF',
              borderRight: '1px solid #E2E8F0',
              overflowX: 'hidden',
              transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '2px 0 10px rgba(0, 0, 0, 0.02)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* 🖥️ 3. Contenu Principal 🖥️ */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          mt: '64px', // Hauteur de la barre supérieure
          backgroundColor: '#F8FAFC',
          minHeight: 'calc(100vh - 64px)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {children}
      </Box>

      {/* 💬 Widget Messagerie Flottant (En bas à droite) 💬 */}
      <FloatingChatWidget />
    </Box>
  );
}
