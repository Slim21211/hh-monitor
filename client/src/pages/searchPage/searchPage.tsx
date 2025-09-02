/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  FormControlLabel,
  Checkbox,
  Box,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetAreasQuery, useLazySearchVacanciesQuery } from '../../store/api/hhApi';
import styles from './searchPage.module.scss';
import type { SearchFormData } from '../../types';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: areas } = useGetAreasQuery();
  const [searchVacancies, { isLoading }] = useLazySearchVacanciesQuery();

  const [formData, setFormData] = useState<SearchFormData>({
    text: '',
    area: '',
    salary: '',
    currency: 'RUR',
    experience: '',
    employment: '',
    schedule: '',
    professional_role: '',
    industry: '',
    employer_id: '',
    published_date_from: '',
    published_date_to: '',
    vacancy_search_order: 'publication_time',
    only_with_salary: false,
    period: '30',
  });

  const handleInputChange = (field: keyof SearchFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.text.trim()) {
      alert('Введите название вакансии');
      return;
    }

    try {
      const searchParams: any = {
        text: formData.text,
      };

      // Добавляем только заполненные поля
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof SearchFormData];
        if (value && value !== '' && key !== 'text') {
          if (key === 'salary' && value) {
            searchParams.salary = parseInt(value as string);
          } else if (typeof value === 'boolean') {
            searchParams[key] = value;
          } else if (key === 'period' && value) {
            searchParams.period = parseInt(value as string);
          } else if (key === 'vacancy_search_order') {
            searchParams.order_by = value; // HH API использует order_by вместо vacancy_search_order
          } else {
            searchParams[key] = value;
          }
        }
      });

      await searchVacancies(searchParams);
      navigate('/results');
    } catch (error) {
      console.error('Search error:', error);
      alert('Ошибка при поиске вакансий');
    }
  };

  const russianAreas = areas?.find(country => country.id === '113')?.areas || [];

  return (
    <Paper className={styles.paper}>
      <Typography variant="h4" component="h1" className={styles.title}>
        Поиск вакансий на HeadHunter
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Обязательное поле - название вакансии */}
          <TextField
            fullWidth
            label="Название вакансии"
            value={formData.text}
            onChange={handleInputChange('text')}
            required
            variant="outlined"
          />

          {/* Регион и зарплата */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <FormControl fullWidth>
                <InputLabel>Регион</InputLabel>
                <Select
                  value={formData.area}
                  onChange={handleInputChange('area')}
                  label="Регион"
                >
                  <MenuItem value="">Все регионы</MenuItem>
                  {russianAreas.map((area: any) => (
                    <MenuItem key={area.id} value={area.id}>
                      {area.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
              <TextField
                fullWidth
                label="Зарплата от"
                type="number"
                value={formData.salary}
                onChange={handleInputChange('salary')}
                variant="outlined"
              />
            </Box>

            <Box sx={{ flex: '1 1 120px', minWidth: '120px' }}>
              <FormControl fullWidth>
                <InputLabel>Валюта</InputLabel>
                <Select
                  value={formData.currency}
                  onChange={handleInputChange('currency')}
                  label="Валюта"
                >
                  <MenuItem value="RUR">RUB</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="BYR">BYN</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Опыт работы и тип занятости */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 250px', minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel>Опыт работы</InputLabel>
                <Select
                  value={formData.experience}
                  onChange={handleInputChange('experience')}
                  label="Опыт работы"
                >
                  <MenuItem value="">Любой</MenuItem>
                  <MenuItem value="noExperience">Нет опыта</MenuItem>
                  <MenuItem value="between1And3">От 1 года до 3 лет</MenuItem>
                  <MenuItem value="between3And6">От 3 до 6 лет</MenuItem>
                  <MenuItem value="moreThan6">Более 6 лет</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: '1 1 250px', minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel>Тип занятости</InputLabel>
                <Select
                  value={formData.employment}
                  onChange={handleInputChange('employment')}
                  label="Тип занятости"
                >
                  <MenuItem value="">Любой</MenuItem>
                  <MenuItem value="full">Полная занятость</MenuItem>
                  <MenuItem value="part">Частичная занятость</MenuItem>
                  <MenuItem value="project">Проектная работа</MenuItem>
                  <MenuItem value="volunteer">Волонтерство</MenuItem>
                  <MenuItem value="probation">Стажировка</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* График работы */}
          <FormControl fullWidth>
            <InputLabel>График работы</InputLabel>
            <Select
              value={formData.schedule}
              onChange={handleInputChange('schedule')}
              label="График работы"
            >
              <MenuItem value="">Любой</MenuItem>
              <MenuItem value="fullDay">Полный день</MenuItem>
              <MenuItem value="shift">Сменный график</MenuItem>
              <MenuItem value="flexible">Гибкий график</MenuItem>
              <MenuItem value="remote">Удаленная работа</MenuItem>
              <MenuItem value="flyInFlyOut">Вахтовый метод</MenuItem>
            </Select>
          </FormControl>

          {/* Сортировка и период */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 250px', minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel>Сортировка</InputLabel>
                <Select
                  value={formData.vacancy_search_order}
                  onChange={handleInputChange('vacancy_search_order')}
                  label="Сортировка"
                >
                  <MenuItem value="publication_time">По дате публикации</MenuItem>
                  <MenuItem value="salary_desc">По убыванию зарплаты</MenuItem>
                  <MenuItem value="salary_asc">По возрастанию зарплаты</MenuItem>
                  <MenuItem value="relevance">По релевантности</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: '1 1 250px', minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel>Период поиска (дней)</InputLabel>
                <Select
                  value={formData.period}
                  onChange={handleInputChange('period')}
                  label="Период поиска (дней)"
                >
                  <MenuItem value="1">1 день</MenuItem>
                  <MenuItem value="3">3 дня</MenuItem>
                  <MenuItem value="7">7 дней</MenuItem>
                  <MenuItem value="30">30 дней</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Только с указанной зарплатой */}
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.only_with_salary}
                onChange={handleInputChange('only_with_salary')}
                className={styles.checkbox}
              />
            }
            label="Только вакансии с указанной зарплатой"
          />

          {/* Кнопка поиска */}
          <Box className={styles.submitContainer}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<SearchIcon />}
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? 'Поиск...' : 'Найти вакансии'}
            </Button>
          </Box>
        </Box>
      </form>
    </Paper>
  );
};

export default SearchPage;