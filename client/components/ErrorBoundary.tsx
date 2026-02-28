import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    // Reset state and reload the page
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-emergency-danger/10 p-3 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-emergency-danger" />
                </div>
              </div>
              <CardTitle className="text-xl text-slate-900">
                Something went wrong
              </CardTitle>
              <CardDescription>
                An unexpected error occurred in the Emergency Response System
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    Error Details:
                  </p>
                  <p className="text-sm text-slate-600 font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex justify-center space-x-2">
                <Button onClick={this.handleReload} variant="default">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload Application
                </Button>
                <Button
                  onClick={() => (window.location.href = "/")}
                  variant="outline"
                >
                  Go to Home
                </Button>
              </div>

              {process.env.NODE_ENV === "development" &&
                this.state.errorInfo && (
                  <details className="mt-4">
                    <summary className="text-sm font-medium text-slate-700 cursor-pointer">
                      Developer Details (Click to expand)
                    </summary>
                    <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                      <pre className="text-xs text-slate-600 whitespace-pre-wrap overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  </details>
                )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
