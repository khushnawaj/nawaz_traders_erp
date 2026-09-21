import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchInvestors = createAsyncThunk(
  'investors/fetchInvestors',
  async ({ search = '', category = 'ALL', status = 'ALL' } = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams({ search, category, status });
      const res = await fetch(`/api/investors?${query.toString()}`);
      const json = await res.json();
      if (!json.success) {
        return rejectWithValue(json.error || 'Failed to fetch investors');
      }
      return json;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createInvestor = createAsyncThunk(
  'investors/createInvestor',
  async (investorData, { rejectWithValue, dispatch }) => {
    try {
      const res = await fetch('/api/investors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(investorData),
      });
      const json = await res.json();
      if (!json.success) {
        return rejectWithValue(json.error || 'Failed to create investor');
      }
      dispatch(fetchInvestors());
      return json.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateInvestor = createAsyncThunk(
  'investors/updateInvestor',
  async ({ id, ...updateData }, { rejectWithValue, dispatch }) => {
    try {
      const res = await fetch(`/api/investors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const json = await res.json();
      if (!json.success) {
        return rejectWithValue(json.error || 'Failed to update investor');
      }
      dispatch(fetchInvestors());
      return json.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteInvestor = createAsyncThunk(
  'investors/deleteInvestor',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const res = await fetch(`/api/investors/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!json.success) {
        return rejectWithValue(json.error || 'Failed to delete investor');
      }
      dispatch(fetchInvestors());
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const recordInvestorTransaction = createAsyncThunk(
  'investors/recordInvestorTransaction',
  async ({ investorId, ...transactionData }, { rejectWithValue, dispatch }) => {
    try {
      const res = await fetch(`/api/investors/${investorId}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });
      const json = await res.json();
      if (!json.success) {
        return rejectWithValue(json.error || 'Failed to record transaction');
      }
      dispatch(fetchInvestors());
      return json.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  list: [],
  stats: {
    totalPrincipal: 0,
    totalOutstanding: 0,
    totalPaidPrincipal: 0,
    totalPaidInterest: 0,
    totalCount: 0,
    activeCount: 0,
    bankCount: 0,
    investorCount: 0,
  },
  loading: false,
  error: null,
  search: '',
  categoryFilter: 'ALL', // ALL | INVESTOR | BANK | PRIVATE_FINANCIER | INDIVIDUAL_LENDER
  statusFilter: 'ALL',   // ALL | ACTIVE | INACTIVE
  viewMode: 'grid',      // grid | table
  selectedInvestor: null,
  isFormModalOpen: false,
  isTransactionModalOpen: false,
  isLedgerModalOpen: false,
};

const investorsSlice = createSlice({
  name: 'investors',
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setCategoryFilter: (state, action) => {
      state.categoryFilter = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setSelectedInvestor: (state, action) => {
      state.selectedInvestor = action.payload;
    },
    setIsFormModalOpen: (state, action) => {
      state.isFormModalOpen = action.payload;
    },
    setIsTransactionModalOpen: (state, action) => {
      state.isTransactionModalOpen = action.payload;
    },
    setIsLedgerModalOpen: (state, action) => {
      state.isLedgerModalOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvestors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestors.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || [];
        if (action.payload.stats) {
          state.stats = action.payload.stats;
        }
      })
      .addCase(fetchInvestors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error loading investors';
      });
  },
});

export const {
  setSearch,
  setCategoryFilter,
  setStatusFilter,
  setViewMode,
  setSelectedInvestor,
  setIsFormModalOpen,
  setIsTransactionModalOpen,
  setIsLedgerModalOpen,
} = investorsSlice.actions;

export default investorsSlice.reducer;
