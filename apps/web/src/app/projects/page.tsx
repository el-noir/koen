'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Folder, Calendar, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';
import { CreateProjectDto, Project, ProjectStage } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const PROJECT_STAGES: ProjectStage[] = ['foundations', 'framing', 'cladding', 'finishing'];

const DEFAULT_PROJECT_FORM: CreateProjectDto = {
  name: '',
  client: '',
  startDate: new Date().toISOString().split('T')[0],
  stage: 'framing',
};

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<CreateProjectDto>(DEFAULT_PROJECT_FORM);

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
    void load();
  }, []);

  async function handleCreateProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setCreateError(null);

    try {
      const project = await api.post<Project>('/projects', projectForm);
      setProjects((current) => [project, ...current]);
      setProjectForm(DEFAULT_PROJECT_FORM);
      setShowCreateForm(false);
      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error(error);
      setCreateError('Could not create the site yet. Check the API and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function openCreateForm() {
    setCreateError(null);
    setShowCreateForm(true);
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">KOEN</h1>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">Voice-First Site Notes</p>
        </div>
        <Button
          type="button"
          className="bg-yellow-400 font-bold text-black shadow-lg hover:bg-yellow-500"
          onClick={openCreateForm}
        >
          <Plus className="mr-2 h-4 w-4" /> NEW SITE
        </Button>
      </header>

      {showCreateForm && (
        <Card className="mb-8 border-yellow-500/30 bg-card/80 shadow-lg">
          <CardHeader>
            <CardTitle>Start a New Site</CardTitle>
            <CardDescription>
              Add the site first, then jump straight into voice capture.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateProject}>
              <label className="space-y-2">
                <span className="text-sm font-medium">Project name</span>
                <input
                  required
                  value={projectForm.name}
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none ring-offset-background transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                  placeholder="Bendigo Renovation"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">Client</span>
                <input
                  required
                  value={projectForm.client}
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, client: event.target.value }))
                  }
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none ring-offset-background transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                  placeholder="Alonso Avalos"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">Start date</span>
                <input
                  required
                  type="date"
                  value={projectForm.startDate}
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, startDate: event.target.value }))
                  }
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none ring-offset-background transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">Stage</span>
                <select
                  value={projectForm.stage}
                  onChange={(event) =>
                    setProjectForm((current) => ({
                      ...current,
                      stage: event.target.value as ProjectStage,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none ring-offset-background transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                >
                  {PROJECT_STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  {createError ?? 'Keep it light. You can refine site details later.'}
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setCreateError(null);
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-yellow-400 font-bold text-black hover:bg-yellow-500"
                    disabled={submitting}
                  >
                    {submitting ? 'Creating...' : 'Create Site'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/40 bg-card/50">
              <CardHeader>
                <Skeleton className="mb-2 h-4 w-1/3" />
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
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="group">
              <Card className="h-full border-border/40 bg-card/50 transition-all duration-300 hover:-translate-y-1 hover:bg-accent/50 hover:shadow-xl">
                <CardHeader>
                  <div className="mb-2 flex items-start justify-between">
                    <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/5 text-[10px] uppercase tracking-tighter text-yellow-500">
                      {project.stage}
                    </Badge>
                    <Folder className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-yellow-500" />
                  </div>
                  <CardTitle className="text-xl transition-colors group-hover:text-yellow-500">{project.name}</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                    {project.client}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex items-center justify-between pt-0 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-3 w-3" />
                    {new Date(project.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <ChevronRight className="h-4 w-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </CardFooter>
              </Card>
            </Link>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border px-6 py-20 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mb-1 text-lg font-semibold">No sites yet</h3>
              <p className="mb-6 max-w-[250px] text-sm text-muted-foreground">
                Add your first site to start capturing voice updates.
              </p>
              <Button
                type="button"
                variant="outline"
                className="border-yellow-500/50 font-bold text-yellow-500 hover:bg-yellow-500/10"
                onClick={openCreateForm}
              >
                CREATE FIRST SITE
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
