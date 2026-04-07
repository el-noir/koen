import { Check, CloudOff, Info, LoaderCircle, Wifi } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

import { StatusNotice } from '../project-detail.types';
import { getStatusNoticeCardClass } from '../project-detail.utils';

type Props = {
  isOffline: boolean;
  isSyncingQueue: boolean;
  pendingRecordCount: number;
  queuedCount: number;
  shouldShowStatusNotice: boolean;
  statusNotice: StatusNotice | null;
};

export function ProjectStatusSection({
  isOffline,
  isSyncingQueue,
  pendingRecordCount,
  queuedCount,
  shouldShowStatusNotice,
  statusNotice,
}: Props) {
  return (
    <>
      {shouldShowStatusNotice && statusNotice && (
        <Card className={getStatusNoticeCardClass(statusNotice)}>
          <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
            {statusNotice.tone === 'warning' ? (
              <CloudOff className="h-4 w-4 text-yellow-600" />
            ) : statusNotice.tone === 'success' ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : statusNotice.tone === 'error' ? (
              <Info className="h-4 w-4 text-red-600" />
            ) : (
              <Info className="h-4 w-4 text-blue-600" />
            )}
            <span>{statusNotice.message}</span>
          </CardContent>
        </Card>
      )}

      {(isOffline || isSyncingQueue || queuedCount > 0 || pendingRecordCount > 1) && (
        <Card className="border-border/50 bg-card/70">
          <CardContent className="space-y-3 p-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Site status
              </div>
              <p className="text-sm text-muted-foreground">
                KOEN will keep syncing and processing in the background.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {(isOffline || isSyncingQueue || queuedCount > 0) && (
                <div className="rounded-2xl border border-border/40 bg-background/50 p-3 text-sm text-muted-foreground">
                  <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                    {isOffline ? (
                      <CloudOff className="h-4 w-4 text-yellow-600" />
                    ) : isSyncingQueue ? (
                      <LoaderCircle className="h-4 w-4 animate-spin text-yellow-600" />
                    ) : (
                      <Wifi className="h-4 w-4 text-emerald-600" />
                    )}
                    Connection
                  </div>
                  <p>
                    {isOffline
                      ? 'Offline mode active. New notes will be saved locally.'
                      : isSyncingQueue
                        ? 'Syncing saved notes now.'
                        : `${queuedCount} saved note${queuedCount === 1 ? '' : 's'} waiting to sync.`}
                  </p>
                </div>
              )}

              {pendingRecordCount > 1 && (
                <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-3 text-sm text-muted-foreground">
                  <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                    <LoaderCircle className="h-4 w-4 animate-spin text-yellow-600" />
                    Processing
                  </div>
                  <p>{`Processing ${pendingRecordCount} notes in the background.`}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
