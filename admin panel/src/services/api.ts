import {
  User,
  Order,
  Transaction,
  WithdrawalRequest,
  SocialAccount,
  Task,
  Device,
  DashboardStats,
  ChartData,
  LoginCredentials,
  FilterParams,
  PaginatedResponse,
  ApiResponse
} from '../types';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data store
let mockData = {
  users: [] as User[],
  orders: [] as Order[],
  transactions: [] as Transaction[],
  withdrawals: [] as WithdrawalRequest[],
  socialAccounts: [] as SocialAccount[],
  tasks: [] as Task[],
  devices: [] as Device[],
};

// Load mock data from localStorage or generate
const loadMockData = () => {
  const stored = localStorage.getItem('mockData');
  if (stored) {
    mockData = JSON.parse(stored);
  } else {
    // Generate initial mock data
    generateMockData();
  }
};

const saveMockData = () => {
  localStorage.setItem('mockData', JSON.stringify(mockData));
};

const generateMockData = () => {
  // Generate mock users
  mockData.users = Array.from({ length: 50 }, (_, i) => ({
    id: `user-${i + 1}`,
    email: `user${i + 1}@example.com`,
    firstName: `User${i + 1}`,
    lastName: `Last${i + 1}`,
    username: `user${i + 1}`,
    role: i === 0 ? 'admin' : i < 5 ? 'manager' : i < 15 ? 'moderator' : 'readonly',
    status: Math.random() > 0.1 ? 'active' : 'suspended',
    balance: Math.floor(Math.random() * 10000),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    permissions: [],
  }));

  // Add demo users
  mockData.users.unshift(
    {
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin',
      role: 'admin',
      status: 'active',
      balance: 50000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      permissions: [],
    },
    {
      id: 'manager-1',
      email: 'manager@example.com',
      firstName: 'Manager',
      lastName: 'User',
      username: 'manager',
      role: 'manager',
      status: 'active',
      balance: 25000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      permissions: [],
    }
  );

  // Generate mock orders with more realistic test data
  const testOrders: Order[] = [
    // Pending orders
    {
      id: 'order-1001',
      userId: 'user-1',
      userName: 'John Doe',
      userEmail: 'john.doe@example.com',
      platform: 'instagram',
      service: 'followers',
      targetUrl: 'https://instagram.com/johndoe',
      quantity: 1000,
      completed: 0,
      status: 'pending',
      amount: 50.00,
      progress: 0,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'order-1002',
      userId: 'user-2',
      userName: 'Jane Smith',
      userEmail: 'jane.smith@example.com',
      platform: 'youtube',
      service: 'views',
      targetUrl: 'https://youtube.com/watch?v=abc123',
      quantity: 5000,
      completed: 0,
      status: 'pending',
      amount: 75.00,
      progress: 0,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'order-1003',
      userId: 'user-3',
      userName: 'Michael Brown',
      userEmail: 'michael.brown@example.com',
      platform: 'twitter',
      service: 'retweets',
      targetUrl: 'https://twitter.com/michaelbrown/status/789',
      quantity: 2500,
      completed: 0,
      status: 'pending',
      amount: 65.00,
      progress: 0,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'order-1004',
      userId: 'user-4',
      userName: 'Sarah Johnson',
      userEmail: 'sarah.johnson@example.com',
      platform: 'tiktok',
      service: 'likes',
      targetUrl: 'https://tiktok.com/@sarahjohnson/video/123',
      quantity: 10000,
      completed: 0,
      status: 'pending',
      amount: 120.00,
      progress: 0,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    // Processing orders
    {
      id: 'order-1005',
      userId: 'user-5',
      userName: 'Bob Johnson',
      userEmail: 'bob.johnson@example.com',
      platform: 'instagram',
      service: 'likes',
      targetUrl: 'https://instagram.com/bobjohnson/post123',
      quantity: 2000,
      completed: 800,
      status: 'processing',
      amount: 40.00,
      progress: 40,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    },
    {
      id: 'order-1006',
      userId: 'user-6',
      userName: 'Alice Brown',
      userEmail: 'alice.brown@example.com',
      platform: 'twitter',
      service: 'retweets',
      targetUrl: 'https://twitter.com/alicebrown/status/456',
      quantity: 1500,
      completed: 1200,
      status: 'processing',
      amount: 60.00,
      progress: 80,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    },
    {
      id: 'order-1007',
      userId: 'user-7',
      userName: 'David Wilson',
      userEmail: 'david.wilson@example.com',
      platform: 'youtube',
      service: 'views',
      targetUrl: 'https://youtube.com/watch?v=def456',
      quantity: 50000,
      completed: 35000,
      status: 'processing',
      amount: 250.00,
      progress: 70,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
      id: 'order-1008',
      userId: 'user-8',
      userName: 'Emma Davis',
      userEmail: 'emma.davis@example.com',
      platform: 'tiktok',
      service: 'shares',
      targetUrl: 'https://tiktok.com/@emmadavis/video/456',
      quantity: 15000,
      completed: 9000,
      status: 'processing',
      amount: 180.00,
      progress: 60,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    },
    // Completed orders
    {
      id: 'order-1009',
      userId: 'user-9',
      userName: 'Charlie Wilson',
      userEmail: 'charlie.wilson@example.com',
      platform: 'youtube',
      service: 'subscribers',
      targetUrl: 'https://youtube.com/channel/charliewilson',
      quantity: 500,
      completed: 500,
      status: 'completed',
      amount: 100.00,
      progress: 100,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    },
    {
      id: 'order-1010',
      userId: 'user-10',
      userName: 'Diana Miller',
      userEmail: 'diana.miller@example.com',
      platform: 'instagram',
      service: 'comments',
      targetUrl: 'https://instagram.com/dianamiller/post456',
      quantity: 100,
      completed: 100,
      status: 'completed',
      amount: 30.00,
      progress: 100,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
    {
      id: 'order-1011',
      userId: 'user-11',
      userName: 'Frank Garcia',
      userEmail: 'frank.garcia@example.com',
      platform: 'twitter',
      service: 'followers',
      targetUrl: 'https://twitter.com/frankgarcia',
      quantity: 5000,
      completed: 5000,
      status: 'completed',
      amount: 150.00,
      progress: 100,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
      id: 'order-1012',
      userId: 'user-12',
      userName: 'Grace Lee',
      userEmail: 'grace.lee@example.com',
      platform: 'tiktok',
      service: 'followers',
      targetUrl: 'https://tiktok.com/@gracelee',
      quantity: 25000,
      completed: 25000,
      status: 'completed',
      amount: 300.00,
      progress: 100,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    // Failed orders
    {
      id: 'order-1013',
      userId: 'user-13',
      userName: 'Ethan Davis',
      userEmail: 'ethan.davis@example.com',
      platform: 'tiktok',
      service: 'shares',
      targetUrl: 'https://tiktok.com/@ethandavis/video/789',
      quantity: 3000,
      completed: 500,
      status: 'failed',
      amount: 90.00,
      progress: 17,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
      id: 'order-1014',
      userId: 'user-14',
      userName: 'Hannah Martinez',
      userEmail: 'hannah.martinez@example.com',
      platform: 'instagram',
      service: 'likes',
      targetUrl: 'https://instagram.com/hannahmartinez/post789',
      quantity: 10000,
      completed: 2000,
      status: 'failed',
      amount: 200.00,
      progress: 20,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    // Cancelled orders
    {
      id: 'order-1015',
      userId: 'user-15',
      userName: 'Fiona Garcia',
      userEmail: 'fiona.garcia@example.com',
      platform: 'youtube',
      service: 'likes',
      targetUrl: 'https://youtube.com/watch?v=def456',
      quantity: 10000,
      completed: 0,
      status: 'cancelled',
      amount: 200.00,
      progress: 0,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
      id: 'order-1016',
      userId: 'user-16',
      userName: 'Ian Thompson',
      userEmail: 'ian.thompson@example.com',
      platform: 'twitter',
      service: 'retweets',
      targetUrl: 'https://twitter.com/ianthompson/status/789',
      quantity: 5000,
      completed: 0,
      status: 'cancelled',
      amount: 120.00,
      progress: 0,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    },
    // Refunded orders
    {
      id: 'order-1017',
      userId: 'user-17',
      userName: 'George Martinez',
      userEmail: 'george.martinez@example.com',
      platform: 'instagram',
      service: 'followers',
      targetUrl: 'https://instagram.com/georgemartinez',
      quantity: 5000,
      completed: 2500,
      status: 'refunded',
      amount: 150.00,
      progress: 50,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
    {
      id: 'order-1018',
      userId: 'user-18',
      userName: 'Jessica Wilson',
      userEmail: 'jessica.wilson@example.com',
      platform: 'tiktok',
      service: 'views',
      targetUrl: 'https://tiktok.com/@jessicawilson/video/123',
      quantity: 100000,
      completed: 50000,
      status: 'refunded',
      amount: 500.00,
      progress: 50,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    }
  ];

  // Generate additional random orders
  const randomOrders: Order[] = Array.from({ length: 182 }, (_, i) => ({
    id: `order-${i + 1}`,
    userId: mockData.users[Math.floor(Math.random() * mockData.users.length)].id,
    userName: mockData.users.find(u => u.id === mockData.users[Math.floor(Math.random() * mockData.users.length)].id)?.firstName + ' ' + mockData.users.find(u => u.id === mockData.users[Math.floor(Math.random() * mockData.users.length)].id)?.lastName || `User ${i + 1}`,
    userEmail: `user${i + 1}@example.com`,
    platform: ['instagram', 'twitter', 'tiktok', 'youtube'][Math.floor(Math.random() * 4)] as any,
    service: ['followers', 'likes', 'views', 'comments', 'shares', 'retweets', 'subscribers'][Math.floor(Math.random() * 7)],
    targetUrl: `https://example.com/user${i + 1}`,
    quantity: Math.floor(Math.random() * 10000) + 100,
    completed: 0,
    status: 'pending',
    amount: Math.floor(Math.random() * 1000) + 10,
    progress: 0,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  // Add some completed orders
  const completedOrders: Order[] = Array.from({ length: 20 }, (_, i) => ({
    id: `order-completed-${i + 1}`,
    userId: mockData.users[Math.floor(Math.random() * mockData.users.length)].id,
    userName: mockData.users.find(u => u.id === mockData.users[Math.floor(Math.random() * mockData.users.length)].id)?.firstName + ' ' + mockData.users.find(u => u.id === mockData.users[Math.floor(Math.random() * mockData.users.length)].id)?.lastName || `User ${i + 200}`,
    userEmail: `user${i + 200}@example.com`,
    platform: ['instagram', 'twitter', 'tiktok', 'youtube'][Math.floor(Math.random() * 4)] as any,
    service: ['followers', 'likes', 'views', 'comments', 'shares', 'retweets', 'subscribers'][Math.floor(Math.random() * 7)],
    targetUrl: `https://example.com/user${i + 200}`,
    quantity: Math.floor(Math.random() * 10000) + 100,
    completed: Math.floor(Math.random() * 10000) + 100,
    status: 'completed',
    amount: Math.floor(Math.random() * 1000) + 10,
    progress: 100,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  // Add some processing orders
  const processingOrders: Order[] = Array.from({ length: 15 }, (_, i) => ({
    id: `order-processing-${i + 1}`,
    userId: mockData.users[Math.floor(Math.random() * mockData.users.length)].id,
    userName: mockData.users.find(u => u.id === mockData.users[Math.floor(Math.random() * mockData.users.length)].id)?.firstName + ' ' + mockData.users.find(u => u.id === mockData.users[Math.floor(Math.random() * mockData.users.length)].id)?.lastName || `User ${i + 220}`,
    userEmail: `user${i + 220}@example.com`,
    platform: ['instagram', 'twitter', 'tiktok', 'youtube'][Math.floor(Math.random() * 4)] as any,
    service: ['followers', 'likes', 'views', 'comments', 'shares', 'retweets', 'subscribers'][Math.floor(Math.random() * 7)],
    targetUrl: `https://example.com/user${i + 220}`,
    quantity: Math.floor(Math.random() * 10000) + 100,
    completed: Math.floor(Math.random() * 5000),
    status: 'processing',
    amount: Math.floor(Math.random() * 1000) + 10,
    progress: Math.floor(Math.random() * 100),
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  // Add some failed orders
  const failedOrders: Order[] = Array.from({ length: 5 }, (_, i) => ({
    id: `order-failed-${i + 1}`,
    userId: mockData.users[Math.floor(Math.random() * mockData.users.length)].id,
    userName: mockData.users.find(u => u.id === mockData.users[Math.floor(Math.random() * mockData.users.length)].id)?.firstName + ' ' + mockData.users.find(u => u.id === mockData.users[Math.floor(Math.random() * mockData.users.length)].id)?.lastName || `User ${i + 235}`,
    userEmail: `user${i + 235}@example.com`,
    platform: ['instagram', 'twitter', 'tiktok', 'youtube'][Math.floor(Math.random() * 4)] as any,
    service: ['followers', 'likes', 'views', 'comments', 'shares', 'retweets', 'subscribers'][Math.floor(Math.random() * 7)],
    targetUrl: `https://example.com/user${i + 235}`,
    quantity: Math.floor(Math.random() * 10000) + 100,
    completed: Math.floor(Math.random() * 1000),
    status: 'failed',
    amount: Math.floor(Math.random() * 1000) + 10,
    progress: Math.floor(Math.random() * 30),
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  // Add some cancelled orders
  const cancelledOrders: Order[] = Array.from({ length: 3 }, (_, i) => ({
    id: `order-cancelled-${i + 1}`,
    userId: mockData.users[Math.floor(Math.random() * mockData.users.length)].id,
    userName: mockData.users.find(u => u.id === mockData.users[Math.floor(Math.random() * mockData.users.length)].id)?.firstName + ' ' + mockData.users.find(u => u.id === mockData.users[Math.floor(Math.random() * mockData.users.length)].id)?.lastName || `User ${i + 240}`,
    userEmail: `user${i + 240}@example.com`,
    platform: ['instagram', 'twitter', 'tiktok', 'youtube'][Math.floor(Math.random() * 4)] as any,
    service: ['followers', 'likes', 'views', 'comments', 'shares', 'retweets', 'subscribers'][Math.floor(Math.random() * 7)],
    targetUrl: `https://example.com/user${i + 240}`,
    quantity: Math.floor(Math.random() * 10000) + 100,
    completed: 0,
    status: 'cancelled',
    amount: Math.floor(Math.random() * 1000) + 10,
    progress: 0,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  // Add some refunded orders
  const refundedOrders: Order[] = Array.from({ length: 5 }, (_, i) => ({
    id: `order-refunded-${i + 1}`,
    userId: mockData.users[Math.floor(Math.random() * mockData.users.length)].id,
    userName: mockData.users.find(u => u.id === mockData.users[Math.floor(Math.random() * mockData.users.length)].id)?.firstName + ' ' + mockData.users.find(u => u.id === mockData.users[Math.floor(Math.random() * mockData.users.length)].id)?.lastName || `User ${i + 243}`,
    userEmail: `user${i + 243}@example.com`,
    platform: ['instagram', 'twitter', 'tiktok', 'youtube'][Math.floor(Math.random() * 4)] as any,
    service: ['followers', 'likes', 'views', 'comments', 'shares', 'retweets', 'subscribers'][Math.floor(Math.random() * 7)],
    targetUrl: `https://example.com/user${i + 243}`,
    quantity: Math.floor(Math.random() * 10000) + 100,
    completed: Math.floor(Math.random() * 5000),
    status: 'refunded',
    amount: Math.floor(Math.random() * 1000) + 10,
    progress: Math.floor(Math.random() * 100),
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  // Combine all orders
  mockData.orders = [...testOrders, ...randomOrders, ...completedOrders, ...processingOrders, ...failedOrders, ...cancelledOrders, ...refundedOrders];

  saveMockData();
};

// Initialize mock data
loadMockData();

// Auth API
export const authAPI = {
  async login(credentials: LoginCredentials) {
    await delay(1000);

    const demoUsers = {
      'admin@example.com': { password: 'DemoAdmin123!', role: 'admin' },
      'manager@example.com': { password: 'DemoManager123!', role: 'manager' },
      'moderator@example.com': { password: 'DemoModerator123!', role: 'moderator' },
      'readonly@example.com': { password: 'DemoReadonly123!', role: 'readonly' },
    };

    const demoUser = demoUsers[credentials.email as keyof typeof demoUsers];

    if (!demoUser || demoUser.password !== credentials.password) {
      throw new Error('Invalid credentials');
    }

    const user = mockData.users.find(u => u.email === credentials.email) || {
      id: 'demo-user',
      email: credentials.email,
      firstName: demoUser.role.charAt(0).toUpperCase() + demoUser.role.slice(1),
      lastName: 'User',
      username: demoUser.role,
      role: demoUser.role as any,
      status: 'active' as any,
      balance: 10000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      permissions: [],
    };

    return {
      user,
      token: `mock-jwt-token-${Date.now()}`,
    };
  },

  async validateToken() {
    await delay(500);
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token');

    return {
      user: mockData.users[0] || {
        id: 'demo-user',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        role: 'admin' as any,
        status: 'active' as any,
        balance: 10000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: [],
      },
    };
  },

  async logout() {
    await delay(300);
    return { success: true };
  },
};

// Dashboard API
export const dashboardAPI = {
  async getStats(timeRange: string): Promise<DashboardStats> {
    await delay(800);

    return {
      revenue: {
        total: 125000,
        change: 12.5,
        period: timeRange,
      },
      users: {
        total: mockData.users.length,
        active: mockData.users.filter(u => u.status === 'active').length,
        change: 8.2,
      },
      devices: {
        total: 150,
        online: 120,
        change: -2.1,
      },
      tasks: {
        total: 1250,
        completed: 980,
        change: 15.3,
      },
      withdrawals: {
        pending: 25,
        amount: 45000,
        change: -5.2,
      },
    };
  },

  async getChartData(timeRange: string): Promise<ChartData[]> {
    await delay(600);

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));

      return {
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 5000) + 1000,
        users: Math.floor(Math.random() * 50) + 10,
        orders: Math.floor(Math.random() * 100) + 20,
        tasks: Math.floor(Math.random() * 200) + 50,
      };
    });
  },
};

// Users API
export const usersAPI = {
  async getUsers(params: FilterParams): Promise<PaginatedResponse<User>> {
    await delay(600);

    let filteredUsers = [...mockData.users];

    if (params.search) {
      const search = params.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.firstName.toLowerCase().includes(search) ||
        user.lastName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.username.toLowerCase().includes(search)
      );
    }

    if (params.role) {
      filteredUsers = filteredUsers.filter(user => user.role === params.role);
    }

    if (params.status) {
      filteredUsers = filteredUsers.filter(user => user.status === params.status);
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      data: filteredUsers.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
      },
    };
  },

  async getUserById(id: string): Promise<User> {
    await delay(400);
    const user = mockData.users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    await delay(500);
    const userIndex = mockData.users.findIndex(u => u.id === id);
    if (userIndex === -1) throw new Error('User not found');

    mockData.users[userIndex] = { ...mockData.users[userIndex], ...updates, updatedAt: new Date().toISOString() };
    saveMockData();
    return mockData.users[userIndex];
  },

  async getUserTransactions(userId: string, params: FilterParams): Promise<PaginatedResponse<Transaction>> {
    await delay(500);

    // Generate mock transactions for user
    const transactions: Transaction[] = Array.from({ length: 20 }, (_, i) => ({
      id: `txn-${userId}-${i + 1}`,
      userId,
      userName: 'User Name',
      type: ['deposit', 'withdrawal', 'order', 'refund'][Math.floor(Math.random() * 4)] as any,
      amount: Math.floor(Math.random() * 1000) + 10,
      status: ['pending', 'completed', 'failed'][Math.floor(Math.random() * 3)] as any,
      description: `Transaction ${i + 1}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;

    return {
      data: transactions.slice(startIndex, startIndex + limit),
      pagination: {
        page,
        limit,
        total: transactions.length,
        totalPages: Math.ceil(transactions.length / limit),
      },
    };
  },
};

// Orders API
export const ordersAPI = {
  async getOrders(params: FilterParams): Promise<PaginatedResponse<Order>> {
    await delay(700);

    let filteredOrders = [...mockData.orders];

    if (params.search) {
      const search = params.search.toLowerCase();
      filteredOrders = filteredOrders.filter(order =>
        order.id.toLowerCase().includes(search) ||
        order.userName.toLowerCase().includes(search)
      );
    }

    if (params.status) {
      filteredOrders = filteredOrders.filter(order => order.status === params.status);
    }

    if (params.platform) {
      filteredOrders = filteredOrders.filter(order => order.platform === params.platform);
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;

    return {
      data: filteredOrders.slice(startIndex, startIndex + limit),
      pagination: {
        page,
        limit,
        total: filteredOrders.length,
        totalPages: Math.ceil(filteredOrders.length / limit),
      },
    };
  },

  async getOrderById(id: string): Promise<Order> {
    await delay(400);
    const order = mockData.orders.find(o => o.id === id);
    if (!order) throw new Error('Order not found');
    return order;
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    await delay(500);
    const orderIndex = mockData.orders.findIndex(o => o.id === id);
    if (orderIndex === -1) throw new Error('Order not found');

    mockData.orders[orderIndex].status = status as any;
    mockData.orders[orderIndex].updatedAt = new Date().toISOString();
    saveMockData();
    return mockData.orders[orderIndex];
  },

  async refundOrder(id: string): Promise<Order> {
    await delay(600);
    const orderIndex = mockData.orders.findIndex(o => o.id === id);
    if (orderIndex === -1) throw new Error('Order not found');

    mockData.orders[orderIndex].status = 'refunded';
    mockData.orders[orderIndex].updatedAt = new Date().toISOString();
    saveMockData();
    return mockData.orders[orderIndex];
  },
};

// Export mock data management
export const mockDataAPI = {
  resetData: () => {
    localStorage.removeItem('mockData');
    generateMockData();
  },

  exportData: () => {
    return JSON.stringify(mockData, null, 2);
  },

  importData: (data: string) => {
    try {
      mockData = JSON.parse(data);
      saveMockData();
      return true;
    } catch {
      return false;
    }
  },

  getMockData: () => {
    return mockData;
  }
};

// Withdrawals API
export const withdrawalsAPI = {
  async getWithdrawals(params: FilterParams): Promise<PaginatedResponse<WithdrawalRequest>> {
    await delay(700);

    let filteredWithdrawals = [...mockData.withdrawals];

    if (params.search) {
      const search = params.search.toLowerCase();
      filteredWithdrawals = filteredWithdrawals.filter(withdrawal =>
        withdrawal.id.toLowerCase().includes(search) ||
        withdrawal.userName.toLowerCase().includes(search)
      );
    }

    if (params.status) {
      filteredWithdrawals = filteredWithdrawals.filter(withdrawal => withdrawal.status === params.status);
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;

    return {
      data: filteredWithdrawals.slice(startIndex, startIndex + limit),
      pagination: {
        page,
        limit,
        total: filteredWithdrawals.length,
        totalPages: Math.ceil(filteredWithdrawals.length / limit),
      },
    };
  },

  async getWithdrawalById(id: string): Promise<WithdrawalRequest> {
    await delay(400);
    const withdrawal = mockData.withdrawals.find(w => w.id === id);
    if (!withdrawal) throw new Error('Withdrawal not found');
    return withdrawal;
  },

  async updateWithdrawalStatus(id: string, status: string, processedBy?: string): Promise<WithdrawalRequest> {
    await delay(500);
    const withdrawalIndex = mockData.withdrawals.findIndex(w => w.id === id);
    if (withdrawalIndex === -1) throw new Error('Withdrawal not found');

    mockData.withdrawals[withdrawalIndex].status = status as any;
    mockData.withdrawals[withdrawalIndex].processedAt = new Date().toISOString();
    if (processedBy) {
      mockData.withdrawals[withdrawalIndex].processedBy = processedBy;
    }
    saveMockData();
    return mockData.withdrawals[withdrawalIndex];
  },

  async getUserWithdrawals(userId: string, params: FilterParams): Promise<PaginatedResponse<WithdrawalRequest>> {
    await delay(500);

    let filteredWithdrawals = mockData.withdrawals.filter(w => w.userId === userId);

    if (params.search) {
      const search = params.search.toLowerCase();
      filteredWithdrawals = filteredWithdrawals.filter(withdrawal =>
        withdrawal.id.toLowerCase().includes(search)
      );
    }

    if (params.status) {
      filteredWithdrawals = filteredWithdrawals.filter(withdrawal => withdrawal.status === params.status);
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;

    return {
      data: filteredWithdrawals.slice(startIndex, startIndex + limit),
      pagination: {
        page,
        limit,
        total: filteredWithdrawals.length,
        totalPages: Math.ceil(filteredWithdrawals.length / limit),
      },
    };
  },
};
