import { FirebaseError } from 'firebase/app';

export interface FirebaseErrorInfo {
  code: string;
  message: string;
  isNetworkError: boolean;
  isRetryable: boolean;
  userFriendlyMessage: string;
  actionRequired?: string;
}

/**
 * Comprehensive Firebase error handler that provides user-friendly error messages
 * and determines if an error is retryable
 */
export class FirebaseErrorHandler {
  private static authErrorMap: Record<string, Partial<FirebaseErrorInfo>> = {
    // Network-related errors
    'auth/network-request-failed': {
      userFriendlyMessage: 'Network connection failed. Please check your internet connection and try again.',
      isNetworkError: true,
      isRetryable: true,
      actionRequired: 'Check your internet connection'
    },
    'auth/timeout': {
      userFriendlyMessage: 'Request timed out. Please try again.',
      isNetworkError: true,
      isRetryable: true,
      actionRequired: 'Try again in a moment'
    },

    // Authentication errors
    'auth/email-already-in-use': {
      userFriendlyMessage: 'An account with this email already exists.',
      isNetworkError: false,
      isRetryable: false,
      actionRequired: 'Use a different email or sign in instead'
    },
    'auth/weak-password': {
      userFriendlyMessage: 'Password should be at least 6 characters long.',
      isNetworkError: false,
      isRetryable: false,
      actionRequired: 'Create a stronger password'
    },
    'auth/invalid-email': {
      userFriendlyMessage: 'Invalid email address format.',
      isNetworkError: false,
      isRetryable: false,
      actionRequired: 'Enter a valid email address'
    },
    'auth/user-not-found': {
      userFriendlyMessage: 'No account found with this email address.',
      isNetworkError: false,
      isRetryable: false,
      actionRequired: 'Check your email or create a new account'
    },
    'auth/wrong-password': {
      userFriendlyMessage: 'Incorrect password.',
      isNetworkError: false,
      isRetryable: false,
      actionRequired: 'Enter the correct password'
    },
    'auth/invalid-credential': {
      userFriendlyMessage: 'Invalid email or password.',
      isNetworkError: false,
      isRetryable: false,
      actionRequired: 'Check your email and password'
    },
    'auth/user-disabled': {
      userFriendlyMessage: 'This account has been disabled.',
      isNetworkError: false,
      isRetryable: false,
      actionRequired: 'Contact support for assistance'
    },
    'auth/too-many-requests': {
      userFriendlyMessage: 'Too many failed attempts. Please try again later.',
      isNetworkError: false,
      isRetryable: true,
      actionRequired: 'Wait a few minutes before trying again'
    },

    // Configuration errors
    'auth/operation-not-allowed': {
      userFriendlyMessage: 'Email/password accounts are not enabled.',
      isNetworkError: false,
      isRetryable: false,
      actionRequired: 'Contact support'
    },
    'auth/configuration-not-found': {
      userFriendlyMessage: 'Authentication service is not properly configured.',
      isNetworkError: false,
      isRetryable: false,
      actionRequired: 'Contact support'
    },
    'auth/invalid-api-key': {
      userFriendlyMessage: 'Authentication service configuration error.',
      isNetworkError: false,
      isRetryable: false,
      actionRequired: 'Contact support'
    },

    // Permission errors
    'permission-denied': {
      userFriendlyMessage: 'You do not have permission to perform this action.',
      isNetworkError: false,
      isRetryable: false,
      actionRequired: 'Contact an administrator'
    },
    'unauthenticated': {
      userFriendlyMessage: 'You need to sign in to perform this action.',
      isNetworkError: false,
      isRetryable: false,
      actionRequired: 'Please sign in'
    }
  };

  private static firestoreErrorMap: Record<string, Partial<FirebaseErrorInfo>> = {
    'unavailable': {
      userFriendlyMessage: 'Service is temporarily unavailable. Please try again.',
      isNetworkError: true,
      isRetryable: true,
      actionRequired: 'Try again in a moment'
    },
    'deadline-exceeded': {
      userFriendlyMessage: 'Request timed out. Please try again.',
      isNetworkError: true,
      isRetryable: true,
      actionRequired: 'Try again'
    },
    'resource-exhausted': {
      userFriendlyMessage: 'Service quota exceeded. Please try again later.',
      isNetworkError: false,
      isRetryable: true,
      actionRequired: 'Try again later'
    }
  };

  /**
   * Parse Firebase error and return structured error information
   */
  static parseError(error: any): FirebaseErrorInfo {
    const defaultInfo: FirebaseErrorInfo = {
      code: 'unknown',
      message: error?.message || 'An unexpected error occurred',
      isNetworkError: false,
      isRetryable: false,
      userFriendlyMessage: 'An unexpected error occurred. Please try again.',
      actionRequired: 'Try again or contact support'
    };

    if (!error) {
      return defaultInfo;
    }

    // Handle Firebase errors
    if (error.code) {
      const errorCode = error.code;
      const authError = this.authErrorMap[errorCode];
      const firestoreError = this.firestoreErrorMap[errorCode];
      const errorInfo = authError || firestoreError;

      if (errorInfo) {
        return {
          code: errorCode,
          message: error.message,
          isNetworkError: errorInfo.isNetworkError ?? false,
          isRetryable: errorInfo.isRetryable ?? false,
          userFriendlyMessage: errorInfo.userFriendlyMessage ?? defaultInfo.userFriendlyMessage,
          actionRequired: errorInfo.actionRequired
        };
      }
    }

    // Handle network-related errors by message content
    const message = error.message?.toLowerCase() || '';
    if (message.includes('network') || message.includes('connection') || 
        message.includes('fetch') || message.includes('cors')) {
      return {
        ...defaultInfo,
        code: 'network-error',
        isNetworkError: true,
        isRetryable: true,
        userFriendlyMessage: 'Network error occurred. Please check your connection and try again.',
        actionRequired: 'Check your internet connection'
      };
    }

    return {
      ...defaultInfo,
      code: error.code || 'unknown',
      message: error.message
    };
  }

  /**
   * Get a user-friendly error message from any error
   */
  static getUserFriendlyMessage(error: any): string {
    return this.parseError(error).userFriendlyMessage;
  }

  /**
   * Check if an error is retryable
   */
  static isRetryable(error: any): boolean {
    return this.parseError(error).isRetryable;
  }

  /**
   * Check if an error is network-related
   */
  static isNetworkError(error: any): boolean {
    return this.parseError(error).isNetworkError;
  }

  /**
   * Get suggested action for an error
   */
  static getActionRequired(error: any): string | undefined {
    return this.parseError(error).actionRequired;
  }

  /**
   * Log error details for debugging (only in development)
   */
  static logError(error: any, context?: string): void {
    if (import.meta.env.DEV) {
      const errorInfo = this.parseError(error);
      console.group(`🔥 Firebase Error ${context ? `(${context})` : ''}`);
      console.error('Original error:', error);
      console.table(errorInfo);
      console.groupEnd();
    }
  }
}

export default FirebaseErrorHandler;
