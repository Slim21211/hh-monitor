/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Продакшн URL Cloudflare Worker
const API_BASE = 'https://hh-proxy.v-g-davydoff.workers.dev/hh';

export interface VacancySearchParams {
  text: string;
  area?: string;
  salary?: number;
  currency?: string;
  experience?: string;
  employment?: string;
  schedule?: string;
  professional_role?: string;
  industry?: string;
  employer_id?: string;
  published_date_from?: string;
  published_date_to?: string;
  order_by?: string;
  clusters?: boolean;
  describe_arguments?: boolean;
  label?: string;
  only_with_salary?: boolean;
  period?: number;
  top?: number;
  search_field?: string;
  per_page?: number;
  page?: number;
}

export interface Vacancy {
  id: string;
  name: string;
  area: { id: string; name: string };
  salary: { from: number | null; to: number | null; currency: string; gross: boolean } | null;
  employer: { id: string; name: string; alternate_url: string };
  published_at: string;
  alternate_url: string;
  experience: { id: string; name: string };
  schedule: { id: string; name: string };
  work_schedule_by_days: Array<{ id: string; name: string }>;
}

export interface VacancySearchResponse {
  items: Vacancy[];
  found: number;
  pages: number;
  page: number;
  per_page: number;
}

export const hhApi = createApi({
  reducerPath: 'hhApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
  }),
  endpoints: (builder) => ({
    searchVacancies: builder.query<VacancySearchResponse, VacancySearchParams>({
      query: (params) => ({
        url: '/vacancies',
        params: {
          ...params,
          per_page: 100,
        },
      }),
    }),
    getAreas: builder.query<any[], void>({
      query: () => '/areas',
    }),
    getDictionaries: builder.query<any, void>({
      query: () => '/dictionaries',
    }),
  }),
});

export const {
  useSearchVacanciesQuery,
  useLazySearchVacanciesQuery,
  useGetAreasQuery,
  useGetDictionariesQuery,
} = hhApi;
