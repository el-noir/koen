'use client';

import React, { use, useCallback, useEffect, useState } from 'react';
import { Calendar, MessageSquare, Briefcase, Package, Clock, Star, Info, ChevronLeft, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { api } from '../../../services/api';
import { ExtractedData, Project, VoiceRecord } from '@koen/types';
import { PushToTalkButton } from '../../../components/PushToTalkButton/PushToTalkButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type ProjectWithRecords = Project & { records?: VoiceRecord[] };

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 10;

const tabs = [
  { id: 'task', label: 'Tasks', icon: Briefcase },
  { id: 'material', label: 'Materials', icon: Package },
  { id: 'hours', label: 'Hours', icon: Clock },
  { id: 'event', label: 'Events', icon: Star },
  { id: 'note', label: 'Notes', icon: Info },
] as const;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasFinishedProcessing(record?: VoiceRecord | null) {
  if (!record) {
    return false;
  }

  return record.transcript.trim().length > 0 || Boolean(record.extracted);
}

function formatExtractedContent(item: ExtractedData) {
  if (item.category === 'hours') {
    const content = item.content as {
      start?: string;
      end?: string;
      workers?: number;
      notes?: string;
    };

    const parts = [
      content.start && content.end ? `${content.start} -> ${content.end}` : '',
      typeof content.workers === 'number' ? `${content.workers} worker${content.workers === 1 ? '' : 's'}` : '',
      content.notes || '',
    ].filter(Boolean);

    return parts.join(' | ') || 'Hours recorded';
  }

  const content = item.content as {
    description?: string;
    text?: string;
  };

  return content.description || content.text || 'Recorded update';
}

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [records, setRecords] = useState<VoiceRecord[]>([]);
  const [pendingRecordIds, setPendingRecordIds] = useState<string[]>([]);

  const loadProject = useCallback(async () => {
    try {
      const nextProject = await api.fetch<ProjectWithRecords>(`/projects/${id}`);
      setProject(nextProject);
      setRecords(nextProject.records || []);
      return nextProject;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [id]);

  useEffect(() => {
    void loadProject();
  }, [loadProject]);

  const pollForProcessedRecord = useCallback(
    async (recordId: string) => {
      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
        await sleep(POLL_INTERVAL_MS);

        const nextProject = await loadProject();
        const nextRecord = nextProject?.records?.find((record) => record.id === recordId);

        if (hasFinishedProcessing(nextRecord)) {
          setPendingRecordIds((current) => current.filter((currentId) => currentId !== recordId));
          return;
        }
      }

      setPendingRecordIds((current) => current.filter((currentId) => currentId !== recordId));
    },
    [loadProject],
  );

  const handleVoiceFinish = async (blob: Blob) => {
    try {
      const record = await api.uploadAudio<VoiceRecord>(id, blob);
      setRecords((current) => [record, ...current]);
      setPendingRecordIds((current) => [record.id, ...current.filter((currentId) => currentId !== record.id)]);
      void pollForProcessedRecord(record.id);
    } catch (err) {
      console.error('Audio upload failed', err);
    }
  };

  if (!project) return (
    <div className="h-screen bg-background flex items-center justify-center font-mono text-muted-foreground animate-pulse">
      LOADING_PROJECT...
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="p-6 pb-4 border-b border-border/40 shrink-0 bg-card/30 backdrop-blur-md">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Button>
        </Link>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] uppercase font-black border-yellow-500/50 text-yellow-600 bg-yellow-500/5">
                {project.stage}
              </Badge>
              <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">{project.client}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mb-1">Started</div>
            <div className="text-sm font-medium flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              {new Date(project.startDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <Tabs defaultValue="task" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-4 shrink-0 bg-card/20">
          <TabsList className="bg-muted/50 p-1">
            {tabs.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="text-[10px] uppercase font-bold tracking-wider px-4">
                <t.icon className="mr-2 h-3 w-3" /> {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <main className="flex-1 overflow-y-auto no-scrollbar p-6">
          {pendingRecordIds.length > 0 && (
            <Card className="mb-4 border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
                <LoaderCircle className="h-4 w-4 animate-spin text-yellow-600" />
                <span>
                  {pendingRecordIds.length === 1
                    ? 'Processing latest recording...'
                    : `Processing ${pendingRecordIds.length} recordings...`}
                </span>
              </CardContent>
            </Card>
          )}

          {tabs.map((t) => (
            <TabsContent key={t.id} value={t.id} className="m-0 focus-visible:ring-0">
              <div className="grid gap-4 pb-32">
                {records
                  .filter((r) => r.extracted?.some((e) => e.category === t.id))
                  .map((r) => (
                    <Card key={r.id} className="border-border/40 bg-card/50 hover:bg-accent/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center text-[10px] text-muted-foreground font-mono uppercase">
                            <MessageSquare className="mr-2 h-3 w-3" />
                            TRANSCRIPT_LOG
                          </div>
                          <Badge variant="secondary" className="text-[9px] font-mono opacity-70">
                            {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Badge>
                        </div>
                        <Separator className="mb-3 opacity-20" />
                        <div className="space-y-3">
                          {r.extracted
                            ?.filter((e) => e.category === t.id)
                            .map((e) => (
                              <div key={e.id} className="flex items-start gap-3">
                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-yellow-500 shrink-0 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                                <div className="text-sm font-medium leading-relaxed italic text-foreground/90">
                                  "{formatExtractedContent(e)}"
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                {records.filter((r) => r.extracted?.some((e) => e.category === t.id)).length === 0 && (
                  <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-border/40 rounded-3xl text-center px-6">
                    <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <t.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                      No {t.label} recorded
                    </h3>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </main>
      </Tabs>

      {/* Fixed Voice Interface */}
      <section className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <PushToTalkButton onFinish={handleVoiceFinish} />
        </div>
      </section>
    </div>
  );
}
