/**
 * Tests for logger utility
 */

import {logger, log} from '../../src/utils/logger';

describe('Logger', () => {
  let consoleSpy: {
    log: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
    info: jest.SpyInstance;
  };

  beforeEach(() => {
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
    };
    // Enable logger and set to debug level for tests
    logger.setEnabled(true);
    logger.setMinLevel('debug');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('in development mode', () => {
    beforeAll(() => {
      // @ts-ignore
      global.__DEV__ = true;
    });

    it('should log debug messages', () => {
      logger.debug('Debug message');
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      logger.info('Info message');
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it('should log warning messages', () => {
      logger.warn('Warning message');
      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      logger.error('Error message');
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('should log with additional data', () => {
      const extraData = {key: 'value'};
      logger.info('Message with data', extraData);
      expect(consoleSpy.info).toHaveBeenCalled();
    });
  });

  describe('log levels', () => {
    beforeAll(() => {
      // @ts-ignore
      global.__DEV__ = true;
    });

    it('should respect log level - warn', () => {
      logger.setMinLevel('warn');

      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');

      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('should respect log level - error', () => {
      logger.setMinLevel('error');

      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');

      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('should log nothing when disabled', () => {
      logger.setEnabled(false);

      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');

      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });
  });

  describe('scoped logger', () => {
    it('should create a scoped logger with context', () => {
      const authLogger = logger.scope('Auth');
      authLogger.info('Login attempt');
      expect(consoleSpy.info).toHaveBeenCalled();
    });
  });

  describe('log shorthand', () => {
    it('should provide convenience functions', () => {
      log.debug('Debug via shorthand');
      log.info('Info via shorthand');
      log.warn('Warn via shorthand');
      log.error('Error via shorthand');

      expect(consoleSpy.log).toHaveBeenCalled();
      expect(consoleSpy.info).toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });
});
