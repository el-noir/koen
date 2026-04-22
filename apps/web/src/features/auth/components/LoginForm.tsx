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
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0a0a0a] p-4 font-sans">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[50%] w-[50%] rounded-full bg-[#ffd60a]/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[50%] w-[50%] rounded-full bg-[#ffd60a]/5 blur-[120px]" />
      </div>

      <Card className="relative w-full max-w-md overflow-hidden border-border/40 bg-card/60 backdrop-blur-xl">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-[#ffd60a] to-transparent" />
        
        <CardHeader className="pt-8 pb-4 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ffd60a]">
            <Construction className="h-6 w-6 text-black" strokeWidth={2.5} />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">Welcome back</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your credentials to access your site data.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm font-medium text-red-500">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-[#ffd60a]" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="h-12 w-full rounded-xl border border-border/30 bg-background/50 pl-10 pr-4 text-sm transition-all focus:border-[#ffd60a]/50 focus:outline-none focus:ring-4 focus:ring-[#ffd60a]/10 placeholder:text-muted-foreground/30"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-[#ffd60a]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="h-12 w-full rounded-xl border border-border/30 bg-background/50 pl-10 pr-4 text-sm transition-all focus:border-[#ffd60a]/50 focus:outline-none focus:ring-4 focus:ring-[#ffd60a]/10 placeholder:text-muted-foreground/30"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 pb-8 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-xl bg-[#ffd60a] font-bold text-black hover:bg-[#ffd60a]/90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Sign In'
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground/60">
              Registration is by invitation only. Contact your site admin to request access.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
