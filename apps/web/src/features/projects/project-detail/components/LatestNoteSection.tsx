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
      <Card className={`overflow-hidden bg-card/30 glass-dark border-primary/20 industrial-shadow structural-corner relative ${latestCapture ? getLatestCaptureCardClass(latestCapture) : getPrimaryRecordCardClass(primaryRecord!)}`}>
        {/* Schematic Crosshairs */}
        <div className="absolute top-1.5 left-1.5 text-[9px] text-primary/20 font-mono">+</div>
        <div className="absolute top-1.5 right-1.5 text-[9px] text-primary/20 font-mono">+</div>

        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <motion.div
              variants={itemVariants}
              className="mt-1"
            >
              {latestCapture ? (
                latestCapture.phase === 'queued_offline' ? (
                  <div className="led-pulse led-amber h-5 w-5 border border-amber-500/20 rounded-full flex items-center justify-center"><CloudOff className="h-3 w-3" /></div>
                ) : latestCapture.phase === 'processed' ? (
                  <div className="led-pulse led-green h-5 w-5 border border-emerald-500/20 rounded-full flex items-center justify-center"><Check className="h-3 w-3" /></div>
                ) : latestCapture.phase === 'error' ? (
                  <div className="led-pulse led-red h-5 w-5 border border-red-500/20 rounded-full flex items-center justify-center"><AlertCircle className="h-3 w-3" /></div>
                ) : (
                  <div className="led-pulse led-blue h-5 w-5 border border-blue-500/20 rounded-full flex items-center justify-center"><LoaderCircle className="h-3 w-3 animate-spin" /></div>
                )
              ) : primaryRecord?.processingStatus === 'needs_confirmation' ? (
                <div className="led-pulse led-amber h-5 w-5 border border-amber-500/20 rounded-full flex items-center justify-center"><AlertCircle className="h-3 w-3" /></div>
              ) : primaryRecord?.processingStatus === 'processing' ? (
                <div className="led-pulse led-blue h-5 w-5 border border-blue-500/20 rounded-full flex items-center justify-center"><LoaderCircle className="h-3 w-3 animate-spin" /></div>
              ) : (
                <div className="led-pulse led-green h-5 w-5 border border-emerald-500/20 rounded-full flex items-center justify-center"><Check className="h-3 w-3" /></div>
              )}
            </motion.div>

            <div className="min-w-0 flex-1 space-y-6">
              <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-primary">
                      {latestCapture ? '[INTEL.LIVE_CAP]' : '[SITE.LEDGER_SYNC]'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-muted-foreground/30 uppercase tracking-widest border-l border-white/5 pl-4">
                    T_{formatShortTime(latestCapture?.startedAt || primaryRecord!.createdAt)}
                  </span>
                  {!latestCapture && primaryRecord && (
                    <Badge
                      variant="outline"
                      className={`text-[9px] font-mono font-black uppercase tracking-wider h-5 px-3 border-primary/20 ${getProcessingBadgeClass(primaryRecord)}`}
                    >
                      {getProcessingLabel(primaryRecord)}
                    </Badge>
                  )}
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground uppercase">
                  {latestCapture
                    ? formatLatestCaptureTitle(latestCapture, latestCaptureRecord)
                    : formatPrimaryRecordTitle(primaryRecord!)}
                </h2>
                <div className="text-[11px] font-mono font-medium leading-relaxed text-muted-foreground/40 uppercase tracking-wide">
                  {latestCapture
                    ? formatLatestCaptureDetail(latestCapture, latestCaptureRecord)
                    : formatPrimaryRecordDetail(primaryRecord!)}
                </div>
              </motion.div>

              <AnimatePresence>
                {primaryRecord?.transcript?.trim() && (
                  <motion.div
                    variants={itemVariants}
                    className="rounded-xl border border-primary/10 bg-muted/20 p-3 opacity-80 structural-corner"
                  >
                    <div className="mb-1 text-[9px] font-mono font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                      SYS.AUDIBLE_CONTEXT
                    </div>
                    <p className="text-[11px] font-mono leading-relaxed text-foreground/70 italic">
                      &ldquo;{primaryRecord.transcript}&rdquo;
                    </p>
                  </motion.div>
                )}

                {primaryRecord?.extracted && primaryRecord.extracted.length > 0 && (
                  <motion.div
                    variants={itemVariants}
                    className="rounded-xl border border-primary/10 bg-muted/20 p-4 industrial-shadow structural-corner"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-primary">
                        DATA.EXTRACTED_INTEL
                      </div>
                    </div>
                    <div className="space-y-2">
                      {primaryRecord.extracted.map((item, idx) => (
                        <motion.div
                          key={item.id || `ext-${idx}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + idx * 0.05 }}
                          className="flex items-start gap-4 rounded-lg border border-white/5 bg-card/60 p-3"
                        >
                          <Badge
                            variant="outline"
                            className="min-w-24 justify-center border-primary/10 bg-primary/5 text-[9px] font-mono font-black uppercase tracking-wider text-primary/70"
                          >
                            {formatCategoryLabel(item.category)}
                          </Badge>
                          <div className="flex-1 text-[11px] font-mono leading-relaxed text-foreground/80">
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
                      <div className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-primary">
                        SYS.PENDING_REVIEW
                      </div>
                      <div className="h-1 flex-1 border-t border-dashed border-primary/20" />
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
                  className="rounded-xl border border-primary/10 bg-muted/20 p-4 text-[9px] uppercase font-mono tracking-widest text-primary/30 animate-pulse structural-corner"
                >
                  SYSTEM.ANALYZING_TELEMETRY...
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

