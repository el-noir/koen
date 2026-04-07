import { ChevronDown, ChevronRight, MessageSquare } from 'lucide-react';

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
        <div className="space-y-3">
          {historyRecords.map((record) => {
            const isExpanded = expandedHistoryRecordIds.includes(record.id);

            return (
              <Card key={record.id} className="border-border/40 bg-card/60">
                <CardContent className="p-0">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 p-4 text-left"
                    onClick={() => toggleHistoryRecord(record.id)}
                  >
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <MessageSquare className="h-3 w-3" />
                          Voice note
                        </span>
                        <span>{formatShortTime(record.createdAt)}</span>
                      </div>
                      <p className="truncate text-sm text-foreground/90">
                        {record.transcript.trim() || 'Transcript not available yet.'}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-mono uppercase ${getProcessingBadgeClass(record)}`}
                      >
                        {getProcessingLabel(record)}
                      </Badge>
                      <span className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <>
                      <Separator className="opacity-20" />
                      <div className="space-y-3 p-4">
                        <div className="rounded-2xl border border-border/40 bg-background/40 p-3">
                          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            Transcript
                          </div>
                          <p className="text-sm leading-relaxed text-foreground/90">
                            {record.transcript.trim() || 'Transcript not available yet.'}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-border/40 bg-background/40 p-3">
                          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            Structured result
                          </div>
                          {record.extracted && record.extracted.length > 0 ? (
                            <div className="space-y-2">
                              {record.extracted.map((item) => (
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
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {record.processingStatus === 'processing'
                                ? 'KOEN is still processing this note.'
                                : 'No structured items were produced yet.'}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-4 text-sm text-muted-foreground">
            Older notes will appear here after you record more updates.
          </CardContent>
        </Card>
      )}
    </section>
  );
}
