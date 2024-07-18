/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "App";

// Material Dashboard 2 React Context Provider
import { MaterialUIControllerProvider } from "context";
import { Provider } from "react-redux";
import store from "app/store";
import PrivateRoutes from "components/PrivateRoutes";
import InboxScreen from "screens/InboxScreen";
import LoginScreen from "screens/AuthScreens/LoginScreen";
import RegisterScreen from "screens/AuthScreens/RegisterScreen";
import NotFoundPage from "components/NotFoundPage";
import ProfileScreen from "screens/ProfileScreen";
import TodayScreen from "screens/TodayScreen";
import CategoryScreen from "screens/CategoryScreen";

const container = document.getElementById("app");
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <MaterialUIControllerProvider>
        <Routes>
          <Route path="/" element={<App />}>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />

            {/* authenticated allowed routes */}
            <Route element={<PrivateRoutes />}>
              <Route index={true} element={<Navigate to="/today" />} />
              <Route path="today" element={<TodayScreen />} />
              <Route path="inbox" element={<InboxScreen />} />
              <Route path="categories" element={<CategoryScreen />} />
              <Route path="profile" element={<ProfileScreen />} />

            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MaterialUIControllerProvider>
    </BrowserRouter>
  </Provider>
);
