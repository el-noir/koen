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
    <header className="relative shrink-0 border-b border-primary/20 bg-background/40 p-4 sm:p-6 pb-6 backdrop-blur-xl z-10 glass-dark structural-corner">
      {/* Schematic Crosshairs */}
      <div className="absolute top-2 left-2 text-[10px] text-primary/30 font-mono">+</div>
      <div className="absolute top-2 right-2 text-[10px] text-primary/30 font-mono">+</div>
      
      <Link href="/projects">
        <motion.div
          whileHover={{ x: -2 }}
          className="inline-block"
        >
          <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="mr-1 h-3 w-3" /> [SYS.BACK_TO_LEDGER]
          </Button>
        </motion.div>
      </Link>
 
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex items-center gap-2">
              <div className={`led-pulse ${project.stage === 'foundations' ? 'led-blue' : project.stage === 'finishing' ? 'led-green' : 'led-amber'} h-2 w-2`} />
              <Badge variant="outline" className="border-primary/40 bg-primary/5 text-[9px] font-mono font-black uppercase tracking-[0.2em] text-primary">
                STG.{project.stage.slice(0, 3)} // {project.stage.toUpperCase()}
              </Badge>
            </div>
            <div className="hidden sm:block h-1 w-1 rounded-full bg-muted-foreground/30" />
            <span className="text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-[0.25em] text-muted-foreground/40">
              UNIT.ID_{project.client.replace(/\s+/g, '_').toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">{project.name}</h1>
        </div>
 
        <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-primary/10 pt-4 sm:border-none sm:pt-0">
          <ThemeToggle />
          <div className="flex flex-col items-end text-right sm:border-l sm:border-primary/10 sm:pl-6 h-10 justify-center">
            <div className="mb-1 text-[8px] sm:text-[9px] font-mono font-black uppercase tracking-[0.25em] text-primary/40">
              [SCHED.BASELINE_EST]
            </div>
            <div className="flex items-center text-xs font-mono font-bold text-foreground tracking-tight">
              <Calendar className="mr-2 h-3.5 w-3.5 text-primary opacity-50" />
              {new Date(project.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
