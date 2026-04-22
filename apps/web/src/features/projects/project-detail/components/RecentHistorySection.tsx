import { ChevronDown, ChevronRight, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

import { VoiceRecord } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import {
  formatCategoryLabel,
  formatExtractedContent,
  formatShortTime,
  getProcessingBadgeClass,
  getProcessingLabel,
} from '../project-detail.utils';

type Props = {
  expandedHistoryRecordIds: string[];
  historyRecords: VoiceRecord[];
  totalCount: number;
  toggleHistoryRecord: (recordId: string) => void;
};

export function RecentHistorySection({
  expandedHistoryRecordIds,
  historyRecords,
  totalCount,
  toggleHistoryRecord,
}: Props) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
            Recent History
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Older notes stay collapsed until you need more detail.
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {totalCount} total
        </span>
      </div>

      {historyRecords.length > 0 ? (
        <div className="space-y-4">
          {historyRecords.map((record, idx) => {
            const isExpanded = expandedHistoryRecordIds.includes(record.id);

            return (
              <Card key={record.id || `rec-${idx}`} className="glass-dark border-white/5 industrial-shadow group">
                <CardContent className="p-0">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-white/5"
                    onClick={() => toggleHistoryRecord(record.id)}
                  >
                    <div className="min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase font-black tracking-[0.2em] text-primary/70">
                        <span className="inline-flex items-center gap-2">
                          <MessageSquare className="h-3.5 w-3.5" />
                          Site Entry
                        </span>
                        <div className="h-1 w-1 rounded-full bg-white/10" />
                        <span className="font-mono">{formatShortTime(record.createdAt)}</span>
                      </div>
                      <p className="truncate text-sm font-medium text-foreground/80 group-hover:text-foreground">
                        {record.transcript.trim() || 'No audio recording found.'}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-4">
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-black uppercase tracking-wider ${getProcessingBadgeClass(record)}`}
                      >
                        {getProcessingLabel(record)}
                      </Badge>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted-foreground group-hover:text-primary transition-all">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="overflow-hidden"
                    >
                      <Separator className="bg-white/5" />
                      <div className="space-y-4 p-5 pt-4">
                        <div className="rounded-2xl border border-white/5 bg-background/40 p-4">
                          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
                            RAW TRANSCRIPT
                          </div>
                          <p className="text-sm leading-relaxed text-foreground/90">
                            {record.transcript.trim() || 'No transcript data.'}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/5 bg-background/40 p-4">
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
                              EXTRACTION DATA
                            </div>
                          </div>
                          {record.extracted && record.extracted.length > 0 ? (
                            <div className="space-y-3">
                              {record.extracted.map((item, eIdx) => (
                                <div
                                  key={item.id || `hist-ext-${eIdx}`}
                                  className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/5 px-4 py-3"
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
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs uppercase font-mono tracking-widest text-muted-foreground/30 py-4 text-center">
                              {record.processingStatus === 'processing'
                                ? 'Analyzing telemetry...'
                                : 'No data extracted.'}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="glass-dark border-white/5 bg-white/5 industrial-shadow">
          <CardContent className="p-8 text-center">
            <p className="text-[10px] uppercase font-mono tracking-[0.25em] text-muted-foreground/40">
              Site history is cleared. Captures will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
