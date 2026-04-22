import { motion, AnimatePresence } from 'framer-motion';
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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-dark border-primary/20 industrial-shadow">
          <CardContent className="space-y-4 p-6">
            <Badge variant="outline" className="w-fit text-[10px] uppercase tracking-[0.25em] bg-primary/5 text-primary border-primary/20">
              SITE STATUS
            </Badge>
            <h2 className="text-xl font-bold text-foreground">Waiting for update</h2>
            <p className="text-sm leading-relaxed text-muted-foreground/80">
              Use the capture button below to start your first site note. KOEN will analyze the audio and present the results here.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card className={`overflow-hidden glass-dark border-primary/20 industrial-shadow ${latestCapture ? getLatestCaptureCardClass(latestCapture) : getPrimaryRecordCardClass(primaryRecord!)}`}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <motion.div
              variants={itemVariants}
              className="mt-1"
            >
              {latestCapture ? (
                latestCapture.phase === 'queued_offline' ? (
                  <CloudOff className="h-6 w-6 text-primary" />
                ) : latestCapture.phase === 'processed' ? (
                  <Check className="h-6 w-6 text-emerald-500" />
                ) : latestCapture.phase === 'error' ? (
                  <AlertCircle className="h-6 w-6 text-destructive" />
                ) : (
                  <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
                )
              ) : primaryRecord?.processingStatus === 'needs_confirmation' ? (
                <AlertCircle className="h-6 w-6 text-primary" />
              ) : primaryRecord?.processingStatus === 'processing' ? (
                <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <Check className="h-6 w-6 text-emerald-500" />
              )}
            </motion.div>

            <div className="min-w-0 flex-1 space-y-6">
              <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                      {latestCapture ? 'LIVE CAPTURE' : 'SITE LEDGER'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-muted-foreground/40 uppercase tracking-widest">
                    {formatShortTime(latestCapture?.startedAt || primaryRecord!.createdAt)}
                  </span>
                  {!latestCapture && primaryRecord && (
                    <Badge
                      variant="outline"
                      className={`text-[9px] font-mono font-black uppercase tracking-wider h-5 ${getProcessingBadgeClass(primaryRecord)}`}
                    >
                      {getProcessingLabel(primaryRecord)}
                    </Badge>
                  )}
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {latestCapture
                    ? formatLatestCaptureTitle(latestCapture, latestCaptureRecord)
                    : formatPrimaryRecordTitle(primaryRecord!)}
                </h2>
                <div className="text-[11px] font-medium leading-relaxed text-muted-foreground/60 uppercase tracking-wide">
                  {latestCapture
                    ? formatLatestCaptureDetail(latestCapture, latestCaptureRecord)
                    : formatPrimaryRecordDetail(primaryRecord!)}
                </div>
              </motion.div>

              <AnimatePresence>
                {primaryRecord?.transcript?.trim() && (
                  <motion.div
                    variants={itemVariants}
                    className="rounded-xl border border-border/20 bg-muted/20 p-3 opacity-80"
                  >
                    <div className="mb-1 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                      HEARD
                    </div>
                    <p className="text-[11px] leading-relaxed text-foreground/70 italic">
                      &ldquo;{primaryRecord.transcript}&rdquo;
                    </p>
                  </motion.div>
                )}

                {primaryRecord?.extracted && primaryRecord.extracted.length > 0 && (
                  <motion.div
                    variants={itemVariants}
                    className="rounded-2xl border border-border/40 bg-muted/40 p-4 industrial-shadow"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                        EXTRACTED INTEL
                      </div>
                    </div>
                    <div className="space-y-3">
                      {primaryRecord.extracted.map((item, idx) => (
                        <motion.div
                          key={item.id || `ext-${idx}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + idx * 0.05 }}
                          className="flex items-start gap-4 rounded-xl border border-border/40 bg-card/60 p-3"
                        >
                          <Badge
                            variant="outline"
                            className="min-w-24 justify-center border-primary/20 bg-primary/5 text-[9px] font-black uppercase tracking-wider text-primary"
                          >
                            {formatCategoryLabel(item.category)}
                          </Badge>
                          <div className="flex-1 text-sm leading-relaxed text-foreground/90">
                            {formatExtractedContent(item)}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {primaryRecordConfirmations.length > 0 && (
                  <motion.div variants={itemVariants} className="space-y-3 pt-1">
                    <div className="flex items-center justify-between gap-3 px-1">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                        PENDING REVIEW
                      </div>
                    </div>
                    <div className="space-y-3">
                      {primaryRecordConfirmations.map((confirmation, idx) => (
                        <ConfirmationCard
                          key={confirmation.item.id || `conf-${idx}`}
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
                  </motion.div>
                )}
              </AnimatePresence>

              {primaryRecord && !primaryRecord.transcript.trim() && primaryRecord.processingStatus === 'processing' && (
                <motion.div
                  variants={itemVariants}
                  className="rounded-2xl border border-border/40 bg-muted/40 p-4 text-[10px] uppercase font-mono tracking-widest text-primary/40 animate-pulse"
                >
                  Analyzing audio telemetry...
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

