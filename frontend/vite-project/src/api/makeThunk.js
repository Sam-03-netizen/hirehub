import { createAsyncThunk } from '@reduxjs/toolkit';

// Wraps an async function in a thunk that rejects with a readable error message.
export const makeThunk = (type, fn) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      return await fn(arg);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  });
