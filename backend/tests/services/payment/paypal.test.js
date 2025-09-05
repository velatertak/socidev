import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { PayPalService } from '../../../src/services/payment/paypal.service.js';
import { ApiError } from '../../../src/utils/ApiError.js';

// Mock PayPal SDK
jest.mock('@paypal/checkout-server-sdk', () => ({
  core: {
    SandboxEnvironment: jest.fn(),
    LiveEnvironment: jest.fn(),
    PayPalHttpClient: jest.fn().mockImplementation(() => ({
      execute: jest.fn(),
    })),
  },
  orders: {
    OrdersCreateRequest: jest.fn().mockImplementation(() => ({
      prefer: jest.fn(),
      requestBody: jest.fn(),
    })),
    OrdersCaptureRequest: jest.fn(),
  },
  payments: {
    CapturesRefundRequest: jest.fn().mockImplementation(() => ({
      requestBody: jest.fn(),
    })),
  },
}));

describe('PayPalService', () => {
  let paypalService;
  let mockClient;

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
    paypalService = new PayPalService();
    mockClient = paypalService.client;
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      const mockOrder = {
        result: {
          id: 'order_123',
          status: 'CREATED',
          links: [],
        },
      };

      mockClient.execute.mockResolvedValue(mockOrder);

      const result = await paypalService.createOrder(100, 'USD', { orderId: '123' });

      expect(result).toEqual({
        id: mockOrder.result.id,
        status: mockOrder.result.status,
        links: mockOrder.result.links,
      });
    });

    it('should throw ApiError when order creation fails', async () => {
      mockClient.execute.mockRejectedValue(new Error('PayPal error'));

      await expect(paypalService.createOrder(100, 'USD', {}))
        .rejects
        .toThrow(ApiError);
    });
  });

  describe('captureOrder', () => {
    it('should capture an order successfully', async () => {
      const mockCapture = {
        result: {
          id: 'capture_123',
          status: 'COMPLETED',
          purchase_units: [{
            payments: {
              captures: [{
                amount: { value: '100.00' },
              }],
            },
          }],
        },
      };

      mockClient.execute.mockResolvedValue(mockCapture);

      const result = await paypalService.captureOrder('order_123');

      expect(result).toEqual({
        id: mockCapture.result.id,
        status: mockCapture.result.status,
        amount: mockCapture.result.purchase_units[0].payments.captures[0].amount.value,
      });
    });

    it('should throw ApiError when capture fails', async () => {
      mockClient.execute.mockRejectedValue(new Error('Capture error'));

      await expect(paypalService.captureOrder('order_123'))
        .rejects
        .toThrow(ApiError);
    });
  });

  describe('createRefund', () => {
    it('should create a refund successfully', async () => {
      const mockRefund = {
        result: {
          id: 'refund_123',
          status: 'COMPLETED',
        },
      };

      mockClient.execute.mockResolvedValue(mockRefund);

      const result = await paypalService.createRefund('capture_123', 100);

      expect(result).toEqual({
        id: mockRefund.result.id,
        status: mockRefund.result.status,
      });
    });

    it('should throw ApiError when refund creation fails', async () => {
      mockClient.execute.mockRejectedValue(new Error('Refund error'));

      await expect(paypalService.createRefund('capture_123', 100))
        .rejects
        .toThrow(ApiError);
    });
  });

  describe('handleWebhook', () => {
    it('should handle PAYMENT.CAPTURE.COMPLETED webhook', async () => {
      const mockPayload = JSON.stringify({
        event_type: 'PAYMENT.CAPTURE.COMPLETED',
        resource: { id: 'capture_123' },
      });

      const result = await paypalService.handleWebhook(mockPayload);

      expect(result).toEqual({ received: true });
    });

    it('should throw ApiError for invalid webhook payload', async () => {
      const invalidPayload = 'invalid json';

      await expect(paypalService.handleWebhook(invalidPayload))
        .rejects
        .toThrow(ApiError);
    });
  });
});