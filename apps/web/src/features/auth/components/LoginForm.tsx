'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Lock, Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/auth';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authService.login(email, password);
      router.push('/projects');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

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
            <Construction className="h-6 w-6 text-black" strokeWidth={2.5} />
          </div>
          <CardTitle className="text-2xl font-black uppercase tracking-tight text-white">Site Access</CardTitle>
          <CardDescription className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest pt-1">
            Authorize Personnel Credentials
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-4">
            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-center text-[10px] font-black uppercase tracking-wider text-destructive">
                {error}
              </div>
            )}
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Personnel ID (Email)</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-primary" />
                <input
                  type="email"
                  required
                  placeholder="ID@KOEN.APP"
                  className="h-12 w-full rounded-xl border border-white/5 bg-background/40 pl-12 pr-4 text-sm font-mono transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Security Access Key</label>
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
                'Initialize Session'
              )}
            </Button>
            <div className="text-center space-y-2">
              <p className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-[0.2em] leading-relaxed">
                Registration restricted to authorized site personnel.<br />
                Contact Master Admin for deployment.
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
