import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isSidebarOpen: true,
  activeModal: null, // null | 'FARMER_FORM' | 'FARMER_PURCHASE' | 'SALE_FORM' | 'GODOWN_FORM' | 'VEHICLE_FORM'
  viewMode: 'grid', // 'grid' | 'table'
  globalNotification: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
    setActiveModal: (state, action) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setGlobalNotification: (state, action) => {
      state.globalNotification = action.payload;
    },
    clearGlobalNotification: (state) => {
      state.globalNotification = null;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setActiveModal,
  closeModal,
  setViewMode,
  setGlobalNotification,
  clearGlobalNotification,
} = uiSlice.actions;

export default uiSlice.reducer;
