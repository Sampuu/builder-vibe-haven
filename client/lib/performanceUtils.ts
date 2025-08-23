// Performance utilities to monitor and prevent excessive updates

export class PerformanceMonitor {
  private static renderCounts: Map<string, number> = new Map();
  private static lastRenderTime: Map<string, number> = new Map();
  private static readonly RENDER_THRESHOLD = 10; // Max renders per second
  private static readonly WARNING_THRESHOLD = 50; // Warn after 50 renders in a short time

  static trackRender(componentName: string): boolean {
    const now = Date.now();
    const lastRender = this.lastRenderTime.get(componentName) || 0;
    const renderCount = this.renderCounts.get(componentName) || 0;

    // Reset counter if more than 1 second has passed
    if (now - lastRender > 1000) {
      this.renderCounts.set(componentName, 1);
      this.lastRenderTime.set(componentName, now);
      return true;
    }

    // Check if we're rendering too frequently
    if (renderCount > this.RENDER_THRESHOLD) {
      if (renderCount === this.WARNING_THRESHOLD) {
        console.warn(`Performance warning: ${componentName} has rendered ${renderCount} times recently. This may cause ResizeObserver issues.`);
      }
      return false; // Skip this render
    }

    this.renderCounts.set(componentName, renderCount + 1);
    this.lastRenderTime.set(componentName, now);
    return true;
  }

  static resetComponentStats(componentName: string) {
    this.renderCounts.delete(componentName);
    this.lastRenderTime.delete(componentName);
  }

  static getStats() {
    return {
      renderCounts: Object.fromEntries(this.renderCounts),
      lastRenderTimes: Object.fromEntries(this.lastRenderTime)
    };
  }
}

// Debounced function utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = window.setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

// Throttled function utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Hook for performance monitoring in React components
export function usePerformanceMonitor(componentName: string) {
  React.useEffect(() => {
    const shouldRender = PerformanceMonitor.trackRender(componentName);
    
    if (!shouldRender) {
      console.warn(`Skipping render for ${componentName} due to performance constraints`);
    }

    return () => {
      PerformanceMonitor.resetComponentStats(componentName);
    };
  });
}

// React import for the hook
import React from 'react';
