import React, { useState, useEffect } from 'react';
import { Invitation, UserRole, InvitationStatus } from '@/types';
import { api } from '@/services/api';
import { XCircle, Mail, User as UserIcon, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectInvitesProps {
  projectId: string;
  onRefresh?: () => void;
}

export function ProjectInvites({ projectId, onRefresh }: ProjectInvitesProps) {
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchInvites = async () => {
    try {
      const data = await api.fetchInvitations(projectId);
      setInvites(data);
    } catch (err) {
      console.error('Failed to fetch invites', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, [projectId]);

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke this invitation?')) return;
    
    setRevokingId(id);
    try {
      await api.revokeInvitation(id);
      toast.success('Invitation Revoked', {
        description: 'Site access invitation has been invalidated.',
      });
      await fetchInvites();
      onRefresh?.();
    } catch (err) {
      console.error('Failed to revoke invite', err);
      toast.error('Revocation Failed', {
        description: 'Could not revoke invitation. Try again.',
      });
    } finally {
      setRevokingId(null);
    }
  };

  if (isLoading) return <div className="animate-pulse text-xs font-mono text-muted-foreground">LOADING_INVITES...</div>;
  if (invites.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2 ml-1">
        <Mail className="h-3 w-3" />
        Personnel Deployment Queue
      </h3>
      
      <div className="space-y-3">
        {invites.filter(inv => inv.status === InvitationStatus.PENDING).map((invite) => (
          <div 
            key={invite.id} 
            className="flex items-center justify-between group rounded-xl border border-primary/10 bg-primary/5 p-4 transition-all hover:border-primary/30 hover:bg-primary/10"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-primary/20 gold-glow">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-black tracking-tight text-white">{invite.email}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[9px] font-mono font-bold uppercase text-primary/80 bg-primary/10 px-2 py-0.5 rounded border border-primary/20 tracking-widest">
                    {invite.role}
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground/40 flex items-center gap-1 uppercase tracking-widest">
                    <Clock className="h-3 w-3" />
                    Exp: {new Date(invite.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleRevoke(invite.id)}
              disabled={revokingId === invite.id}
              className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground/40 hover:text-destructive transition-all rounded-xl hover:bg-destructive/10 disabled:opacity-50"
              title="Revoke Invitation"
            >
              {revokingId === invite.id ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
