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
    <div className="flex min-h-[100dvh] items-center justify-center bg-background p-4 font-mono">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[50%] w-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[50%] w-[50%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <Card className="relative w-full max-w-md overflow-hidden glass-dark border-primary/20 industrial-shadow">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
        
        <CardHeader className="pt-8 pb-4 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary gold-glow">
            <CheckCircle2 className="h-6 w-6 text-black" strokeWidth={2.5} />
          </div>
          <CardTitle className="text-2xl font-black uppercase tracking-tight text-white">Accept Invitation</CardTitle>
          <CardDescription className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest pt-1">
            {invitation?.isExistingUser 
              ? 'Account Verification Successful'
              : 'Deploy Site Operative Credentials'}
          </CardDescription>
        </CardHeader>
        
        {invitation?.isExistingUser ? (
          <CardContent className="space-y-6 pt-4 text-center">
             <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-primary/10 bg-primary/5">
                <p className="text-[10px] font-black text-primary uppercase tracking-wider">Account Recognized</p>
                <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-[0.15em] leading-relaxed">
                  Active Operative detected. Joining this site will add its telemetry to your secure ledger.
                </p>
             </div>
             <Button
                onClick={() => router.push('/login')}
                className="h-14 w-full rounded-xl bg-primary font-black text-black hover:bg-primary/90 gold-glow uppercase tracking-widest"
              >
                Enter System
              </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-4">
            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-center text-[10px] font-black uppercase tracking-wider text-destructive">
                {error}
              </div>
            )}
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Personnel Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
                <input
                  type="text"
                  required
                  placeholder="MUDASIR SHAH"
                  className="h-12 w-full rounded-xl border border-white/5 bg-background/40 pl-12 pr-4 text-sm font-mono transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/20"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">New Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="h-12 w-full rounded-xl border border-white/5 bg-background/40 pl-12 pr-4 text-sm font-mono transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Verify Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="h-12 w-full rounded-xl border border-white/5 bg-background/40 pl-12 pr-4 text-sm font-mono transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/20"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-6 pb-10 pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="h-14 w-full rounded-xl bg-primary font-black text-black hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 gold-glow uppercase tracking-widest"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                'Finalize Deployment'
              )}
            </Button>
            <div className="text-center space-y-2">
              <p className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-[0.2em] leading-relaxed">
                Already have an operative account?<br />
                <span onClick={() => router.push('/login')} className="text-primary font-black cursor-pointer hover:underline underline-offset-4">Sign In to join team</span>
              </p>
            </div>
          </CardFooter>
        </form>
        )}
      </Card>
    </div>
  );
}
