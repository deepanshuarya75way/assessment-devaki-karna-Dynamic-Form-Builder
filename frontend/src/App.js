import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import GenerateFormPage from "./pages/GenerateFormPage";
import FillFormPage from "./pages/FillFormPage";
import FormResponsesPage from "./pages/FormResponsesPage";
import DashboardPage from "./pages/DashboardPage";
import RegisterPage from "./pages/RegisterPage";
import { useEffect } from "react";
import { setupAuthInterceptor } from "./utils/auth";

setupAuthInterceptor();

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/generate"
          element={
            <PrivateRoute>
              <GenerateFormPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/form/:id/responses"
          element={
            <PrivateRoute>
              <FormResponsesPage />
            </PrivateRoute>
          }
        />
        <Route path="/form/:id" element={<FillFormPage />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}