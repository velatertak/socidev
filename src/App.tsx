import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Orders from './pages/Orders';
import Tasks from './pages/Tasks';
import Transactions from './pages/Transactions';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
// Newly added pages
import Balance from './pages/Balance';
import Withdrawals from './pages/Withdrawals';
import SocialAccounts from './pages/SocialAccounts';
import Devices from './pages/Devices';
import Analytics from './pages/Analytics';
import PlatformsServices from './pages/PlatformsServices';
import TaskSubmissions from './pages/TaskSubmissions';

function App() {
  return (
    <Provider store={store}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="orders" element={<Orders />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="settings" element={<Settings />} />
            {/* Newly added routes */}
            <Route path="balance" element={<Balance />} />
            <Route path="withdrawals" element={<Withdrawals />} />
            <Route path="social-accounts" element={<SocialAccounts />} />
            <Route path="devices" element={<Devices />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="platforms-services" element={<PlatformsServices />} />
            <Route path="task-submissions" element={<TaskSubmissions />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;