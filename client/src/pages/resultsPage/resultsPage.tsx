/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TableSortLabel,
  Link,
  Chip,
  Box,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Download as DownloadIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { type Vacancy, useLazySearchVacanciesQuery } from '../../store/api/hhApi';
import * as XLSX from 'xlsx';
import styles from './resultsPage.module.scss';
import type { RootState } from '../../store/store';

type SortField = 'name' | 'employer' | 'area' | 'salary_from' | 'salary_to' | 'published_at' | 'experience';
type SortDirection = 'asc' | 'desc';

const ResultsPage: React.FC = () => {
  const [sortField, setSortField] = useState<SortField>('published_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  const [searchVacancies, { isLoading: isSearchLoading }] = useLazySearchVacanciesQuery();

  // Получаем последние результаты поиска и параметры из состояния RTK Query
  const { vacancies, totalFound, totalPages, lastSearchParams } = useSelector((state: RootState) => {
    const hhApiState = state.hhApi;
    const queries = hhApiState.queries;
    
    // Ищем последний успешный запрос поиска вакансий
    const searchQuery = Object.values(queries).find(
      (query: any) => 
        query?.endpointName === 'searchVacancies' && 
        query?.status === 'fulfilled'
    ) as any;
    
    const data = searchQuery?.data;
    const params = searchQuery?.originalArgs;
    
    return {
      vacancies: data?.items || [],
      totalFound: data?.found || 0,
      totalPages: data?.pages || 0,
      lastSearchParams: params || null,
    };
  });

  const handlePageChange = async (event: React.ChangeEvent<unknown>, page: number) => {
    event.preventDefault();

    if (lastSearchParams) {
      setCurrentPage(page);
      try {
        await searchVacancies({
          ...lastSearchParams,
          page: page - 1, // HH API использует 0-based индексацию
          per_page: itemsPerPage,
        });
      } catch (error) {
        console.error('Error loading page:', error);
      }
    }
  };

  const handleItemsPerPageChange = async (event: any) => {
    const newPerPage = event.target.value;
    setItemsPerPage(newPerPage);
    setCurrentPage(1);
    
    if (lastSearchParams) {
      try {
        await searchVacancies({
          ...lastSearchParams,
          page: 0,
          per_page: newPerPage,
        });
      } catch (error) {
        console.error('Error changing items per page:', error);
      }
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedVacancies = useMemo(() => {
    return [...vacancies].sort((a: Vacancy, b: Vacancy) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'employer':
          aValue = a.employer.name.toLowerCase();
          bValue = b.employer.name.toLowerCase();
          break;
        case 'area':
          aValue = a.area.name.toLowerCase();
          bValue = b.area.name.toLowerCase();
          break;
        case 'salary_from':
          aValue = a.salary?.from || 0;
          bValue = b.salary?.from || 0;
          break;
        case 'salary_to':
          aValue = a.salary?.to || 0;
          bValue = b.salary?.to || 0;
          break;
        case 'published_at':
          aValue = new Date(a.published_at);
          bValue = new Date(b.published_at);
          break;
        case 'experience':
          aValue = a.experience.name.toLowerCase();
          bValue = b.experience.name.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [vacancies, sortField, sortDirection]);

  const exportToExcel = () => {
    const exportData = sortedVacancies.map((vacancy, index) => ({
      '№': index + 1,
      'Название вакансии': vacancy.name,
      'Компания': vacancy.employer.name,
      'Регион': vacancy.area.name,
      'Зарплата от': vacancy.salary?.from || '-',
      'Зарплата до': vacancy.salary?.to || '-',
      'Gross/Net': vacancy.salary ? (vacancy.salary.gross ? 'Gross' : 'Net') : '-',
      'График работы': vacancy.work_schedule_by_days.map((s: Vacancy['schedule']) => s.name).join(', ') || '-',
      'Опыт': vacancy.experience.name,
      'Дата публикации': new Date(vacancy.published_at).toLocaleDateString('ru-RU'),
      'Ссылка': vacancy.alternate_url,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Вакансии');
    XLSX.writeFile(wb, `vacancies_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (vacancies.length === 0) {
    return (
      <Paper className={styles.paper}>
        <Typography variant="h5" className={styles.noResults}>
          Результаты поиска не найдены
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Выполните поиск на странице "Поиск" для отображения вакансий
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper className={styles.paper}>
      <Box className={styles.header}>
        <Typography variant="h4" component="h1" className={styles.title}>
          Результаты поиска
        </Typography>
        <Box className={styles.actions}>
          <FormControl size="small" className={styles.perPageSelect}>
            <InputLabel>Показать</InputLabel>
            <Select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              label="Показать"
              disabled={isSearchLoading}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
          <Chip 
            label={`Найдено: ${totalFound.toLocaleString()}`} 
            className={styles.countChip}
          />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
          >
            Обновить
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={exportToExcel}
            className={styles.exportButton}
          >
            Экспорт в Excel
          </Button>
        </Box>
      </Box>

      <TableContainer className={styles.tableContainer}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell className={styles.headerCell}>№</TableCell>
              <TableCell className={styles.headerCell}>
                <TableSortLabel
                  active={sortField === 'name'}
                  direction={sortField === 'name' ? sortDirection : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Название вакансии
                </TableSortLabel>
              </TableCell>
              <TableCell className={styles.headerCell}>
                <TableSortLabel
                  active={sortField === 'employer'}
                  direction={sortField === 'employer' ? sortDirection : 'asc'}
                  onClick={() => handleSort('employer')}
                >
                  Компания
                </TableSortLabel>
              </TableCell>
              <TableCell className={styles.headerCell}>
                <TableSortLabel
                  active={sortField === 'area'}
                  direction={sortField === 'area' ? sortDirection : 'asc'}
                  onClick={() => handleSort('area')}
                >
                  Регион
                </TableSortLabel>
              </TableCell>
              <TableCell className={styles.headerCell}>
                <TableSortLabel
                  active={sortField === 'salary_from'}
                  direction={sortField === 'salary_from' ? sortDirection : 'asc'}
                  onClick={() => handleSort('salary_from')}
                >
                  Зарплата от
                </TableSortLabel>
              </TableCell>
              <TableCell className={styles.headerCell}>
                <TableSortLabel
                  active={sortField === 'salary_to'}
                  direction={sortField === 'salary_to' ? sortDirection : 'asc'}
                  onClick={() => handleSort('salary_to')}
                >
                  Зарплата до
                </TableSortLabel>
              </TableCell>
              <TableCell className={styles.headerCell}>Gross/Net</TableCell>
              <TableCell className={styles.headerCell}>График</TableCell>
              <TableCell className={styles.headerCell}>
                <TableSortLabel
                  active={sortField === 'experience'}
                  direction={sortField === 'experience' ? sortDirection : 'asc'}
                  onClick={() => handleSort('experience')}
                >
                  Опыт
                </TableSortLabel>
              </TableCell>
              <TableCell className={styles.headerCell}>
                <TableSortLabel
                  active={sortField === 'published_at'}
                  direction={sortField === 'published_at' ? sortDirection : 'asc'}
                  onClick={() => handleSort('published_at')}
                >
                  Дата публикации
                </TableSortLabel>
              </TableCell>
              <TableCell className={styles.headerCell}>Ссылка</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedVacancies.map((vacancy: Vacancy, index: number) => (
              <TableRow key={vacancy.id} className={styles.tableRow}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className={styles.vacancyName}>
                  {vacancy.name}
                </TableCell>
                <TableCell>{vacancy.employer.name}</TableCell>
                <TableCell>{vacancy.area.name}</TableCell>
                <TableCell>
                  {vacancy.salary?.from ? vacancy.salary.from.toLocaleString() : '-'}
                </TableCell>
                <TableCell>
                  {vacancy.salary?.to ? vacancy.salary.to.toLocaleString() : '-'}
                </TableCell>
                <TableCell>
                  {vacancy.salary ? (vacancy.salary.gross ? 'Gross' : 'Net') : '-'}
                </TableCell>
                <TableCell>
                  {vacancy.work_schedule_by_days.map(schedule => schedule.name).join(', ') || '-'}
                </TableCell>
                <TableCell>{vacancy.experience.name}</TableCell>
                <TableCell>{formatDate(vacancy.published_at)}</TableCell>
                <TableCell>
                  <Link
                    href={vacancy.alternate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.vacancyLink}
                  >
                    Открыть
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Пагинация */}
      <Box className={styles.paginationContainer}>
        <Box className={styles.paginationInfo}>
          <Typography variant="body2" color="textSecondary">
            Страница {currentPage} из {totalPages} 
            {totalFound > 0 && ` • Показано ${vacancies.length} из ${totalFound.toLocaleString()}`}
          </Typography>
        </Box>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          size="large"
          disabled={isSearchLoading}
          className={styles.pagination}
        />
      </Box>
    </Paper>
  );
};

export default ResultsPage;