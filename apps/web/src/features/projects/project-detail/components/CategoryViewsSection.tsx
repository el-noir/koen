import { MessageSquare } from 'lucide-react';

import { VoiceRecord } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { PROJECT_DETAIL_TABS, formatExtractedContent, formatShortTime } from '../project-detail.utils';

type Props = {
  records: VoiceRecord[];
};

export function CategoryViewsSection({ records }: Props) {
  return (
    <Tabs defaultValue="task" className="space-y-4">
      <div className="space-y-2">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
            Category Views
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse extracted items by type after the note flow above.
          </p>
        </div>

        <div className="overflow-x-auto no-scrollbar pb-1">
          <TabsList className="min-w-max bg-muted/50 p-1">
            {PROJECT_DETAIL_TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="px-4 text-[10px] font-bold uppercase tracking-wider">
                <tab.icon className="mr-2 h-3 w-3" /> {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>

      {PROJECT_DETAIL_TABS.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="m-0 focus-visible:ring-0">
          <div className="grid gap-4">
            {records
              .filter((record) => record.extracted?.some((item) => item.category === tab.id))
              .map((record) => (
                <Card key={record.id} className="border-border/40 bg-card/50 transition-colors hover:bg-accent/30">
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center text-[10px] font-mono uppercase text-muted-foreground">
                        <MessageSquare className="mr-2 h-3 w-3" />
                        Site note
                      </div>
                      <Badge variant="secondary" className="text-[9px] font-mono opacity-70">
                        {formatShortTime(record.createdAt)}
                      </Badge>
                    </div>
                    <Separator className="mb-3 opacity-20" />
                    <div className="space-y-3">
                      {record.extracted
                        ?.filter((item) => item.category === tab.id)
                        .map((item) => (
                          <div key={item.id} className="flex items-start gap-3">
                            <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                            <div className="text-sm font-medium italic leading-relaxed text-foreground/90">
                              &ldquo;{formatExtractedContent(item)}&rdquo;
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

            {records.filter((record) => record.extracted?.some((item) => item.category === tab.id)).length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/40 px-6 py-20 text-center">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted/50">
                  <tab.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  No {tab.label} recorded
                </h3>
              </div>
            )}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
