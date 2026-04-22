'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, User, Lock, Construction, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/auth';
import { api } from '@/services/api';

export function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [invitation, setInvitation] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided');
      setIsValidating(false);
      return;
    }

    async function checkToken() {
      try {
        const data = await api.fetch(`/invitations/${token}`);
        setInvitation(data);
      } catch (err: any) {
        setError(err.message || 'Invalid or expired invitation');
      } finally {
        setIsValidating(false);
      }
    }

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!token) throw new Error('Token is missing');
      await authService.signup(token, name, password);
      router.push('/projects');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to complete registration');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="h-8 w-8 animate-spin text-[#ffd60a]" />
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#0a0a0a] p-4 text-center">
        <Card className="max-w-md border-red-500/20 bg-red-500/5 backdrop-blur-xl">
          <CardHeader>
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <CardTitle className="mt-4 text-white">Invalid Link</CardTitle>
            <CardDescription className="text-muted-foreground">
              {error}. Please contact your site admin for a new invite.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push('/login')} variant="outline" className="w-full rounded-xl">
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0a0a0a] p-4 font-sans">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[50%] w-[50%] rounded-full bg-[#ffd60a]/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[50%] w-[50%] rounded-full bg-[#ffd60a]/5 blur-[120px]" />
      </div>

      <Card className="relative w-full max-w-md overflow-hidden border-border/40 bg-card/60 backdrop-blur-xl">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
        
        <CardHeader className="pt-8 pb-4 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500">
            <CheckCircle2 className="h-6 w-6 text-black" strokeWidth={2.5} />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">Accept Invitation</CardTitle>
          <CardDescription className="text-muted-foreground">
            {invitation?.isExistingUser 
              ? 'Your account has been verified. Accept the invitation to join the site ledger.'
              : `Complete your profile to join the team on ${invitation?.email}`}
          </CardDescription>
        </CardHeader>
        
        {invitation?.isExistingUser ? (
          <CardContent className="space-y-6 pt-4 text-center">
             <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-emerald-500/10 bg-emerald-500/5">
                <p className="text-sm font-medium text-emerald-400">Account Recognized</p>
                <p className="text-xs text-muted-foreground/60 leading-relaxed">
                  You are already a KOEN operative. Joining this site will add its telemetry to your dashboard.
                </p>
             </div>
             <Button
                onClick={() => router.push('/login')}
                className="h-12 w-full rounded-xl bg-emerald-500 font-bold text-black hover:bg-emerald-500/90"
              >
                Sign In to Accept & Join Team
              </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm font-medium text-red-500">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-emerald-500" />
                <input
                  type="text"
                  required
                  placeholder="Mudasir Shah"
                  className="h-12 w-full rounded-xl border border-border/30 bg-background/50 pl-10 pr-4 text-sm transition-all focus:border-emerald-500/50 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder:text-muted-foreground/30"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Create Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-emerald-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="h-12 w-full rounded-xl border border-border/30 bg-background/50 pl-10 pr-4 text-sm transition-all focus:border-emerald-500/50 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder:text-muted-foreground/30"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-emerald-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="h-12 w-full rounded-xl border border-border/30 bg-background/50 pl-10 pr-4 text-sm transition-all focus:border-emerald-500/50 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder:text-muted-foreground/30"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 pb-8 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-xl bg-emerald-500 font-bold text-black hover:bg-emerald-500/90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Accept & Join Team'
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground/60">
              Already have an account? <span onClick={() => router.push('/login')} className="text-emerald-500 font-medium cursor-pointer hover:underline underline-offset-4">Sign in instead</span>
            </p>
          </CardFooter>
        </form>
        )}
      </Card>
    </div>
  );
}
