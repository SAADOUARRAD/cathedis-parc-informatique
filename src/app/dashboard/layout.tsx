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
    label: 'SUPPORT',
    items: [
      { text: 'Mes Tickets', path: '/dashboard/employee/mes-tickets', icon: <BuildIcon /> },
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
      { text: 'Mouvements', path: '/dashboard/movements', icon: <SwapHorizIcon /> },
      { text: 'Inventaires', path: '/dashboard/inventories', icon: <InventoryIcon /> },
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
    sidebarBg: 'linear-gradient(180deg, #D32F2F 0%, #7B0000 100%)', // Red sidebar for Employee!
    activeItemBg: '#FFFFFF',
    activeItemColor: '#B71C1C',
    inactiveItemColor: '#FFFFFF',
    hoverBg: 'rgba(255, 255, 255, 0.15)',
    categoryLabelColor: 'rgba(255, 255, 255, 0.75)',
    avatarBg: '#FFFFFF',
    avatarColor: '#B71C1C',
    roleBadgeBg: 'rgba(255, 255, 255, 0.25)',
    roleBadgeColor: '#FFFFFF',
    roleLabel: 'EMPLOYÉ',
    appBarAccent: '#D32F2F',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    userNameColor: '#FFFFFF',
    logoutIconColor: 'rgba(255, 255, 255, 0.8)',
  },
  TECHNICIAN: {
    sidebarBg: '#FFFFFF', // Clean WHITE sidebar for Technician!
    activeItemBg: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
    activeItemColor: '#FFFFFF',
    inactiveItemColor: '#334155',
    hoverBg: 'rgba(227, 30, 36, 0.08)',
    categoryLabelColor: '#64748B',
    avatarBg: '#E31E24',
    avatarColor: '#FFFFFF',
    roleBadgeBg: 'rgba(227, 30, 36, 0.12)',
    roleBadgeColor: '#E31E24',
    roleLabel: 'TECHNICIEN',
    appBarAccent: '#E31E24',
    borderColor: '#E2E8F0',
    userNameColor: '#0F172A',
    logoutIconColor: '#64748B',
  },
  ADMIN: {
    sidebarBg: 'linear-gradient(180deg, #1A1A2E 0%, #0D0D1A 100%)', // Dark Navy for Admin!
    activeItemBg: 'linear-gradient(90deg, #E31E24 0%, #C41018 100%)',
    activeItemColor: '#FFFFFF',
    inactiveItemColor: '#FFFFFF',
    hoverBg: 'rgba(255, 255, 255, 0.08)',
    categoryLabelColor: '#888888',
    avatarBg: '#E31E24',
    avatarColor: '#FFFFFF',
    roleBadgeBg: 'rgba(227, 30, 36, 0.25)',
    roleBadgeColor: '#FF6B6B',
    roleLabel: 'ADMINISTRATEUR',
    appBarAccent: '#E31E24',
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: roleTheme.sidebarBg, color: 'white' }}>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box
          component="img"
          src={isTechnician ? "/images/logo2.png" : "/images/logo_cathedis.png"}
          alt="Cathedis"
          sx={{ maxWidth: isTechnician ? '190px' : '180px', height: 'auto' }}
        />
      </Box>
      
      <Box sx={{ overflowY: 'auto', flexGrow: 1, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '3px' } }}>
        <List sx={{ pt: 0, pb: 4 }}>
          {menuSections.map((section, index) => (
            <React.Fragment key={index}>
              <Typography 
                sx={{ 
                  px: 3, 
                  py: 1.5, 
                  fontSize: '0.75rem', 
                  color: roleTheme.categoryLabelColor, 
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  mt: index === 0 ? 0 : 2 
                }}
              >
                {section.label}
              </Typography>
              {section.items.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <ListItem key={item.path} disablePadding sx={{ px: 2, mb: 0.5 }}>
                    <ListItemButton
                      component={Link}
                      href={item.path}
                      sx={{
                        borderRadius: 2,
                        py: 1.2,
                        background: isActive ? roleTheme.activeItemBg : 'transparent',
                        color: isActive ? roleTheme.activeItemColor : roleTheme.inactiveItemColor,
                        fontWeight: isActive ? 700 : 500,
                        boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                        '&:hover': {
                          backgroundColor: isActive ? roleTheme.activeItemBg : roleTheme.hoverBg,
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text} 
                        slotProps={{ primary: { sx: { fontSize: '0.95rem', fontWeight: isActive ? 700 : 500 } } }} 
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </React.Fragment>
          ))}
        </List>
      </Box>

      <Box sx={{ p: 2, borderTop: `1px solid ${roleTheme.borderColor}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, borderRadius: 2, '&:hover': { backgroundColor: roleTheme.hoverBg } }}>
          <Avatar sx={{ bgcolor: roleTheme.avatarBg, color: roleTheme.avatarColor, fontWeight: 700, width: 40, height: 40 }}>
            {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Typography noWrap sx={{ fontSize: '0.9rem', color: roleTheme.userNameColor, fontWeight: 600 }}>
              {session?.user?.name || 'Utilisateur'}
            </Typography>
            <Chip
              label={roleTheme.roleLabel}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 700,
                bgcolor: roleTheme.roleBadgeBg,
                color: roleTheme.roleBadgeColor,
                mt: 0.3,
              }}
            />
          </Box>
          <IconButton size="small" onClick={handleLogout} sx={{ color: roleTheme.logoutIconColor, '&:hover': { color: roleTheme.appBarAccent } }}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Box>
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
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'white',
          borderBottom: '1px solid #E5E7EB',
          color: '#1A1A2E',
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
              <MenuItem onClick={handleMenuClose}>Mon Profil</MenuItem>
              <MenuItem onClick={handleMenuClose}>Paramètres</MenuItem>
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
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
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
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px', // AppBar height
          animation: 'fadeIn 0.5s ease-out',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
