import React, { useState, useEffect } from 'react';
import { Invitation, UserRole, InvitationStatus } from '@/types';
import { api } from '@/services/api';
import { XCircle, Mail, User as UserIcon, Clock, CheckCircle } from 'lucide-react';

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
      await fetchInvites();
      onRefresh?.();
    } catch (err) {
      console.error('Failed to revoke invite', err);
      alert('Could not revoke invitation. Try again.');
    } finally {
      setRevokingId(null);
    }
  };

  if (isLoading) return <div className="animate-pulse text-xs font-mono text-muted-foreground">LOADING_INVITES...</div>;
  if (invites.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
        <Mail className="h-3 w-3" />
        Pending Invitations
      </h3>
      
      <div className="space-y-2">
        {invites.filter(inv => inv.status === InvitationStatus.PENDING).map((invite) => (
          <div 
            key={invite.id} 
            className="flex items-center justify-between group rounded-lg border border-border/50 bg-muted/30 p-3 transition-all hover:border-border hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border shadow-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{invite.email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">
                    {invite.role}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Exp: {new Date(invite.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleRevoke(invite.id)}
              disabled={revokingId === invite.id}
              className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-all rounded-md hover:bg-destructive/10 disabled:opacity-50"
              title="Revoke Invitation"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
