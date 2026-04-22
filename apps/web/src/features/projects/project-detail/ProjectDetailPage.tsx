'use client';

import React, { use } from 'react';

import { PushToTalkButton } from '@/components/PushToTalkButton/PushToTalkButton';

import { CategoryViewsSection } from './components/CategoryViewsSection';
import { LatestNoteSection } from './components/LatestNoteSection';
import { PendingReviewsSection } from './components/PendingReviewsSection';
import { ProjectHeader } from './components/ProjectHeader';
import { ProjectLoadErrorState } from './components/ProjectLoadErrorState';
import { ProjectStatusSection } from './components/ProjectStatusSection';
import { ProjectTeam } from './components/ProjectTeam';
import { RecentHistorySection } from './components/RecentHistorySection';
import { useProjectDetail } from './hooks/useProjectDetail';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    cancelEditing,
    categoryRecords,
    drafts,
    editingItemId,
    expandedHistoryRecordIds,
    handleVoiceFinish,
    historyRecords,
    isLoadingProject,
    isOffline,
    isSyncingQueue,
    latestCapture,
    latestCaptureRecord,
    pendingRecordIds,
    primaryRecord,
    primaryRecordConfirmations,
    project,
    projectLoadError,
    queuedCount,
    retryProjectLoad,
    saveConfirmation,
    savingItemIds,
    secondaryPendingConfirmations,
    shouldShowStatusNotice,
    sortedRecords,
    startEditing,
    statusNotice,
    toggleHistoryRecord,
    updateDraftValue,
  } = useProjectDetail(id);

  if (isLoadingProject && !project) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background font-mono text-muted-foreground animate-pulse">
        LOADING_PROJECT...
      </div>
    );
  }

  if (!project) {
    return (
      <ProjectLoadErrorState
        errorMessage={projectLoadError}
        onRetry={retryProjectLoad}
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col overflow-hidden bg-background text-foreground">
      <ProjectHeader project={project} />

      <main className="flex-1 overflow-y-auto no-scrollbar p-6 pb-36">
        <div className="space-y-6">
          <section className="space-y-4">
            <LatestNoteSection
              cancelEditing={cancelEditing}
              drafts={drafts}
              editingItemId={editingItemId}
              latestCapture={latestCapture}
              latestCaptureRecord={latestCaptureRecord}
              primaryRecord={primaryRecord}
              primaryRecordConfirmations={primaryRecordConfirmations}
              saveConfirmation={saveConfirmation}
              savingItemIds={savingItemIds}
              startEditing={startEditing}
              updateDraftValue={updateDraftValue}
            />

            <ProjectStatusSection
              isOffline={isOffline}
              isSyncingQueue={isSyncingQueue}
              pendingRecordCount={pendingRecordIds.length}
              queuedCount={queuedCount}
              shouldShowStatusNotice={shouldShowStatusNotice}
              statusNotice={statusNotice}
            />
          </section>

          <PendingReviewsSection
            cancelEditing={cancelEditing}
            confirmations={secondaryPendingConfirmations}
            drafts={drafts}
            editingItemId={editingItemId}
            saveConfirmation={saveConfirmation}
            savingItemIds={savingItemIds}
            startEditing={startEditing}
            updateDraftValue={updateDraftValue}
          />

          <RecentHistorySection
            expandedHistoryRecordIds={expandedHistoryRecordIds}
            historyRecords={historyRecords}
            toggleHistoryRecord={toggleHistoryRecord}
            totalCount={sortedRecords.length}
          />

          <ProjectTeam project={project} onRefresh={retryProjectLoad} />

          <CategoryViewsSection records={categoryRecords} />
        </div>
      </main>

      <section className="pointer-events-none fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:px-8">
        <div className="pointer-events-auto mx-auto max-w-md">
          <PushToTalkButton onFinish={handleVoiceFinish} />
        </div>
      </section>
    </div>
  );
}
