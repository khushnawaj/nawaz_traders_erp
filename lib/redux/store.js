import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import farmersReducer from './slices/farmersSlice';
import purchasesReducer from './slices/purchasesSlice';
import salesReducer from './slices/salesSlice';
import investorsReducer from './slices/investorsSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    farmers: farmersReducer,
    purchases: purchasesReducer,
    sales: salesReducer,
    investors: investorsReducer,
    notifications: notificationsReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
