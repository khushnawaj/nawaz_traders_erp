import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/**
 * Async Thunk to fetch dynamic notifications from API
 */
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/notifications');
      const json = await res.json();
      if (!json.success) {
        return rejectWithValue(json.error || 'Failed to fetch notifications');
      }
      return json;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/**
 * Async Thunk to mark notification(s) as read
 */
export const markNotificationsRead = createAsyncThunk(
  'notifications/markNotificationsRead',
  async (notificationIds = [], { rejectWithValue }) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      });
      const json = await res.json();
      if (!json.success) {
        return rejectWithValue(json.error || 'Failed to mark read');
      }
      return notificationIds;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/**
 * Async Thunk to clear/delete all notifications
 */
export const clearAllNotifications = createAsyncThunk(
  'notifications/clearAllNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!json.success) {
        return rejectWithValue(json.error || 'Failed to clear notifications');
      }
      return true;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  list: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.list.unshift(action.payload);
      state.unreadCount += 1;
    },
    markAllLocalAsRead: (state) => {
      state.list.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
    },
    markSingleLocalAsRead: (state, action) => {
      const item = state.list.find((n) => n.id === action.payload);
      if (item && !item.read) {
        item.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    clearAllLocal: (state) => {
      state.list = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || [];
        state.unreadCount = action.payload.unreadCount || 0;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error fetching notifications';
      })
      .addCase(markNotificationsRead.fulfilled, (state, action) => {
        const ids = action.payload;
        if (!ids || ids.length === 0) {
          state.list.forEach((n) => {
            n.read = true;
          });
          state.unreadCount = 0;
        } else {
          ids.forEach((id) => {
            const item = state.list.find((n) => n.id === id);
            if (item && !item.read) {
              item.read = true;
              state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
          });
        }
      })
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.list = [];
        state.unreadCount = 0;
      });
  },
});

export const { addNotification, markAllLocalAsRead, markSingleLocalAsRead, clearAllLocal } = notificationsSlice.actions;

export default notificationsSlice.reducer;
