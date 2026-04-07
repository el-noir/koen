import { Calendar, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

import { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Props = {
  project: Project;
};

export function ProjectHeader({ project }: Props) {
  return (
    <header className="shrink-0 border-b border-border/40 bg-card/30 p-6 pb-4 backdrop-blur-md">
      <Link href="/projects">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Sites
        </Button>
      </Link>

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/5 text-[10px] font-black uppercase text-yellow-600">
              {project.stage}
            </Badge>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {project.client}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
        </div>

        <div className="flex flex-col items-end text-right">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Started
          </div>
          <div className="flex items-center text-sm font-medium">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            {new Date(project.startDate).toLocaleDateString()}
          </div>
        </div>
      </div>
    </header>
  );
}
