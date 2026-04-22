'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Folder, Calendar, ChevronRight, LogOut, User as UserIcon, LoaderCircle } from 'lucide-react';
import { api } from '../../services/api';
import { CreateProjectDto, Project, ProjectStage } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth-context';
import { ThemeToggle } from '@/components/ThemeToggle';

const PROJECT_STAGES: ProjectStage[] = ['foundations', 'framing', 'cladding', 'finishing'];

const DEFAULT_PROJECT_FORM: CreateProjectDto = {
  name: '',
  client: '',
  startDate: new Date().toISOString().split('T')[0],
  stage: 'framing',
};

export default function ProjectsPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<CreateProjectDto>(DEFAULT_PROJECT_FORM);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const data = await api.fetch<Project[]>('/projects');
        setProjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (!isLoading) {
      void load();
    }
  }, [user, isLoading]);

  async function handleCreateProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setCreateError(null);

    const siteName = projectForm.name;

    try {
      const project = await api.post<Project>('/projects', projectForm);
      setProjects((current) => [project, ...current]);
      setProjectForm(DEFAULT_PROJECT_FORM);
      setShowCreateForm(false);
      
      toast.success('Site Initialized', {
        description: `${siteName} has been deployed to the site ledger.`,
      });
      
      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error(error);
      setCreateError('Could not create the site yet. Check the API and try again.');
      toast.error('Initialization Failed', {
        description: 'Check site parameters and try again.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  function openCreateForm() {
    setCreateError(null);
    setShowCreateForm(true);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoaderCircle className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10">
      <header className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-black shadow-lg gold-glow"
          >
            <UserIcon className="h-7 w-7" />
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Hi, {user?.name.split(' ')[0]}</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-60">KOEN SITE ASSISTANT // {user?.role}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-xl border border-border/40 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
            onClick={logout}
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
          {user?.role === 'ADMIN' && (
            <Button
              type="button"
              className="bg-primary h-12 px-6 font-bold text-black shadow-lg hover:bg-primary/90 rounded-xl gold-glow border-none"
              onClick={openCreateForm}
            >
              <Plus className="mr-2 h-5 w-5" /> NEW SITE
            </Button>
          )}
        </div>
      </header>

      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            className="overflow-hidden mb-12"
          >
            <Card className="glass-dark border-primary/20 industrial-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Initialize New Site</CardTitle>
                <CardDescription className="text-muted-foreground/70">
                  Define the site baseline before deploying workers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-6 md:grid-cols-2" onSubmit={handleCreateProject}>
                  <label className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Project name</span>
                    <input
                      required
                      value={projectForm.name}
                      onChange={(event) =>
                        setProjectForm((current) => ({ ...current, name: event.target.value }))
                      }
                      className="h-12 w-full rounded-xl border border-border/40 bg-background/50 px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Bendigo Renovation"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Client</span>
                    <input
                      required
                      value={projectForm.client}
                      onChange={(event) =>
                        setProjectForm((current) => ({ ...current, client: event.target.value }))
                      }
                      className="h-12 w-full rounded-xl border border-border/40 bg-background/50 px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Alonso Avalos"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Start date</span>
                    <input
                      required
                      type="date"
                      value={projectForm.startDate}
                      onChange={(event) =>
                        setProjectForm((current) => ({ ...current, startDate: event.target.value }))
                      }
                      className="h-12 w-full rounded-xl border border-border/40 bg-background/50 px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Stage</span>
                    <select
                      value={projectForm.stage}
                      onChange={(event) =>
                        setProjectForm((current) => ({
                          ...current,
                          stage: event.target.value as ProjectStage,
                        }))
                      }
                      className="h-12 w-full rounded-xl border border-border/40 bg-background/50 px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none"
                    >
                      {PROJECT_STAGES.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="md:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground/60">
                      {createError ?? 'Baseline confirmation required'}
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-xl px-6"
                        onClick={() => {
                          setShowCreateForm(false);
                          setCreateError(null);
                        }}
                        disabled={submitting}
                      >
                        CANCEL
                      </Button>
                      <Button
                        type="submit"
                        className="bg-primary px-8 font-bold text-black hover:bg-primary/90 rounded-xl gold-glow"
                        disabled={submitting}
                      >
                        {submitting ? 'INITIALIZING...' : 'START SITE'}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-3xl bg-card/40 animate-pulse border border-border/40" />
          ))}
        </div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.08 } }
          }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {projects.map((project, idx) => (
            <motion.div
              key={project.id || `proj-${idx}`}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <Link href={`/projects/${project.id}`} className="group block">
                <Card className="h-full border-border/40 bg-card/30 glass-dark transition-all duration-300 hover:border-primary/40 hover:-translate-y-1.5 hover:shadow-2xl hover:bg-card/50 industrial-shadow group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-0 bg-primary group-hover:h-full transition-all duration-500" />
                  
                  <CardHeader className="pb-4">
                    <div className="mb-4 flex items-start justify-between">
                      <Badge variant="outline" className="border-primary/40 bg-primary/5 text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                        {project.stage}
                      </Badge>
                      <Folder className="h-4 w-4 text-muted-foreground/40 transition-colors group-hover:text-primary/70" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight transition-colors group-hover:text-foreground">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">
                      {project.client}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardFooter className="flex items-center justify-between pt-0 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(project.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <ChevronRight className="h-4 w-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 text-primary" />
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          ))}
          
          {projects.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="col-span-full flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-border/40 px-6 py-24 text-center bg-card/20"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground/30">
                <Plus className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-bold">No active sites</h3>
              <p className="mb-8 max-w-[280px] text-sm text-muted-foreground/60 leading-relaxed">
                Your industrial site ledger is empty. Initialize your first project to begin capture.
              </p>
              <Button
                type="button"
                variant="outline"
                className="border-primary/40 h-12 px-8 font-bold text-primary hover:bg-primary hover:text-black rounded-xl transition-all"
                onClick={openCreateForm}
              >
                INITIALIZE FIRST SITE
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
