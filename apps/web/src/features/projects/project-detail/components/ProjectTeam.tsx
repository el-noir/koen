import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, X, Shield, ShieldCheck } from 'lucide-react';
import { Project, UserRole } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import { useAuth } from '@/lib/auth-context';
import { ProjectInvites } from './ProjectInvites';

interface ProjectTeamProps {
  project: Project;
  onRefresh: () => void;
}

export function ProjectTeam({ project, onRefresh }: ProjectTeamProps) {
  const { user: currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = currentUser?.id === project.userId;
  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const canManage = isOwner || isAdmin;

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    const targetEmail = email;
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/projects/${project.id}/members`, { email });
      setEmail('');
      toast.success('Personnel Deployed', {
        description: `Invitation dispatched to ${targetEmail}.`,
      });
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not add member. Make sure the email is correct.');
      toast.error('Deployment Failed', {
        description: err.message || 'Ensure the email address is valid.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemoveMember(memberUserId: string) {
    if (!window.confirm('Remove this member from the project?')) return;

    try {
      await api.delete(`/projects/${project.id}/members/${memberUserId}`);
      toast.success('Access Revoked', {
        description: 'Personnel has been removed from this site.',
      });
      onRefresh();
    } catch (err: any) {
      console.error(err);
      toast.error('Revocation Failed', {
        description: err.message || 'Could not remove member at this time.',
      });
    }
  }

  return (
    <Card className="glass-dark border-primary/20 industrial-shadow">
      <CardHeader className="pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
            <CardTitle className="text-xl font-bold">Site Team</CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono tracking-widest bg-primary/5 text-primary border-primary/20">
            {project.members?.length || 0} MEMBERS
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground/60">
          {canManage 
            ? 'Administrator view: Manage site access and site permissions.' 
            : 'Access restricted: Viewing authorized site personnel.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Member List */}
        <div className="space-y-3">
          {/* Owner */}
          <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4 border border-white/5 industrial-shadow">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary gold-glow">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-wider">Site Owner</p>
                <p className="text-[10px] font-mono text-primary/60 uppercase tracking-widest">Master Baseline Authority</p>
              </div>
            </div>
            <Badge className="bg-primary text-black font-black text-[9px] tracking-widest gold-glow">OWNER</Badge>
          </div>

          {/* Members */}
          {project.members?.map((member, idx) => (
            <div key={member.id || `mem-${idx}`} className="flex items-center justify-between rounded-2xl border border-white/5 bg-background/40 p-4 transition-all hover:bg-white/5 hover:border-primary/20 group">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/30 text-muted-foreground group-hover:text-primary transition-colors">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold group-hover:text-foreground transition-colors">{member.user?.name || 'Loading...'}</p>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest opacity-60">{member.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-[9px] font-black tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">WORKER</Badge>
                {canManage && (
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {(!project.members || project.members.length === 0) && (
            <div className="py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
              <p className="text-[10px] uppercase font-mono tracking-[0.2em] text-muted-foreground/40">
                Single operator deployment.
              </p>
            </div>
          )}
        </div>

        {/* Pending Invites (Admin Only) */}
        {canManage && (
          <div className="pt-2">
            <ProjectInvites projectId={project.id} onRefresh={onRefresh} />
          </div>
        )}

        {/* Invite Form */}
        {canManage && (
          <form onSubmit={handleAddMember} className="pt-4 border-t border-white/10">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/70 ml-1">
                Deploy Site Personnel
              </label>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@koen.app"
                  className="h-12 flex-1 rounded-xl border border-white/10 bg-background/50 px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={submitting} 
                  className="bg-primary font-black text-black hover:bg-primary/90 h-12 px-6 rounded-xl gold-glow"
                >
                  {submitting ? '...' : <UserPlus className="h-5 w-5" />}
                </Button>
              </div>
              <AnimatePresence>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-bold text-destructive uppercase tracking-wider ml-1"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
