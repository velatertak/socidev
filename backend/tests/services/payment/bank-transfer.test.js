import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { BankTransferService } from '../../../src/services/payment/bank-transfer.service.js';
import { Transaction } from '../../../src/models/Transaction.js';
import { ApiError } from '../../../src/utils/ApiError.js';
import { sendPaymentNotification } from '../../../src/utils/notifications.js';

// Mock dependencies
jest.mock('../../../src/models/Transaction.js');
jest.mock('../../../src/utils/notifications.js');

describe('BankTransferService', () => {
  let bankTransferService;

  beforeEach(() => {
    bankTransferService = new BankTransferService();
    jest.clearAllMocks();
  });

  describe('createTransfer', () => {
    const validBankDetails = {
      bankName: 'Test Bank',
      accountHolder: 'John Doe',
      iban: 'GB29NWBK60161331926819',
    };

    it('should create a transfer successfully', async () => {
      const mockTransfer = {
        id: 'transfer_123',
        details: {
          reference: 'BT123456789',
        },
      };

      Transaction.create.mockResolvedValue(mockTransfer);
      sendPaymentNotification.mockResolvedValue();

      const result = await bankTransferService.createTransfer('user_123', 1000, validBankDetails);

      expect(result).toEqual(mockTransfer);
      expect(Transaction.create).toHaveBeenCalledWith({
        userId: 'user_123',
        type: 'bank_transfer',
        amount: 1000,
        status: 'pending',
        details: expect.objectContaining({
          bankName: validBankDetails.bankName,
          accountHolder: validBankDetails.accountHolder,
          iban: validBankDetails.iban,
          reference: expect.any(String),
        }),
      });
    });

    it('should throw ApiError for invalid bank details', async () => {
      const invalidBankDetails = {
        bankName: 'Test Bank',
        // Missing required fields
      };

      await expect(bankTransferService.createTransfer('user_123', 1000, invalidBankDetails))
        .rejects
        .toThrow(ApiError);
    });

    it('should throw ApiError for invalid IBAN', async () => {
      const invalidIbanDetails = {
        ...validBankDetails,
        iban: 'invalid-iban',
      };

      await expect(bankTransferService.createTransfer('user_123', 1000, invalidIbanDetails))
        .rejects
        .toThrow(ApiError);
    });
  });

  describe('verifyTransfer', () => {
    it('should verify transfer successfully', async () => {
      const mockTransfer = {
        id: 'transfer_123',
        userId: 'user_123',
        details: {
          reference: 'BT123456789',
        },
        update: jest.fn(),
      };

      Transaction.findByPk.mockResolvedValue(mockTransfer);
      sendPaymentNotification.mockResolvedValue();

      const result = await bankTransferService.verifyTransfer('transfer_123');

      expect(result).toEqual({
        status: mockTransfer.status,
        verified: true,
      });
      expect(mockTransfer.update).toHaveBeenCalledWith({ status: 'completed' });
    });

    it('should throw ApiError when transfer not found', async () => {
      Transaction.findByPk.mockResolvedValue(null);

      await expect(bankTransferService.verifyTransfer('transfer_123'))
        .rejects
        .toThrow(ApiError);
    });
  });

  describe('processRefund', () => {
    const validBankDetails = {
      bankName: 'Test Bank',
      accountHolder: 'John Doe',
      iban: 'GB29NWBK60161331926819',
    };

    it('should process refund successfully', async () => {
      const mockRefund = {
        id: 'refund_123',
        details: {
          reference: 'BT123456789',
        },
      };

      Transaction.create.mockResolvedValue(mockRefund);
      sendPaymentNotification.mockResolvedValue();

      const result = await bankTransferService.processRefund('user_123', 1000, validBankDetails);

      expect(result).toEqual(mockRefund);
      expect(Transaction.create).toHaveBeenCalledWith({
        userId: 'user_123',
        type: 'bank_transfer_refund',
        amount: -1000,
        status: 'pending',
        details: expect.objectContaining({
          bankName: validBankDetails.bankName,
          accountHolder: validBankDetails.accountHolder,
          iban: validBankDetails.iban,
          reference: expect.any(String),
        }),
      });
    });

    it('should throw ApiError for invalid bank details', async () => {
      const invalidBankDetails = {
        bankName: 'Test Bank',
        // Missing required fields
      };

      await expect(bankTransferService.processRefund('user_123', 1000, invalidBankDetails))
        .rejects
        .toThrow(ApiError);
    });
  });

  describe('private methods', () => {
    describe('validateBankDetails', () => {
      it('should validate correct bank details', () => {
        const validDetails = {
          bankName: 'Test Bank',
          accountHolder: 'John Doe',
          iban: 'GB29NWBK60161331926819',
        };

        expect(() => bankTransferService.validateBankDetails(validDetails))
          .not
          .toThrow();
      });

      it('should throw ApiError for missing fields', () => {
        const invalidDetails = {
          bankName: 'Test Bank',
        };

        expect(() => bankTransferService.validateBankDetails(invalidDetails))
          .toThrow(ApiError);
      });
    });

    describe('isValidIBAN', () => {
      it('should return true for valid IBAN', () => {
        const validIBAN = 'GB29NWBK60161331926819';
        expect(bankTransferService.isValidIBAN(validIBAN)).toBe(true);
      });

      it('should return false for invalid IBAN', () => {
        const invalidIBAN = 'invalid-iban';
        expect(bankTransferService.isValidIBAN(invalidIBAN)).toBe(false);
      });
    });

    describe('generateReference', () => {
      it('should generate unique reference', () => {
        const reference1 = bankTransferService.generateReference();
        const reference2 = bankTransferService.generateReference();

        expect(reference1).toMatch(/^BT\d+[A-Z0-9]+$/);
        expect(reference2).toMatch(/^BT\d+[A-Z0-9]+$/);
        expect(reference1).not.toBe(reference2);
      });
    });
  });
});