import { Badge } from '@/components/ui/badge';

import { EditableDraft, PendingConfirmation } from '../project-detail.types';
import { ConfirmationCard } from './ConfirmationCard';

type Props = {
  cancelEditing: () => void;
  confirmations: PendingConfirmation[];
  drafts: Record<string, EditableDraft>;
  editingItemId: string | null;
  saveConfirmation: (item: PendingConfirmation['item'], options?: { useDraft?: boolean }) => Promise<void>;
  savingItemIds: string[];
  startEditing: (item: PendingConfirmation['item']) => void;
  updateDraftValue: (itemId: string, field: keyof EditableDraft, value: string) => void;
};

export function PendingReviewsSection({
  cancelEditing,
  confirmations,
  drafts,
  editingItemId,
  saveConfirmation,
  savingItemIds,
  startEditing,
  updateDraftValue,
}: Props) {
  if (confirmations.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
            Older Notes To Review
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The latest note is above. These older notes still need attention.
          </p>
        </div>
        <Badge variant="outline" className="border-yellow-500/40 bg-yellow-500/5 text-yellow-600">
          {confirmations.length} open
        </Badge>
      </div>

      <div className="space-y-3">
        {confirmations.map((confirmation) => (
          <ConfirmationCard
            key={confirmation.item.id}
            cancelEditing={cancelEditing}
            compact
            confirmation={confirmation}
            drafts={drafts}
            editingItemId={editingItemId}
            saveConfirmation={saveConfirmation}
            savingItemIds={savingItemIds}
            startEditing={startEditing}
            updateDraftValue={updateDraftValue}
          />
        ))}
      </div>
    </section>
  );
}
