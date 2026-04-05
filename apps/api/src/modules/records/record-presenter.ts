type ConfirmableExtracted = {
  confirmed: boolean;
};

type RecordLike = {
  transcript: string;
  extracted?: ConfirmableExtracted[];
};

export function getRecordProcessingStatus(record: RecordLike) {
  if (!record.transcript.trim()) {
    return 'processing' as const;
  }

  if (record.extracted?.some((item) => !item.confirmed)) {
    return 'needs_confirmation' as const;
  }

  return 'processed' as const;
}

export function presentRecord<T extends RecordLike>(record: T) {
  return {
    ...record,
    processingStatus: getRecordProcessingStatus(record),
  };
}
