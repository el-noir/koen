'use client';

import React, { use, useEffect, useState } from 'react';
import { Mic, Calendar, MessageSquare, Briefcase, Package, Clock, Star, Info, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { api } from '../../../services/api';
import { Project, VoiceRecord } from '@koen/types';
import { PushToTalkButton } from '../../../components/PushToTalkButton/PushToTalkButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type ProjectWithRecords = Project & { records?: VoiceRecord[] };

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [records, setRecords] = useState<VoiceRecord[]>([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: Briefcase },
    { id: 'materials', label: 'Materials', icon: Package },
    { id: 'hours', label: 'Hours', icon: Clock },
    { id: 'events', label: 'Events', icon: Star },
    { id: 'notes', label: 'Notes', icon: Info },
  ];

  useEffect(() => {
    async function load() {
      try {
        const p = await api.fetch<ProjectWithRecords>(`/projects/${id}`);
        setProject(p);
        setRecords(p.records || []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [id]);

  const handleVoiceFinish = async (blob: Blob) => {
    try {
      const record = await api.uploadAudio<VoiceRecord>(id, blob);
      setRecords([record, ...records]);
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
      <Tabs defaultValue="tasks" className="flex-1 flex flex-col overflow-hidden" onValueChange={setActiveTab}>
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
                                  "{(e.content as any).description || (e.content as any).text}"
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
