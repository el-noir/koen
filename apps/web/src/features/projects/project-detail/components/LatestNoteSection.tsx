import { AlertCircle, Check, CloudOff, LoaderCircle } from 'lucide-react';

import { VoiceRecord } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import { CaptureFlow, EditableDraft, PendingConfirmation } from '../project-detail.types';
import {
  formatExtractedContent,
  formatCategoryLabel,
  formatLatestCaptureDetail,
  formatLatestCaptureTitle,
  formatPrimaryRecordDetail,
  formatPrimaryRecordTitle,
  formatShortTime,
  getLatestCaptureCardClass,
  getPrimaryRecordCardClass,
  getProcessingBadgeClass,
  getProcessingLabel,
} from '../project-detail.utils';
import { ConfirmationCard } from './ConfirmationCard';

type Props = {
  cancelEditing: () => void;
  drafts: Record<string, EditableDraft>;
  editingItemId: string | null;
  latestCapture: CaptureFlow | null;
  latestCaptureRecord: VoiceRecord | null;
  primaryRecord: VoiceRecord | null;
  primaryRecordConfirmations: PendingConfirmation[];
  saveConfirmation: (item: PendingConfirmation['item'], options?: { useDraft?: boolean }) => Promise<void>;
  savingItemIds: string[];
  startEditing: (item: PendingConfirmation['item']) => void;
  updateDraftValue: (itemId: string, field: keyof EditableDraft, value: string) => void;
};

export function LatestNoteSection({
  cancelEditing,
  drafts,
  editingItemId,
  latestCapture,
  latestCaptureRecord,
  primaryRecord,
  primaryRecordConfirmations,
  saveConfirmation,
  savingItemIds,
  startEditing,
  updateDraftValue,
}: Props) {
  if (!latestCapture && !primaryRecord) {
    return (
      <Card className="border-border/40 bg-card/70">
        <CardContent className="space-y-3 p-5">
          <Badge variant="outline" className="w-fit text-[10px] uppercase tracking-[0.22em]">
            Latest note
          </Badge>
          <h2 className="text-lg font-semibold text-foreground">No notes yet</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Record the first site update below and KOEN will keep the latest result here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${latestCapture ? getLatestCaptureCardClass(latestCapture) : getPrimaryRecordCardClass(primaryRecord!)}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {latestCapture ? (
              latestCapture.phase === 'queued_offline' ? (
                <CloudOff className="h-5 w-5 text-yellow-600" />
              ) : latestCapture.phase === 'processed' ? (
                <Check className="h-5 w-5 text-emerald-600" />
              ) : latestCapture.phase === 'error' ? (
                <AlertCircle className="h-5 w-5 text-red-600" />
              ) : (
                <LoaderCircle className="h-5 w-5 animate-spin text-blue-600" />
              )
            ) : primaryRecord?.processingStatus === 'needs_confirmation' ? (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            ) : primaryRecord?.processingStatus === 'processing' ? (
              <LoaderCircle className="h-5 w-5 animate-spin text-blue-600" />
            ) : (
              <Check className="h-5 w-5 text-emerald-600" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-[10px] uppercase tracking-[0.22em]">
                  Latest note
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatShortTime(latestCapture?.startedAt || primaryRecord!.createdAt)}
                </span>
                {!latestCapture && primaryRecord && (
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-mono uppercase ${getProcessingBadgeClass(primaryRecord)}`}
                  >
                    {getProcessingLabel(primaryRecord)}
                  </Badge>
                )}
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                {latestCapture
                  ? formatLatestCaptureTitle(latestCapture, latestCaptureRecord)
                  : formatPrimaryRecordTitle(primaryRecord!)}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {latestCapture
                  ? formatLatestCaptureDetail(latestCapture, latestCaptureRecord)
                  : formatPrimaryRecordDetail(primaryRecord!)}
              </p>
            </div>

            {primaryRecord?.transcript?.trim() && (
              <div className="rounded-2xl border border-border/40 bg-background/55 p-3">
                <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Heard
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {primaryRecord.transcript}
                </p>
              </div>
            )}

            {primaryRecord?.extracted && primaryRecord.extracted.length > 0 && (
              <div className="rounded-2xl border border-border/40 bg-background/55 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Structured result
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {primaryRecord.extracted.length} item{primaryRecord.extracted.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="space-y-2">
                  {primaryRecord.extracted.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 rounded-xl border border-border/30 bg-card/40 px-3 py-2"
                    >
                      <Badge
                        variant="outline"
                        className="min-w-20 justify-center border-yellow-500/40 bg-yellow-500/5 text-[10px] uppercase text-yellow-600"
                      >
                        {formatCategoryLabel(item.category)}
                      </Badge>
                      <div className="flex-1 text-sm leading-relaxed text-foreground/90">
                        {formatExtractedContent(item)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {primaryRecordConfirmations.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Needs review
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Confirm this note before moving on.
                    </p>
                  </div>
                  <Badge variant="outline" className="border-yellow-500/40 bg-yellow-500/5 text-yellow-600">
                    {primaryRecordConfirmations.length} item{primaryRecordConfirmations.length === 1 ? '' : 's'}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {primaryRecordConfirmations.map((confirmation) => (
                    <ConfirmationCard
                      key={confirmation.item.id}
                      cancelEditing={cancelEditing}
                      compact
                      confirmation={confirmation}
                      drafts={drafts}
                      editingItemId={editingItemId}
                      saveConfirmation={saveConfirmation}
                      savingItemIds={savingItemIds}
                      startEditing={startEditing}
                      updateDraftValue={updateDraftValue}
                    />
                  ))}
                </div>
              </div>
            )}

            {primaryRecord && !primaryRecord.transcript.trim() && primaryRecord.processingStatus === 'processing' && (
              <div className="rounded-2xl border border-border/40 bg-background/55 p-3 text-sm text-muted-foreground">
                Transcript will appear here as soon as KOEN finishes processing this note.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
