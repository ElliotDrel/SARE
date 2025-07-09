import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Custom log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Custom colors for log levels
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(logColors);

// Common log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
    });
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaString}`;
  })
);

// Transport configurations
const transports: winston.transport[] = [];

// Console transport (always enabled in development)
if (process.env.NODE_ENV === 'development') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug',
    })
  );
}

// File transports for production
if (process.env.NODE_ENV === 'production') {
  // Error logs
  transports.push(
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      handleExceptions: true,
      handleRejections: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat,
    })
  );

  // Combined logs
  transports.push(
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat,
    })
  );

  // Console for production (minimal)
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      level: 'info',
    })
  );
}

// Create the logger instance
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels: logLevels,
  format: logFormat,
  transports,
  exitOnError: false,
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
});

// Helper interface for structured logging
export interface LogContext {
  userId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

// Enhanced logging functions with context
export const log = {
  error: (message: string, context?: LogContext, error?: Error) => {
    logger.error(message, {
      ...context,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : undefined,
    });
  },

  warn: (message: string, context?: LogContext) => {
    logger.warn(message, context);
  },

  info: (message: string, context?: LogContext) => {
    logger.info(message, context);
  },

  http: (message: string, context?: LogContext) => {
    logger.http(message, context);
  },

  debug: (message: string, context?: LogContext) => {
    logger.debug(message, context);
  },

  // Specific logging methods for common scenarios
  auth: {
    signup: (email: string, success: boolean, context?: LogContext) => {
      logger.info(`User signup ${success ? 'successful' : 'failed'}`, {
        email,
        success,
        ...context,
      });
    },

    login: (email: string, success: boolean, context?: LogContext) => {
      logger.info(`User login ${success ? 'successful' : 'failed'}`, {
        email,
        success,
        ...context,
      });
    },

    logout: (userId: string, context?: LogContext) => {
      logger.info('User logout', {
        userId,
        ...context,
      });
    },
  },

  database: {
    query: (operation: string, table: string, duration: number, context?: LogContext) => {
      logger.debug(`Database ${operation} on ${table}`, {
        operation,
        table,
        duration,
        ...context,
      });
    },

    error: (operation: string, table: string, error: Error, context?: LogContext) => {
      logger.error(`Database ${operation} error on ${table}`, {
        operation,
        table,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        ...context,
      });
    },
  },

  api: {
    request: (method: string, url: string, context?: LogContext) => {
      logger.http(`API Request: ${method} ${url}`, {
        method,
        url,
        ...context,
      });
    },

    response: (method: string, url: string, statusCode: number, duration: number, context?: LogContext) => {
      logger.http(`API Response: ${method} ${url} ${statusCode}`, {
        method,
        url,
        statusCode,
        duration,
        ...context,
      });
    },

    error: (method: string, url: string, error: Error, context?: LogContext) => {
      logger.error(`API Error: ${method} ${url}`, {
        method,
        url,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        ...context,
      });
    },
  },

  business: {
    storySubmission: (storytellerId: string, userId: string, success: boolean, context?: LogContext) => {
      logger.info(`Story submission ${success ? 'successful' : 'failed'}`, {
        storytellerId,
        userId,
        success,
        ...context,
      });
    },

    pdfGeneration: (userId: string, success: boolean, duration: number, context?: LogContext) => {
      logger.info(`PDF generation ${success ? 'successful' : 'failed'}`, {
        userId,
        success,
        duration,
        ...context,
      });
    },

    invitationSent: (email: string, userId: string, context?: LogContext) => {
      logger.info('Storyteller invitation sent', {
        email,
        userId,
        ...context,
      });
    },
  },

  security: {
    suspiciousActivity: (description: string, context?: LogContext) => {
      logger.warn(`Security: ${description}`, {
        securityEvent: true,
        ...context,
      });
    },

    unauthorized: (resource: string, context?: LogContext) => {
      logger.warn(`Unauthorized access attempt to ${resource}`, {
        securityEvent: true,
        resource,
        ...context,
      });
    },

    rateLimitExceeded: (identifier: string, context?: LogContext) => {
      logger.warn('Rate limit exceeded', {
        rateLimitEvent: true,
        identifier,
        ...context,
      });
    },
  },
};

// Request ID generator for correlation
export const generateRequestId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Middleware helper for request logging
export const createRequestLogger = (requestId: string) => {
  return {
    info: (message: string, context?: LogContext) => log.info(message, { requestId, ...context }),
    error: (message: string, context?: LogContext, error?: Error) => log.error(message, { requestId, ...context }, error),
    warn: (message: string, context?: LogContext) => log.warn(message, { requestId, ...context }),
    debug: (message: string, context?: LogContext) => log.debug(message, { requestId, ...context }),
  };
};

// Performance monitoring helper
export const performanceLogger = {
  start: (operation: string) => {
    const startTime = Date.now();
    return {
      end: (success: boolean = true, context?: LogContext) => {
        const duration = Date.now() - startTime;
        log.info(`Operation ${operation} ${success ? 'completed' : 'failed'}`, {
          operation,
          duration,
          success,
          ...context,
        });
        return duration;
      },
    };
  },
};

// Export the main logger for backward compatibility
export default logger;