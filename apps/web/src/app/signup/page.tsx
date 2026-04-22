import { Suspense } from 'react';
import { AcceptInviteForm } from '@/features/auth/components/AcceptInviteForm';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="h-8 w-8 animate-spin text-[#ffd60a]" />
      </div>
    }>
      <AcceptInviteForm />
    </Suspense>
  );
}
