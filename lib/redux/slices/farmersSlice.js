import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchFarmers = createAsyncThunk(
  'farmers/fetchFarmers',
  async ({ search = '' } = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams({ search, role: 'FARMER' });
      const res = await fetch(`/api/parties?${query.toString()}`);
      const json = await res.json();
      if (!json.success) {
        return rejectWithValue(json.error || 'Failed to fetch farmers');
      }
      return json;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  list: [],
  stats: {
    totalPayables: '0',
    totalReceivables: '0',
    farmerCount: 0,
  },
  loading: false,
  error: null,
  search: '',
  balanceFilter: 'ALL', // 'ALL' | 'PAYABLE' | 'RECEIVABLE'
  selectedVillage: 'ALL',
  viewMode: 'grid', // 'grid' | 'table'
  selectedFarmerForPurchase: null,
  isModalOpen: false,
  isPurchaseModalOpen: false,
};

const farmersSlice = createSlice({
  name: 'farmers',
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setBalanceFilter: (state, action) => {
      state.balanceFilter = action.payload;
    },
    setSelectedVillage: (state, action) => {
      state.selectedVillage = action.payload;
    },
    setFarmerViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setSelectedFarmerForPurchase: (state, action) => {
      state.selectedFarmerForPurchase = action.payload;
    },
    setIsFarmerModalOpen: (state, action) => {
      state.isModalOpen = action.payload;
    },
    setIsPurchaseModalOpen: (state, action) => {
      state.isPurchaseModalOpen = action.payload;
    },
    farmerAddedOrUpdated: (state, action) => {
      const updatedFarmer = action.payload;
      const index = state.list.findIndex((f) => f.id === updatedFarmer.id);
      if (index !== -1) {
        state.list[index] = updatedFarmer;
      } else {
        state.list.unshift(updatedFarmer);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFarmers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFarmers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || [];
        if (action.payload.stats) {
          state.stats = {
            totalPayables: action.payload.stats.totalPayables || '0',
            totalReceivables: action.payload.stats.totalReceivables || '0',
            farmerCount: action.payload.stats.farmerCount || 0,
          };
        }
      })
      .addCase(fetchFarmers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error loading farmers';
      });
  },
});

export const {
  setSearch,
  setBalanceFilter,
  setSelectedVillage,
  setFarmerViewMode,
  setSelectedFarmerForPurchase,
  setIsFarmerModalOpen,
  setIsPurchaseModalOpen,
  farmerAddedOrUpdated,
} = farmersSlice.actions;

export default farmersSlice.reducer;
