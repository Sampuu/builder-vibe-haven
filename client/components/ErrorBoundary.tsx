import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="flex justify-center mb-6">
              <div className="bg-emergency-danger/10 p-3 rounded-full">
                <AlertTriangle className="h-8 w-8 text-emergency-danger" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-slate-600 mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className="text-left bg-slate-100 p-4 rounded-lg mb-6">
                <summary className="cursor-pointer font-medium text-slate-700 mb-2">
                  Error Details
                </summary>
                <pre className="text-sm text-slate-600 overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <Button 
              onClick={() => window.location.reload()}
              variant="default"
              className="w-full"
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
