"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorFallbackProps {
  error?: Error | null;
  message?: string;
  onRetry?: () => void;
}

export function ErrorFallback({
  error,
  message = "Something went wrong loading this section.",
  onRetry,
}: ErrorFallbackProps) {
  return (
    <Card className="glass-card border-red-500/20">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <p className="font-medium mb-1">{message}</p>
          {error && (
            <p className="text-xs text-muted-foreground font-mono">
              {error.message}
            </p>
          )}
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
