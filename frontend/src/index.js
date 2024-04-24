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
import Dashboard from "layouts/dashboard";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import NotFoundPage from "layouts/NotFoundPage";

const container = document.getElementById("app");
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <MaterialUIControllerProvider>
        <Routes>
          <Route path="/" element={<App />}>
            <Route path="/login" element={<SignIn />} />
            <Route path="/register" element={<SignUp />} />

            {/* authenticated allowed routes */}
            <Route element={<PrivateRoutes />}>
              <Route index={true} element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              {/* <Route path="profile" element={<ProfilePage />} /> */}

            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MaterialUIControllerProvider>
    </BrowserRouter>
  </Provider>
);
