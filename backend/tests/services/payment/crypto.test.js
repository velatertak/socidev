import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CryptoService } from '../../../src/services/payment/crypto.service.js';
import { ApiError } from '../../../src/utils/ApiError.js';

// Mock Web3
jest.mock('web3', () => {
  return jest.fn().mockImplementation(() => ({
    eth: {
      accounts: {
        create: jest.fn(),
        signTransaction: jest.fn(),
      },
      getBalance: jest.fn(),
      getTransactionCount: jest.fn(),
      getGasPrice: jest.fn(),
      sendSignedTransaction: jest.fn(),
      sendTransaction: jest.fn(),
      getTransactionReceipt: jest.fn(),
    },
    utils: {
      toWei: jest.fn(),
      fromWei: jest.fn(),
    },
  }));
});

describe('CryptoService', () => {
  let cryptoService;
  let mockWeb3;

  beforeEach(() => {
    process.env.WEB3_PROVIDER_URL = 'http://localhost:8545';
    process.env.MERCHANT_ETH_ADDRESS = '0x123';
    cryptoService = new CryptoService();
    mockWeb3 = cryptoService.web3;
  });

  describe('createPayment', () => {
    it('should create a payment address successfully', async () => {
      const mockAccount = {
        address: '0x456',
        privateKey: 'private_key',
      };

      mockWeb3.eth.accounts.create.mockReturnValue(mockAccount);
      mockWeb3.utils.toWei.mockReturnValue('1000000000000000000');

      const result = await cryptoService.createPayment(1, 'ETH');

      expect(result).toEqual({
        address: mockAccount.address,
        privateKey: mockAccount.privateKey,
        amount: '1000000000000000000',
        currency: 'ETH',
      });
    });

    it('should throw ApiError when account creation fails', async () => {
      mockWeb3.eth.accounts.create.mockImplementation(() => {
        throw new Error('Account creation failed');
      });

      await expect(cryptoService.createPayment(1, 'ETH'))
        .rejects
        .toThrow(ApiError);
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment successfully', async () => {
      mockWeb3.eth.getBalance.mockResolvedValue('2000000000000000000');
      mockWeb3.utils.toWei.mockReturnValue('1000000000000000000');
      mockWeb3.utils.fromWei.mockReturnValue('2');

      const result = await cryptoService.verifyPayment('0x456', 1, 'ETH');

      expect(result).toEqual({
        received: true,
        amount: '2',
        currency: 'ETH',
      });
    });

    it('should return false when payment amount is insufficient', async () => {
      mockWeb3.eth.getBalance.mockResolvedValue('500000000000000000');
      mockWeb3.utils.toWei.mockReturnValue('1000000000000000000');
      mockWeb3.utils.fromWei.mockReturnValue('0.5');

      const result = await cryptoService.verifyPayment('0x456', 1, 'ETH');

      expect(result.received).toBe(false);
    });
  });

  describe('transferFunds', () => {
    it('should transfer funds successfully', async () => {
      const mockReceipt = {
        transactionHash: 'tx_hash',
        status: true,
      };

      mockWeb3.eth.getTransactionCount.mockResolvedValue(1);
      mockWeb3.eth.getGasPrice.mockResolvedValue('20000000000');
      mockWeb3.eth.accounts.signTransaction.mockResolvedValue({
        rawTransaction: 'signed_tx',
      });
      mockWeb3.eth.sendSignedTransaction.mockResolvedValue(mockReceipt);

      const result = await cryptoService.transferFunds('0x456', 'private_key', '1000000000000000000');

      expect(result).toEqual({
        transactionHash: mockReceipt.transactionHash,
        status: mockReceipt.status,
      });
    });

    it('should throw ApiError when transfer fails', async () => {
      mockWeb3.eth.getTransactionCount.mockRejectedValue(new Error('Transfer failed'));

      await expect(cryptoService.transferFunds('0x456', 'private_key', '1000000000000000000'))
        .rejects
        .toThrow(ApiError);
    });
  });

  describe('processRefund', () => {
    it('should process refund successfully', async () => {
      const mockReceipt = {
        transactionHash: 'tx_hash',
        status: true,
      };

      mockWeb3.eth.getGasPrice.mockResolvedValue('20000000000');
      mockWeb3.eth.getTransactionCount.mockResolvedValue(1);
      mockWeb3.eth.sendTransaction.mockResolvedValue(mockReceipt);

      const result = await cryptoService.processRefund('0x456', 1, 'ETH');

      expect(result).toEqual({
        transactionHash: mockReceipt.transactionHash,
        status: mockReceipt.status,
      });
    });

    it('should throw ApiError when refund fails', async () => {
      mockWeb3.eth.getGasPrice.mockRejectedValue(new Error('Refund failed'));

      await expect(cryptoService.processRefund('0x456', 1, 'ETH'))
        .rejects
        .toThrow(ApiError);
    });
  });

  describe('getTransactionStatus', () => {
    it('should return confirmed status for successful transaction', async () => {
      const mockReceipt = {
        status: true,
        blockNumber: 12345,
        gasUsed: '21000',
      };

      mockWeb3.eth.getTransactionReceipt.mockResolvedValue(mockReceipt);

      const result = await cryptoService.getTransactionStatus('tx_hash');

      expect(result).toEqual({
        status: 'confirmed',
        blockNumber: mockReceipt.blockNumber,
        gasUsed: mockReceipt.gasUsed,
      });
    });

    it('should return pending status when receipt is null', async () => {
      mockWeb3.eth.getTransactionReceipt.mockResolvedValue(null);

      const result = await cryptoService.getTransactionStatus('tx_hash');

      expect(result.status).toBe('pending');
    });
  });
});