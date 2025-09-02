import { configureStore } from '@reduxjs/toolkit';
import { hhApi } from './api/hhApi';

export const store = configureStore({
  reducer: {
    [hhApi.reducerPath]: hhApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(hhApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;