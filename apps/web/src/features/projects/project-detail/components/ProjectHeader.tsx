import { Calendar, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';

type Props = {
  project: Project;
};

export function ProjectHeader({ project }: Props) {
  return (
    <header className="shrink-0 border-b border-white/5 bg-background/40 p-6 pb-6 backdrop-blur-xl z-10 glass-dark">
      <Link href="/projects">
        <motion.div
          whileHover={{ x: -2 }}
          className="inline-block"
        >
          <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="mr-1 h-3 w-3" /> Back to Site Ledger
          </Button>
        </motion.div>
      </Link>

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary/40 bg-primary/5 text-[9px] font-black uppercase tracking-[0.2em] text-primary">
              SITE STAGE: {project.stage}
            </Badge>
            <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">
              {project.client}
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">{project.name}</h1>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex flex-col items-end text-right">
            <div className="mb-1 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/40">
              BASELINE EST.
            </div>
            <div className="flex items-center text-xs font-mono font-bold text-foreground">
              <Calendar className="mr-2 h-3.5 w-3.5 text-primary opacity-70" />
              {new Date(project.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
