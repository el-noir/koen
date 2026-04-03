'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Folder, Calendar, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';
import { Project } from '@koen/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.fetch<Project[]>('/projects');
        setProjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10">
      <header className="flex justify-between items-center mb-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">KOEN</h1>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">Construction Assistant</p>
        </div>
        <Button className="font-bold shadow-lg bg-yellow-400 hover:bg-yellow-500 text-black">
          <Plus className="mr-2 h-4 w-4" /> NEW PROJECT
        </Button>
      </header>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/40 bg-card/50">
              <CardHeader>
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-6 w-2/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`} className="group">
              <Card className="h-full border-border/40 bg-card/50 hover:bg-accent/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-tighter border-yellow-500/50 text-yellow-500 bg-yellow-500/5">
                      {p.stage}
                    </Badge>
                    <Folder className="h-4 w-4 text-muted-foreground group-hover:text-yellow-500 transition-colors" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-yellow-500 transition-colors">{p.name}</CardTitle>
                  <CardDescription className="uppercase text-[10px] font-bold tracking-widest opacity-70">
                    {p.client}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0 flex justify-between items-center text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-3 w-3" />
                    {new Date(p.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </CardFooter>
              </Card>
            </Link>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl text-center px-6">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No projects yet</h3>
              <p className="text-muted-foreground text-sm max-w-[250px] mb-6">
                Connect a site to start your first voice-captured log.
              </p>
              <Button variant="outline" className="font-bold border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10">
                CREATE FIRST PROJECT
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
