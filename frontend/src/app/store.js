import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "slices/apiSlice";
import authReducer from "slices/authSlice";
import { logout } from "slices/authSlice";

const unauthenticatedMiddleware = () => (next) => (action) => {
  if (action?.payload?.status && action.payload.status === 401) {
    // Dispatch logout action if a 401 error occurs
    store.dispatch(logout());
  }
  return next(action);
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleWare) => getDefaultMiddleWare().concat(apiSlice.middleware, unauthenticatedMiddleware),
  devTools: true 
});

export default store;
