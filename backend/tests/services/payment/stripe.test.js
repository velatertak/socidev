import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { StripeService } from '../../../src/services/payment/stripe.service.js';
import { ApiError } from '../../../src/utils/ApiError.js';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
    refunds: {
      create: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  }));
});

describe('StripeService', () => {
  let stripeService;
  let mockStripe;

  beforeEach(() => {
    stripeService = new StripeService();
    mockStripe = stripeService.stripe;
  });

  describe('createPaymentIntent', () => {
    it('should create a payment intent successfully', async () => {
      const mockPaymentIntent = {
        id: 'pi_123',
        client_secret: 'secret_123',
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const result = await stripeService.createPaymentIntent(100, 'usd', {});

      expect(result).toEqual({
        id: mockPaymentIntent.id,
        clientSecret: mockPaymentIntent.client_secret,
      });
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 10000, // 100 * 100 cents
        currency: 'usd',
        metadata: {},
        automatic_payment_methods: { enabled: true },
      });
    });

    it('should throw ApiError when payment intent creation fails', async () => {
      mockStripe.paymentIntents.create.mockRejectedValue(new Error('Stripe error'));

      await expect(stripeService.createPaymentIntent(100, 'usd', {}))
        .rejects
        .toThrow(ApiError);
    });
  });

  describe('confirmPayment', () => {
    it('should confirm a successful payment', async () => {
      const mockPaymentIntent = {
        id: 'pi_123',
        status: 'succeeded',
        amount: 10000,
        currency: 'usd',
        payment_method_types: ['card'],
      };

      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);

      const result = await stripeService.confirmPayment('pi_123');

      expect(result).toEqual({
        status: 'completed',
        amount: 100,
        currency: 'usd',
        paymentMethod: 'card',
      });
    });

    it('should return status for non-succeeded payment', async () => {
      const mockPaymentIntent = {
        id: 'pi_123',
        status: 'requires_payment_method',
        last_payment_error: { message: 'Card declined' },
      };

      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);

      const result = await stripeService.confirmPayment('pi_123');

      expect(result).toEqual({
        status: 'requires_payment_method',
        error: 'Card declined',
      });
    });
  });

  describe('createRefund', () => {
    it('should create a refund successfully', async () => {
      const mockRefund = {
        id: 're_123',
        status: 'succeeded',
        amount: 10000,
      };

      mockStripe.refunds.create.mockResolvedValue(mockRefund);

      const result = await stripeService.createRefund('pi_123', 100);

      expect(result).toEqual({
        id: mockRefund.id,
        status: mockRefund.status,
        amount: 100,
      });
      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_123',
        amount: 10000,
      });
    });

    it('should throw ApiError when refund creation fails', async () => {
      mockStripe.refunds.create.mockRejectedValue(new Error('Refund error'));

      await expect(stripeService.createRefund('pi_123', 100))
        .rejects
        .toThrow(ApiError);
    });
  });

  describe('handleWebhook', () => {
    it('should handle payment_intent.succeeded webhook', async () => {
      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_123' } },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      const result = await stripeService.handleWebhook('payload', 'signature');

      expect(result).toEqual({ received: true });
    });

    it('should throw ApiError for invalid webhook signature', async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await expect(stripeService.handleWebhook('payload', 'signature'))
        .rejects
        .toThrow(ApiError);
    });
  });
});