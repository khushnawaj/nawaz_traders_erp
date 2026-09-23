/**
 * Production-ready Structured JSON Logger for Nawaz Traders ERP
 */

export const logger = {
  info(message, context = {}) {
    const entry = {
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...context,
    };
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(entry));
    } else {
      console.log(`ℹ️ [INFO] ${message}`, Object.keys(context).length ? context : '');
    }
  },

  warn(message, context = {}) {
    const entry = {
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      ...context,
    };
    if (process.env.NODE_ENV === 'production') {
      console.warn(JSON.stringify(entry));
    } else {
      console.warn(`⚠️ [WARN] ${message}`, Object.keys(context).length ? context : '');
    }
  },

  error(message, error = null, context = {}) {
    const entry = {
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: error ? { message: error.message, stack: error.stack } : null,
      ...context,
    };
    if (process.env.NODE_ENV === 'production') {
      console.error(JSON.stringify(entry));
    } else {
      console.error(`🚨 [ERROR] ${message}`, error?.message || '', Object.keys(context).length ? context : '');
    }
  },
};
