import * as React from 'react';

import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  destructive: 'border-transparent bg-destructive text-white',
  outline: 'border-border text-foreground',
  ghost: 'border-transparent text-foreground',
  link: 'border-transparent text-primary underline-offset-4 hover:underline',
};

function Badge({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'span'> & {
  variant?: BadgeVariant;
}) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(
        'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors [&>svg]:pointer-events-none [&>svg]:size-3',
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
