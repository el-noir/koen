import { Check, LoaderCircle, Pencil, Save } from 'lucide-react';

import { ExtractedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import { EditableDraft, PendingConfirmation } from '../project-detail.types';
import { formatCategoryLabel, formatExtractedContent, getEditableDraft } from '../project-detail.utils';

type Props = {
  cancelEditing: () => void;
  confirmation: PendingConfirmation;
  compact?: boolean;
  drafts: Record<string, EditableDraft>;
  editingItemId: string | null;
  saveConfirmation: (item: ExtractedData, options?: { useDraft?: boolean }) => Promise<void>;
  savingItemIds: string[];
  startEditing: (item: ExtractedData) => void;
  updateDraftValue: (itemId: string, field: keyof EditableDraft, value: string) => void;
};

export function ConfirmationCard({
  cancelEditing,
  confirmation,
  compact,
  drafts,
  editingItemId,
  saveConfirmation,
  savingItemIds,
  startEditing,
  updateDraftValue,
}: Props) {
  const { item, transcript } = confirmation;
  const isEditing = editingItemId === item.id;
  const isSaving = savingItemIds.includes(item.id);
  const draft = drafts[item.id] || getEditableDraft(item);

  return (
    <Card className="border-yellow-500/40 bg-card/80 shadow-sm">
      <CardContent className="p-4">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/5 text-[10px] uppercase tracking-widest text-yellow-600">
              {compact ? `Review ${formatCategoryLabel(item.category)}` : `Confirm ${formatCategoryLabel(item.category)}`}
            </Badge>
            <div className="text-sm font-medium text-foreground">
              {formatExtractedContent(item)}
            </div>
            {transcript && (
              <p className="text-xs leading-relaxed text-muted-foreground">
                Heard in recording: &ldquo;{transcript}&rdquo;
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              size="sm"
              className="bg-yellow-400 font-semibold text-black hover:bg-yellow-500"
              disabled={isSaving}
              onClick={() => void saveConfirmation(item)}
            >
              {isSaving ? <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-2 h-3.5 w-3.5" />}
              Looks right
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isSaving}
              onClick={() => startEditing(item)}
            >
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit
            </Button>
          </div>
        </div>

        {isEditing && (
          <div className="space-y-3 rounded-2xl border border-border/60 bg-background/60 p-3">
            {(item.category === 'task' || item.category === 'material' || item.category === 'event') && (
              <input
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
                placeholder="Description"
                value={draft.description}
                onChange={(event) => updateDraftValue(item.id, 'description', event.target.value)}
              />
            )}

            {item.category === 'note' && (
              <textarea
                className="min-h-20 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
                placeholder="Note"
                value={draft.text}
                onChange={(event) => updateDraftValue(item.id, 'text', event.target.value)}
              />
            )}

            {item.category === 'task' && (
              <input
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
                placeholder="Location"
                value={draft.location}
                onChange={(event) => updateDraftValue(item.id, 'location', event.target.value)}
              />
            )}

            {item.category === 'material' && (
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
                  placeholder="Quantity"
                  value={draft.quantity}
                  onChange={(event) => updateDraftValue(item.id, 'quantity', event.target.value)}
                />
                <input
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
                  placeholder="Unit"
                  value={draft.unit}
                  onChange={(event) => updateDraftValue(item.id, 'unit', event.target.value)}
                />
                <input
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
                  placeholder="Supplier"
                  value={draft.supplier}
                  onChange={(event) => updateDraftValue(item.id, 'supplier', event.target.value)}
                />
              </div>
            )}

            {item.category === 'event' && (
              <input
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
                placeholder="Date or timing"
                value={draft.date}
                onChange={(event) => updateDraftValue(item.id, 'date', event.target.value)}
              />
            )}

            {item.category === 'hours' && (
              <>
                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
                    placeholder="Start"
                    value={draft.start}
                    onChange={(event) => updateDraftValue(item.id, 'start', event.target.value)}
                  />
                  <input
                    className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
                    placeholder="End"
                    value={draft.end}
                    onChange={(event) => updateDraftValue(item.id, 'end', event.target.value)}
                  />
                  <input
                    className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
                    placeholder="Workers"
                    value={draft.workers}
                    onChange={(event) => updateDraftValue(item.id, 'workers', event.target.value)}
                  />
                </div>
                <input
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
                  placeholder="Notes"
                  value={draft.notes}
                  onChange={(event) => updateDraftValue(item.id, 'notes', event.target.value)}
                />
              </>
            )}

            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={isSaving}
                onClick={cancelEditing}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-yellow-400 font-semibold text-black hover:bg-yellow-500"
                disabled={isSaving}
                onClick={() => void saveConfirmation(item, { useDraft: true })}
              >
                {isSaving ? <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-2 h-3.5 w-3.5" />}
                Save
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
