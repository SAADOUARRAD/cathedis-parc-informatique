'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Skeleton,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material';

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  title?: string;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  onEdit,
  onDelete,
  searchPlaceholder = "Rechercher...",
  emptyMessage = "Aucune donnée disponible",
  title,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((row) => {
        return Object.values(row).some((val) => 
          val !== null && val !== undefined && String(val).toLowerCase().includes(lowerQuery)
        );
      });
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchQuery, sortConfig]);

  const paginatedData = useMemo(() => {
    return filteredAndSortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredAndSortedData, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 4, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', animation: 'fadeIn 0.5s ease-in-out', '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } } }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        {title && (
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1A1A2E' }}>
            {title}
          </Typography>
        )}
        <TextField
          variant="outlined"
          size="small"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 8, bgcolor: '#F8F9FC', '& fieldset': { border: 'none' } }
            }
          }}
          sx={{ minWidth: 250 }}
        />
      </Box>

      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#F1F5F9' }}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align || 'left'}
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: '0.75rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em', 
                    color: '#64748B',
                    width: column.width,
                    cursor: column.sortable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: column.align === 'right' ? 'flex-end' : column.align === 'center' ? 'center' : 'flex-start' }}>
                    {column.label}
                    {column.sortable && sortConfig?.key === column.key && (
                      sortConfig.direction === 'asc' ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />
                    )}
                  </Box>
                </TableCell>
              ))}
              {(onEdit || onDelete) && (
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from(new Array(5)).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton animation="wave" />
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell>
                      <Skeleton animation="wave" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} sx={{ py: 8 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: '#94A3B8' }}>
                    <SearchIcon sx={{ fontSize: 48, opacity: 0.5 }} />
                    <Typography sx={{ fontWeight: 500 }}>{emptyMessage}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <TableRow 
                  key={rowIndex}
                  sx={{ 
                    '&:hover': { bgcolor: 'rgba(227,30,36,0.03)' },
                    transition: 'background-color 0.2s',
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} align={column.align || 'left'} sx={{ color: '#1E293B' }}>
                      {column.render ? column.render(row) : row[column.key]}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        {onEdit && (
                          <IconButton size="small" onClick={() => onEdit(row)} sx={{ color: '#3B82F6', bgcolor: 'rgba(59,130,246,0.1)', '&:hover': { bgcolor: 'rgba(59,130,246,0.2)' } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                        {onDelete && (
                          <IconButton size="small" onClick={() => onDelete(row)} sx={{ color: '#EF4444', bgcolor: 'rgba(239,68,68,0.1)', '&:hover': { bgcolor: 'rgba(239,68,68,0.2)' } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredAndSortedData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Lignes par page"
        sx={{ borderTop: '1px solid #E2E8F0' }}
      />
    </Paper>
  );
}
