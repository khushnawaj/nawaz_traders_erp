import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchSales = createAsyncThunk(
  'sales/fetchSales',
  async ({ search = '' } = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams({ search });
      const res = await fetch(`/api/sales?${query.toString()}`);
      const json = await res.json();
      if (!json.success) {
        return rejectWithValue(json.error || 'Failed to fetch sales');
      }
      return json;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  list: [],
  loading: false,
  error: null,
  search: '',
  isSaleModalOpen: false,
  selectedSale: null,
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setSaleSearch: (state, action) => {
      state.search = action.payload;
    },
    setIsSaleModalOpen: (state, action) => {
      state.isSaleModalOpen = action.payload;
    },
    setSelectedSale: (state, action) => {
      state.selectedSale = action.payload;
    },
    saleAdded: (state, action) => {
      state.list.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || [];
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error loading sales';
      });
  },
});

export const {
  setSaleSearch,
  setIsSaleModalOpen,
  setSelectedSale,
  saleAdded,
} = salesSlice.actions;

export default salesSlice.reducer;
