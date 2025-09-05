import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import DashboardPage from '../pages/dashboard/DashboardPage';
import UserManagementPage from '../pages/users/UserManagementPage';
import TaskManagementPage from '../pages/tasks/TaskManagementPage';

// Mock toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
  Toaster: () => <div data-testid="toaster" />,
}));

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

describe('UI Enhancements', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DashboardPage', () => {
    it('renders dashboard with statistics cards', async () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      // Check if loading spinner is shown initially
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
      });

      // Check if statistics cards are rendered
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Total Orders')).toBeInTheDocument();
      expect(screen.getByText('Active Tasks')).toBeInTheDocument();
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    });

    it('handles refresh functionality', async () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
      });

      // Click refresh button
      const refreshButton = screen.getByText('Refresh');
      await user.click(refreshButton);

      // Check if loading state is shown
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
      
      // Wait for refresh to complete
      await waitFor(() => {
        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
      });
      
      // Check if success toast is shown
      expect(toast.success).toHaveBeenCalledWith('Dashboard refreshed successfully');
    });

    it('handles refresh error gracefully', async () => {
      // Mock console.error to avoid noise in test output
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
      });

      // Mock the refresh to fail
      jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2024-01-01').valueOf());
      
      // Click refresh button
      const refreshButton = screen.getByText('Refresh');
      await user.click(refreshButton);

      // Wait for error handling
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to refresh dashboard data');
      });
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('UserManagementPage', () => {
    it('renders user management table with filters', async () => {
      render(
        <TestWrapper>
          <UserManagementPage />
        </TestWrapper>
      );

      // Check if loading spinner is shown initially
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
      });

      // Check if table headers are rendered
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Balance')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();

      // Check if user data is rendered
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('johndoe')).toBeInTheDocument();
    });

    it('handles search functionality', async () => {
      render(
        <TestWrapper>
          <UserManagementPage />
        </TestWrapper>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
      });

      // Type in search box
      const searchInput = screen.getByPlaceholderText('Search users by name, email, or username...');
      await user.type(searchInput, 'john');

      // Check if search term is updated
      expect(searchInput).toHaveValue('john');
    });

    it('handles export functionality', async () => {
      render(
        <TestWrapper>
          <UserManagementPage />
        </TestWrapper>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
      });

      // Click export button
      const exportButton = screen.getByText('Export');
      await user.click(exportButton);

      // Check if success toast is shown
      expect(toast.success).toHaveBeenCalledWith('Data exported successfully');
    });

    it('handles bulk actions', async () => {
      render(
        <TestWrapper>
          <UserManagementPage />
        </TestWrapper>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
      });

      // Select a user
      const checkbox = screen.getByRole('checkbox', { name: '' });
      await user.click(checkbox);

      // Click activate button
      const activateButton = screen.getByText('Activate (1)');
      await user.click(activateButton);

      // Check if success toast is shown
      expect(toast.success).toHaveBeenCalledWith('1 users processed successfully');
    });
  });

  describe('TaskManagementPage', () => {
    it('renders task management table with filters', async () => {
      render(
        <TestWrapper>
          <TaskManagementPage />
        </TestWrapper>
      );

      // Check if loading spinner is shown initially
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
      });

      // Check if table headers are rendered
      expect(screen.getByText('Task Details')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Service')).toBeInTheDocument();
      expect(screen.getByText('Reward')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Submitted')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();

      // Check if task data is rendered
      expect(screen.getByText('Like YouTube Video')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('handles task approval modal', async () => {
      render(
        <TestWrapper>
          <TaskManagementPage />
        </TestWrapper>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
      });

      // Click approve button
      const approveButton = screen.getByTitle('Approve Task');
      await user.click(approveButton);

      // Check if modal is opened
      expect(screen.getByText('Approve Task')).toBeInTheDocument();
      
      // Click cancel button
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      // Check if modal is closed
      expect(screen.queryByText('Approve Task')).not.toBeInTheDocument();
    });

    it('handles task rejection with reason', async () => {
      render(
        <TestWrapper>
          <TaskManagementPage />
        </TestWrapper>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
      });

      // Click reject button
      const rejectButton = screen.getByTitle('Reject Task');
      await user.click(rejectButton);

      // Check if modal is opened
      expect(screen.getByText('Reject Task')).toBeInTheDocument();
      
      // Enter rejection reason
      const reasonInput = screen.getByLabelText('Rejection Reason *');
      await user.type(reasonInput, 'Invalid task submission');
      
      // Click reject button in modal
      const rejectModalButton = screen.getByText('Reject Task');
      await user.click(rejectModalButton);
      
      // Check if success toast is shown
      expect(toast.success).toHaveBeenCalledWith('Task rejected successfully');
    });

    it('handles bulk task actions', async () => {
      render(
        <TestWrapper>
          <TaskManagementPage />
        </TestWrapper>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
      });

      // Select a task
      const checkbox = screen.getByRole('checkbox', { name: '' });
      await user.click(checkbox);

      // Click approve button
      const approveButton = screen.getByText('Approve (1)');
      await user.click(approveButton);

      // Check if success toast is shown
      expect(toast.success).toHaveBeenCalledWith('1 tasks processed successfully');
    });

    it('handles export functionality', async () => {
      render(
        <TestWrapper>
          <TaskManagementPage />
        </TestWrapper>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
      });

      // Click export button
      const exportButton = screen.getByText('Export');
      await user.click(exportButton);

      // Check if success toast is shown
      expect(toast.success).toHaveBeenCalledWith('Data exported successfully');
    });
  });

  describe('Error Handling', () => {
    it('handles dashboard error state', async () => {
      // Mock console.error to avoid noise in test output
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
      });

      // Mock the refresh to fail
      jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2024-01-01').valueOf());
      
      // Click refresh button
      const refreshButton = screen.getByText('Refresh');
      await user.click(refreshButton);

      // Wait for error handling
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to refresh dashboard data');
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('handles user management error state', async () => {
      // Mock console.error to avoid noise in test output
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(
        <TestWrapper>
          <UserManagementPage />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
      });

      // Mock the refresh to fail
      jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2024-01-01').valueOf());
      
      // Click refresh button
      const refreshButton = screen.getByText('Refresh');
      await user.click(refreshButton);

      // Wait for error handling
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to refresh data');
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('handles task management error state', async () => {
      // Mock console.error to avoid noise in test output
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(
        <TestWrapper>
          <TaskManagementPage />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
      });

      // Mock the refresh to fail
      jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2024-01-01').valueOf());
      
      // Click refresh button
      const refreshButton = screen.getByText('Refresh');
      await user.click(refreshButton);

      // Wait for error handling
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to refresh data');
      });
      
      consoleErrorSpy.mockRestore();
    });
  });
});