/**
 * Logger Utility
 * Production-safe logging with debug mode support
 * Replaces console.log/warn/error for proper error handling
 */

import {Platform} from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
  context?: string;
}

export interface LoggerConfig {
  /** Enable logging (auto-disabled in production) */
  enabled: boolean;
  /** Minimum log level to display */
  minLevel: LogLevel;
  /** Include timestamp in logs */
  showTimestamp: boolean;
  /** Include context/source in logs */
  showContext: boolean;
  /** Send errors to crash reporting service */
  reportErrors: boolean;
  /** Custom error reporter function */
  errorReporter?: (error: Error, context?: Record<string, any>) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
};

const RESET_COLOR = '\x1b[0m';

const LOG_ICONS: Record<LogLevel, string> = {
  debug: '[DEBUG]',
  info: '[INFO]',
  warn: '[WARN]',
  error: '[ERROR]',
};

// ============================================================================
// LOGGER CLASS
// ============================================================================

class Logger {
  private config: LoggerConfig = {
    enabled: __DEV__,
    minLevel: 'debug',
    showTimestamp: true,
    showContext: true,
    reportErrors: !__DEV__,
  };

  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  /**
   * Configure the logger
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = {...this.config, ...config};
  }

  /**
   * Set the minimum log level
   */
  setMinLevel(level: LogLevel): void {
    this.config.minLevel = level;
  }

  /**
   * Enable or disable logging
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Set custom error reporter
   */
  setErrorReporter(reporter: (error: Error, context?: Record<string, any>) => void): void {
    this.config.errorReporter = reporter;
  }

  /**
   * Check if a log level should be displayed
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  /**
   * Format log message
   */
  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const parts: string[] = [];

    if (this.config.showTimestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    parts.push(`${LOG_ICONS[level]}`);

    if (this.config.showContext && context) {
      parts.push(`[${context}]`);
    }

    parts.push(message);

    return parts.join(' ');
  }

  /**
   * Add entry to log buffer
   */
  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, data?: any, context?: string): void {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date(),
      context,
    };

    this.addToBuffer(entry);

    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);
    const color = Platform.OS === 'ios' || Platform.OS === 'android' 
      ? '' 
      : LOG_COLORS[level];
    const reset = color ? RESET_COLOR : '';

    switch (level) {
      case 'debug':
        console.log(`${color}${formattedMessage}${reset}`, data ?? '');
        break;
      case 'info':
        console.info(`${color}${formattedMessage}${reset}`, data ?? '');
        break;
      case 'warn':
        console.warn(`${color}${formattedMessage}${reset}`, data ?? '');
        break;
      case 'error':
        console.error(`${color}${formattedMessage}${reset}`, data ?? '');
        // Report to crash service in production
        if (this.config.reportErrors && this.config.errorReporter) {
          const error = data instanceof Error ? data : new Error(message);
          this.config.errorReporter(error, {context, data});
        }
        break;
    }
  }

  /**
   * Debug level log
   */
  debug(message: string, data?: any, context?: string): void {
    this.log('debug', message, data, context);
  }

  /**
   * Info level log
   */
  info(message: string, data?: any, context?: string): void {
    this.log('info', message, data, context);
  }

  /**
   * Warning level log
   */
  warn(message: string, data?: any, context?: string): void {
    this.log('warn', message, data, context);
  }

  /**
   * Error level log
   */
  error(message: string, error?: Error | any, context?: string): void {
    this.log('error', message, error, context);
  }

  /**
   * Create a scoped logger with preset context
   */
  scope(context: string): ScopedLogger {
    return new ScopedLogger(this, context);
  }

  /**
   * Get recent log entries
   */
  getRecentLogs(count: number = 20): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  /**
   * Clear log buffer
   */
  clearBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * Group logs
   */
  group(label: string): void {
    if (this.config.enabled && __DEV__) {
      console.group(label);
    }
  }

  /**
   * End log group
   */
  groupEnd(): void {
    if (this.config.enabled && __DEV__) {
      console.groupEnd();
    }
  }

  /**
   * Time a function execution
   */
  async time<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.debug(`${label} completed in ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`${label} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }
}

/**
 * Scoped logger with preset context
 */
class ScopedLogger {
  constructor(
    private logger: Logger,
    private context: string,
  ) {}

  debug(message: string, data?: any): void {
    this.logger.debug(message, data, this.context);
  }

  info(message: string, data?: any): void {
    this.logger.info(message, data, this.context);
  }

  warn(message: string, data?: any): void {
    this.logger.warn(message, data, this.context);
  }

  error(message: string, error?: Error | any): void {
    this.logger.error(message, error, this.context);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const logger = new Logger();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Production-safe console.log replacement
 */
export const log = {
  debug: (message: string, data?: any) => logger.debug(message, data),
  info: (message: string, data?: any) => logger.info(message, data),
  warn: (message: string, data?: any) => logger.warn(message, data),
  error: (message: string, error?: Error | any) => logger.error(message, error),
};

export default logger;
