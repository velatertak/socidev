import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Mock the toast notifications
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
  Toaster: () => <div data-testid="toaster" />,
}));

// Create a simple version of the components for testing
const SimpleDashboardPage = () => {
  return (
    <div>
      <h1>Dashboard Overview</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <p>Total Users</p>
          <p>1247</p>
        </div>
        <div className="stat-card">
          <p>Total Orders</p>
          <p>856</p>
        </div>
      </div>
      <button>Refresh</button>
    </div>
  );
};

const SimpleUserManagementPage = () => {
  return (
    <div>
      <h1>User Management</h1>
      <input placeholder="Search users..." />
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>John Doe</td>
            <td>Admin</td>
            <td>Active</td>
          </tr>
        </tbody>
      </table>
      <button>Export</button>
    </div>
  );
};

const SimpleTaskManagementPage = () => {
  return (
    <div>
      <h1>Task Management</h1>
      <input placeholder="Search tasks..." />
      <table>
        <thead>
          <tr>
            <th>Task Details</th>
            <th>User</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Like YouTube Video</td>
            <td>John Doe</td>
            <td>Pending</td>
          </tr>
        </tbody>
      </table>
      <button>Export</button>
    </div>
  );
};

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Wrapper component for testing
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </QueryClientProvider>
);

describe('Simple Components', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SimpleDashboardPage', () => {
    it('renders dashboard with statistics', () => {
      render(
        <TestWrapper>
          <SimpleDashboardPage />
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Total Orders')).toBeInTheDocument();
      expect(screen.getByText('1247')).toBeInTheDocument();
      expect(screen.getByText('856')).toBeInTheDocument();
    });

    it('has refresh button', () => {
      render(
        <TestWrapper>
          <SimpleDashboardPage />
        </TestWrapper>
      );

      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });
  });

  describe('SimpleUserManagementPage', () => {
    it('renders user management table', () => {
      render(
        <TestWrapper>
          <SimpleUserManagementPage />
        </TestWrapper>
      );

      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('has export button', () => {
      render(
        <TestWrapper>
          <SimpleUserManagementPage />
        </TestWrapper>
      );

      expect(screen.getByText('Export')).toBeInTheDocument();
    });
  });

  describe('SimpleTaskManagementPage', () => {
    it('renders task management table', () => {
      render(
        <TestWrapper>
          <SimpleTaskManagementPage />
        </TestWrapper>
      );

      expect(screen.getByText('Task Management')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
      expect(screen.getByText('Task Details')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Like YouTube Video')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('has export button', () => {
      render(
        <TestWrapper>
          <SimpleTaskManagementPage />
        </TestWrapper>
      );

      expect(screen.getByText('Export')).toBeInTheDocument();
    });
  });
});