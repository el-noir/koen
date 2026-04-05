'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

type TabsContextValue = {
  activeValue: string;
  setActiveValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error('Tabs components must be used within <Tabs>.');
  }

  return context;
}

function Tabs({
  className,
  defaultValue,
  value,
  onValueChange,
  ...props
}: React.ComponentProps<'div'> & {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const activeValue = value ?? internalValue;

  const setActiveValue = React.useCallback((nextValue: string) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  }, [onValueChange, value]);

  return (
    <TabsContext.Provider value={{ activeValue, setActiveValue }}>
      <div data-slot="tabs" className={cn('flex gap-2 flex-col', className)} {...props} />
    </TabsContext.Provider>
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="tabs-list"
      className={cn('inline-flex w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground', className)}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  value,
  onClick,
  ...props
}: React.ComponentProps<'button'> & {
  value: string;
}) {
  const { activeValue, setActiveValue } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      data-slot="tabs-trigger"
      data-state={isActive ? 'active' : 'inactive'}
      className={cn(
        'relative inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-all hover:text-foreground focus-visible:ring-2 focus-visible:ring-yellow-500/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
        isActive ? 'bg-background text-foreground shadow-sm' : 'text-foreground/60',
        className,
      )}
      onClick={(event) => {
        setActiveValue(value);
        onClick?.(event);
      }}
      {...props}
    />
  );
}

function TabsContent({
  className,
  value,
  ...props
}: React.ComponentProps<'div'> & {
  value: string;
}) {
  const { activeValue } = useTabsContext();

  if (activeValue !== value) {
    return null;
  }

  return (
    <div
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
