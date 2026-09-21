import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchPurchases = createAsyncThunk(
  'purchases/fetchPurchases',
  async ({ search = '', dateFrom = '', dateTo = '' } = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (dateFrom) query.append('dateFrom', dateFrom);
      if (dateTo) query.append('dateTo', dateTo);

      const res = await fetch(`/api/purchases?${query.toString()}`);
      const json = await res.json();
      if (!json.success) {
        return rejectWithValue(json.error || 'Failed to fetch purchases');
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
  dateFrom: '',
  dateTo: '',
  selectedPurchase: null,
  isModalOpen: false,
};

const purchasesSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    setPurchaseSearch: (state, action) => {
      state.search = action.payload;
    },
    setDateRange: (state, action) => {
      state.dateFrom = action.payload.dateFrom || '';
      state.dateTo = action.payload.dateTo || '';
    },
    setSelectedPurchase: (state, action) => {
      state.selectedPurchase = action.payload;
    },
    setIsPurchaseModalOpen: (state, action) => {
      state.isModalOpen = action.payload;
    },
    purchaseAdded: (state, action) => {
      state.list.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || [];
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error loading purchases';
      });
  },
});

export const {
  setPurchaseSearch,
  setDateRange,
  setSelectedPurchase,
  setIsPurchaseModalOpen,
  purchaseAdded,
} = purchasesSlice.actions;

export default purchasesSlice.reducer;
