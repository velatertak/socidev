import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import HomePage from "./pages/home/index";
import DashboardPage from "./pages/dashboard/index";
import { LoginPage } from "./pages/login/index";
import { RegisterPage } from "./pages/register/index";
import { NewOrderPage } from "./pages/new-order/index";
import { MyOrdersPage } from "./pages/my-orders/index";
import { AddBalancePage } from "./pages/add-balance/index";
import { WithdrawBalancePage } from "./pages/withdraw-balance/index";
import { AddDevicesPage } from "./pages/add-devices/index";
import { MyDevicesPage } from "./pages/my-devices/index";
import { InstagramAccountsPage } from "./pages/my-accounts/instagram/accounts/index";
import { InstagramAccountDetailsPage } from "./pages/my-accounts/instagram/accounts/[id]";
import { YoutubeAccountsPage } from "./pages/my-accounts/youtube";
import { YoutubeAccountDetailsPage } from "./pages/my-accounts/youtube/[id]";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { UserModeProvider } from "./context/UserModeContext";
import { BalanceProvider } from "./context/BalanceContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { TasksPage } from "./pages/tasks";
import TestPage from "./pages/test";

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path='/'
        element={
          isAuthenticated ? (
            <Navigate to='/dashboard' replace />
          ) : (
            <Layout>
              <HomePage />
            </Layout>
          )
        }
      />
      <Route
        path='/login'
        element={
          isAuthenticated ? <Navigate to='/dashboard' replace /> : <LoginPage />
        }
      />
      <Route
        path='/register'
        element={
          isAuthenticated ? (
            <Navigate to='/dashboard' replace />
          ) : (
            <RegisterPage />
          )
        }
      />
      <Route
        path='/test'
        element={
          <Layout>
            <TestPage />
          </Layout>
        }
      />

      {/* Protected routes */}
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Task Giver Only Routes */}
      <Route
        path='/new-order'
        element={
          <ProtectedRoute requiredMode='taskGiver'>
            <Layout>
              <NewOrderPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/my-orders'
        element={
          <ProtectedRoute requiredMode='taskGiver'>
            <Layout>
              <MyOrdersPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/add-balance'
        element={
          <ProtectedRoute requiredMode='taskGiver'>
            <Layout>
              <AddBalancePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Common Protected Routes */}
      <Route
        path='/withdraw-balance'
        element={
          <ProtectedRoute>
            <Layout>
              <WithdrawBalancePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/add-devices'
        element={
          <ProtectedRoute>
            <Layout>
              <AddDevicesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/my-devices'
        element={
          <ProtectedRoute>
            <Layout>
              <MyDevicesPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Instagram Routes */}
      <Route
        path='/my-accounts/instagram'
        element={
          <ProtectedRoute>
            <Layout>
              <InstagramAccountsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/my-accounts/instagram/:id'
        element={
          <ProtectedRoute>
            <Layout>
              <InstagramAccountDetailsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* YouTube Routes */}
      <Route
        path='/my-accounts/youtube'
        element={
          <ProtectedRoute>
            <Layout>
              <YoutubeAccountsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path='/my-accounts/youtube/:id'
        element={
          <ProtectedRoute>
            <Layout>
              <YoutubeAccountDetailsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Task Routes */}
      <Route
        path='/tasks'
        element={
          <ProtectedRoute>
            <Layout>
              <TasksPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route
        path='*'
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <UserModeProvider>
          <BalanceProvider>
            <AppRoutes />
          </BalanceProvider>
        </UserModeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
