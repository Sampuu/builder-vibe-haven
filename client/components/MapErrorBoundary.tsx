import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Map, AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class MapErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Map component error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Map Loading Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                The interactive map failed to load properly. This could be due
                to network issues or browser compatibility.
              </AlertDescription>
            </Alert>

            <div className="bg-slate-100 p-6 rounded-lg border-2 border-dashed border-slate-300 text-center">
              <Map className="h-16 w-16 mx-auto mb-4 opacity-50 text-slate-500" />
              <p className="text-lg font-medium text-slate-700 mb-2">
                Map Unavailable
              </p>
              <p className="text-sm text-slate-600 mb-4">
                The emergency map service is temporarily unavailable. You can
                still access emergency contacts and report incidents.
              </p>

              <div className="space-y-2">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>

                <Button
                  onClick={this.handleReload}
                  variant="default"
                  className="w-full"
                >
                  Reload Page
                </Button>
              </div>
            </div>

            {/* Emergency Fallback Actions */}
            <div className="bg-emergency-danger/10 p-4 rounded-lg border border-emergency-danger/20">
              <h3 className="font-medium text-emergency-danger mb-2">
                Emergency Contacts
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>Emergency Services:</span>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-emergency-danger font-medium"
                    onClick={() => window.open("tel:911")}
                  >
                    Call 911
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span>Poison Control:</span>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-emergency-info font-medium"
                    onClick={() => window.open("tel:1-800-222-1222")}
                  >
                    1-800-222-1222
                  </Button>
                </div>
              </div>
            </div>

            {/* Technical Details (in development) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="text-xs text-slate-600 bg-slate-50 p-3 rounded border">
                <summary className="cursor-pointer font-medium">
                  Technical Details
                </summary>
                <pre className="mt-2 whitespace-pre-wrap overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack && (
                    <div className="mt-2">
                      Component Stack:
                      {this.state.errorInfo.componentStack}
                    </div>
                  )}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;
