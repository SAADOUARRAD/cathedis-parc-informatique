'use client';

import React, { useState } from 'react';
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
import CathedisLogo from '@/components/CathedisLogo';

const drawerWidth = 280;

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

interface RoleTheme {
  sidebarBg: string;
  activeItemBg: string;
  activeItemColor: string;
  inactiveItemColor: string;
  hoverBg: string;
  categoryLabelColor: string;
  avatarBg: string;
  avatarColor: string;
  roleBadgeBg: string;
  roleBadgeColor: string;
  roleLabel: string;
  appBarAccent: string;
  borderColor: string;
  userNameColor: string;
  logoutIconColor: string;
}

const roleThemes: Record<string, RoleTheme> = {
  EMPLOYEE: {
    sidebarBg: 'linear-gradient(180deg, #1A1A2E 0%, #2A1B28 45%, #7B0000 100%)', // Same dark & red gradient as the banner!
    activeItemBg: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
    activeItemColor: '#FFFFFF',
    inactiveItemColor: 'rgba(255, 255, 255, 0.85)',
    hoverBg: 'rgba(255, 255, 255, 0.08)',
    categoryLabelColor: 'rgba(255, 205, 210, 0.75)',
    avatarBg: '#E31E24',
    avatarColor: '#FFFFFF',
    roleBadgeBg: 'rgba(227, 30, 36, 0.35)',
    roleBadgeColor: '#FFCDD2',
    roleLabel: 'EMPLOYÉ',
    appBarAccent: '#E31E24',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    userNameColor: '#FFFFFF',
    logoutIconColor: 'rgba(255, 255, 255, 0.8)',
  },
  TECHNICIAN: {
    sidebarBg: 'linear-gradient(180deg, #FFFFFF 0%, #FFF5F5 45%, #FFE5E5 100%)', // White with subtle red gradient
    activeItemBg: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
    activeItemColor: '#FFFFFF',
    inactiveItemColor: '#1E293B',
    hoverBg: 'rgba(227, 30, 36, 0.08)',
    categoryLabelColor: '#C41018',
    avatarBg: '#E31E24',
    avatarColor: '#FFFFFF',
    roleBadgeBg: 'rgba(227, 30, 36, 0.12)',
    roleBadgeColor: '#E31E24',
    roleLabel: 'TECHNICIEN',
    appBarAccent: '#E31E24',
    borderColor: 'rgba(227, 30, 36, 0.18)',
    userNameColor: '#0F172A',
    logoutIconColor: '#64748B',
  },
  ADMIN: {
    sidebarBg: 'linear-gradient(180deg, #1A1A2E 0%, #2A1B28 45%, #7B0000 100%)', // Same dark & red gradient as the banner!
    activeItemBg: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
    activeItemColor: '#FFFFFF',
    inactiveItemColor: 'rgba(255, 255, 255, 0.85)',
    hoverBg: 'rgba(255, 255, 255, 0.08)',
    categoryLabelColor: 'rgba(255, 205, 210, 0.75)',
    avatarBg: '#E31E24',
    avatarColor: '#FFFFFF',
    roleBadgeBg: 'rgba(227, 30, 36, 0.35)',
    roleBadgeColor: '#FFCDD2',
    roleLabel: 'ADMINISTRATEUR',
    appBarAccent: '#E31E24',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    userNameColor: '#FFFFFF',
    logoutIconColor: 'rgba(255, 255, 255, 0.8)',
  },
};

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

  const currentDrawerWidth = isCollapsed ? 80 : drawerWidth;

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

  // Determine user role & theme
  const userRole = session?.user?.role || 'ADMIN';
  const roleTheme = roleThemes[userRole] || roleThemes.ADMIN;

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

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: roleTheme.sidebarBg, color: 'white', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      {/* 🏢 Logo Header & Collapse Toggle 🏢 */}
      {!isCollapsed ? (
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', borderBottom: `1px solid ${roleTheme.borderColor}` }}>
          <Box
            component="img"
            src="/images/logo1.png"
            alt="Cathedis"
            sx={{ maxWidth: '170px', height: 'auto', display: 'block' }}
          />
          <Tooltip title="Réduire la barre (Mode Compact)" placement="bottom" arrow>
            <IconButton
              size="small"
              onClick={() => setIsCollapsed(true)}
              sx={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.7)',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF' }
              }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, borderBottom: `1px solid ${roleTheme.borderColor}` }}>
          <Avatar
            sx={{
              bgcolor: '#E31E24',
              color: '#FFFFFF',
              fontWeight: 900,
              width: 40,
              height: 40,
              fontSize: '1.2rem',
              boxShadow: '0 4px 12px rgba(227, 30, 36, 0.4)'
            }}
          >
            C
          </Avatar>
          <Tooltip title="Agrandir la barre latérale" placement="right" arrow>
            <IconButton
              size="small"
              onClick={() => setIsCollapsed(false)}
              sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                '&:hover': { bgcolor: '#E31E24', color: '#FFFFFF' }
              }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      
      {/* 📋 Navigation List with Tooltips in Compact Mode 📋 */}
      <Box sx={{ overflowY: 'auto', flexGrow: 1, py: 1.5, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '4px' } }}>
        <List sx={{ pt: 0, pb: 3 }}>
          {menuSections.map((section, index) => (
            <React.Fragment key={index}>
              {!isCollapsed ? (
                <Typography 
                  sx={{ 
                    px: 3, 
                    py: 1.2, 
                    fontSize: '0.72rem', 
                    color: roleTheme.categoryLabelColor, 
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    mt: index === 0 ? 0.5 : 2 
                  }}
                >
                  {section.label}
                </Typography>
              ) : (
                index > 0 && <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.08)', mx: 1.5 }} />
              )}

              {section.items.map((item) => {
                const isActive = pathname === item.path;
                
                const itemButton = (
                  <ListItemButton
                    component={Link}
                    href={item.path}
                    sx={{
                      borderRadius: 2.5,
                      py: 1.1,
                      px: isCollapsed ? 1 : 2,
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      position: 'relative',
                      overflow: 'hidden',
                      background: isActive
                        ? 'linear-gradient(90deg, rgba(227, 30, 36, 0.28) 0%, rgba(196, 16, 24, 0.15) 60%, rgba(255, 255, 255, 0.04) 100%)'
                        : 'transparent',
                      color: isActive ? '#FFFFFF' : roleTheme.inactiveItemColor,
                      backdropFilter: isActive ? 'blur(12px)' : 'none',
                      border: isActive ? '1px solid rgba(227, 30, 36, 0.35)' : '1px solid transparent',
                      borderLeft: isActive ? '4px solid #E31E24' : '4px solid transparent',
                      boxShadow: isActive
                        ? '0 6px 20px rgba(0, 0, 0, 0.3), inset 0 0 12px rgba(227, 30, 36, 0.2)'
                        : 'none',
                      transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: isCollapsed ? 'scale(1.08)' : 'translateX(4px)',
                        background: isActive
                          ? 'linear-gradient(90deg, rgba(227, 30, 36, 0.35) 0%, rgba(196, 16, 24, 0.2) 60%, rgba(255, 255, 255, 0.06) 100%)'
                          : 'rgba(255, 255, 255, 0.08)',
                        borderColor: isActive ? 'rgba(227, 30, 36, 0.5)' : 'rgba(255, 255, 255, 0.06)',
                        color: '#FFFFFF',
                        '& .MuiListItemIcon-root': {
                          color: '#FF6B6B',
                          transform: 'scale(1.1)',
                        }
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? '#FF6B6B' : 'inherit',
                        minWidth: isCollapsed ? 0 : 38,
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        filter: isActive ? 'drop-shadow(0 0 6px rgba(227, 30, 36, 0.6))' : 'none'
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
                              fontSize: '0.92rem',
                              fontWeight: isActive ? 800 : 500,
                              letterSpacing: isActive ? '0.02em' : 'normal',
                            }
                          }
                        }} 
                      />
                    )}
                  </ListItemButton>
                );

                return (
                  <ListItem key={item.path} disablePadding sx={{ px: isCollapsed ? 1 : 1.8, mb: 0.8 }}>
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
                              fontWeight: 800,
                              fontSize: '0.82rem',
                              py: 0.8,
                              px: 1.5,
                              borderRadius: 2,
                              border: '1px solid rgba(255,255,255,0.15)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                            }
                          }
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

      {/* 👤 User Profile Footer (Adaptive Collapsed & Expanded) 👤 */}
      <Box sx={{ p: isCollapsed ? 1.5 : 2, borderTop: `1px solid ${roleTheme.borderColor}` }}>
        {!isCollapsed ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.8,
              p: 1.5,
              borderRadius: 3,
              bgcolor: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(227, 30, 36, 0.3)'
              }
            }}
          >
            <Avatar
              sx={{
                bgcolor: '#E31E24',
                color: '#FFFFFF',
                fontWeight: 800,
                width: 40,
                height: 40,
                boxShadow: '0 4px 12px rgba(227, 30, 36, 0.4)',
                border: '1.5px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <Typography noWrap sx={{ fontSize: '0.92rem', color: '#FFFFFF', fontWeight: 800 }}>
                {session?.user?.name || 'Utilisateur'}
              </Typography>
              <Chip
                label={roleTheme.roleLabel}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  bgcolor: 'rgba(227, 30, 36, 0.35)',
                  color: '#FFCDD2',
                  border: '1px solid rgba(255, 205, 210, 0.3)',
                  mt: 0.3,
                }}
              />
            </Box>
            <Tooltip title="Déconnexion" placement="top" arrow>
              <IconButton
                size="small"
                onClick={handleLogout}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  '&:hover': {
                    color: '#FFFFFF',
                    bgcolor: '#E31E24',
                    boxShadow: '0 0 10px rgba(227, 30, 36, 0.6)'
                  }
                }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Tooltip title={`${session?.user?.name || 'Utilisateur'} (${roleTheme.roleLabel})`} placement="right" arrow>
              <Avatar
                sx={{
                  bgcolor: '#E31E24',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  width: 38,
                  height: 38,
                  boxShadow: '0 4px 12px rgba(227, 30, 36, 0.4)',
                  cursor: 'pointer'
                }}
              >
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
            </Tooltip>
            <Tooltip title="Déconnexion" placement="right" arrow>
              <IconButton
                size="small"
                onClick={handleLogout}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': { color: '#FFFFFF', bgcolor: '#E31E24' }
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
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F9FC' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { md: `${currentDrawerWidth}px` },
          backgroundColor: 'white',
          borderBottom: '1px solid #E5E7EB',
          color: '#1A1A2E',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography sx={{ fontSize: '1.25rem', color: '#1A1A2E', display: { xs: 'none', sm: 'block' } }}>
              {currentTitle}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F3F4F6',
                borderRadius: 8,
                px: 2,
                py: 0.5,
                width: { xs: '150px', sm: '250px', md: '300px' },
              }}
            >
              <SearchIcon sx={{ color: '#9CA3AF', mr: 1 }} />
              <InputBase
                placeholder="Rechercher..."
                sx={{ width: '100%', fontSize: '0.875rem' }}
              />
            </Box>

            <IconButton size="large" sx={{ color: '#4B5563' }}>
              <Badge badgeContent={3} sx={{ '& .MuiBadge-badge': { backgroundColor: roleTheme.appBarAccent, color: 'white' } }}>
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <Avatar sx={{ bgcolor: roleTheme.appBarAccent, color: 'white', fontWeight: 700, width: 36, height: 36 }}>
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{
                paper: {
                  elevation: 3,
                  sx: { mt: 1, minWidth: 200, borderRadius: 2 }
                }
              }}
            >
              <MenuItem onClick={() => { handleMenuClose(); router.push(isEmployee ? '/dashboard/employee/profil' : '/dashboard/profile'); }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <PeopleIcon fontSize="small" />
                </ListItemIcon>
                Mon Profil
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: '#E31E24' }}>
                <ListItemIcon sx={{ color: '#E31E24', minWidth: 36 }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Déconnexion
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation */}
      <Box component="nav" sx={{ width: { md: currentDrawerWidth }, flexShrink: { md: 0 }, transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: currentDrawerWidth,
              borderRight: 'none',
              overflowX: 'hidden',
              transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          mt: '64px', // AppBar height
          animation: 'fadeIn 0.5s ease-out',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
