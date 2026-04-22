import React, { useState } from 'react';
import { Users, UserPlus, X, Shield, ShieldCheck } from 'lucide-react';
import { Project, UserRole } from '@/types';
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

    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/projects/${project.id}/members`, { email });
      setEmail('');
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not add member. Make sure the email is correct.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemoveMember(memberUserId: string) {
    if (!window.confirm('Remove this member from the project?')) return;

    try {
      await api.delete(`/projects/${project.id}/members/${memberUserId}`);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      alert('Failed to remove member');
    }
  }

  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-yellow-500" />
            <CardTitle className="text-lg">Site Team</CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {project.members?.length || 0} MEMBERS
          </Badge>
        </div>
        <CardDescription>
          {canManage
            ? 'Manage who can capture and view site updates.'
            : 'Other workers assigned to this site.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Member List */}
        <div className="space-y-3">
          {/* Owner */}
          <div className="flex items-center justify-between rounded-xl bg-accent/20 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/20 text-yellow-500">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold">Project Owner</p>
                <p className="text-[10px] text-muted-foreground uppercase opacity-70">Creator</p>
              </div>
            </div>
            <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">OWNER</Badge>
          </div>

          {/* Members */}
          {project.members?.map((member) => (
            <div key={member.id} className="flex items-center justify-between rounded-xl border border-border/40 p-3 transition-colors hover:bg-accent/10">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{member.user?.name || 'Loading...'}</p>
                  <p className="text-[10px] text-muted-foreground">{member.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] opacity-70">MEMBER</Badge>
                {canManage && (
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {(!project.members || project.members.length === 0) && (
            <p className="py-4 text-center text-xs text-muted-foreground italic">
              No additional workers assigned yet.
            </p>
          )}
        </div>

        {/* Pending Invites (Admin Only) */}
        {canManage && (
          <div className="pt-2 border-t border-border/40">
            <ProjectInvites projectId={project.id} onRefresh={onRefresh} />
          </div>
        )}

        {/* Invite Form */}
        {canManage && (
          <form onSubmit={handleAddMember} className="pt-2">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Invite Colleague
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@koen.app"
                  className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-yellow-500/20"
                  required
                />
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-yellow-400 font-bold text-black hover:bg-yellow-500 h-10 px-4"
                >
                  {submitting ? '...' : <UserPlus className="h-4 w-4" />}
                </Button>
              </div>
              {error && <p className="text-[10px] text-red-500 ml-1">{error}</p>}
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
