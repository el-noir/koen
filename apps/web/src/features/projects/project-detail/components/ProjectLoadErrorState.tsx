import { AlertCircle, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type Props = {
  errorMessage: string | null;
  onRetry: () => void;
};

export function ProjectLoadErrorState({ errorMessage, onRetry }: Props) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6 text-foreground">
      <Card className="w-full max-w-md border-red-500/30 bg-card/80">
        <CardContent className="space-y-4 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-lg font-semibold">Could not load this site</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {errorMessage || 'Please try again in a moment.'}
            </p>
          </div>
          <Button onClick={onRetry} className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
