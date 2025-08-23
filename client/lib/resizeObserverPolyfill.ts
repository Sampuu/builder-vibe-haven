// ResizeObserver error handler and polyfill
// This suppresses the harmless "ResizeObserver loop completed with undelivered notifications" error

// Store the original error handler
const originalConsoleError = console.error;

// Override console.error to filter out ResizeObserver errors
console.error = (...args: any[]) => {
  // Check if this is the ResizeObserver loop error
  if (args[0] && typeof args[0] === 'string') {
    if (args[0].includes('ResizeObserver loop completed with undelivered notifications')) {
      // This is a known harmless error in many UI libraries - suppress it
      return;
    }
    if (args[0].includes('ResizeObserver loop limit exceeded')) {
      // Another variant of the same error - suppress it
      return;
    }
  }
  
  // For all other errors, use the original console.error
  originalConsoleError(...args);
};

// Add a global error handler for unhandled ResizeObserver errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    if (e.message && e.message.includes('ResizeObserver')) {
      e.preventDefault();
      return false;
    }
  });

  // Handle promise rejections that might be related to ResizeObserver
  window.addEventListener('unhandledrejection', (e) => {
    if (e.reason && e.reason.message && e.reason.message.includes('ResizeObserver')) {
      e.preventDefault();
      return false;
    }
  });
}

// Debounced ResizeObserver utility for components that need it
export class DebouncedResizeObserver {
  private observer: ResizeObserver | null = null;
  private timeout: number | null = null;
  private callback: ResizeObserverCallback;
  private debounceTime: number;

  constructor(callback: ResizeObserverCallback, debounceTime: number = 100) {
    this.callback = callback;
    this.debounceTime = debounceTime;
  }

  observe(element: Element, options?: ResizeObserverOptions) {
    if (!this.observer) {
      this.observer = new ResizeObserver((entries, observer) => {
        if (this.timeout) {
          clearTimeout(this.timeout);
        }
        
        this.timeout = window.setTimeout(() => {
          try {
            this.callback(entries, observer);
          } catch (error) {
            // Suppress ResizeObserver errors
            if (error instanceof Error && error.message.includes('ResizeObserver')) {
              return;
            }
            console.error('ResizeObserver callback error:', error);
          }
        }, this.debounceTime);
      });
    }

    this.observer.observe(element, options);
  }

  unobserve(element: Element) {
    if (this.observer) {
      this.observer.unobserve(element);
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}

export default {};
