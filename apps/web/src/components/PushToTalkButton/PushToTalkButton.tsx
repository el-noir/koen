'use client';

import React from 'react';
import styles from './PushToTalkButton.module.css';
import { AlertCircle, LoaderCircle, Mic, MicOff, TimerReset } from 'lucide-react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';

interface Props {
  onFinish: (blob: Blob) => void;
}

export function PushToTalkButton({ onFinish }: Props) {
  const {
    isRecording,
    recorderState,
    errorMessage,
    durationSeconds,
    startRecording,
    stopRecording,
    clearError,
  } = useAudioRecorder(onFinish);

  const durationLabel = `${Math.floor(durationSeconds / 60)
    .toString()
    .padStart(2, '0')}:${(durationSeconds % 60).toString().padStart(2, '0')}`;

  const status = (() => {
    switch (recorderState) {
      case 'requesting_permission':
        return {
          title: 'Allow microphone',
          subtitle: 'KOEN is requesting mic access.',
          icon: <LoaderCircle className={`${styles.inlineIcon} ${styles.spinning}`} />,
        };
      case 'recording':
        return {
          title: `Recording ${durationLabel}`,
          subtitle: 'Release to send the note.',
          icon: <Mic className={styles.inlineIcon} />,
        };
      case 'permission_denied':
        return {
          title: 'Microphone blocked',
          subtitle: 'Allow microphone access, then try again.',
          icon: <MicOff className={styles.inlineIcon} />,
        };
      case 'unsupported':
        return {
          title: 'Microphone unavailable',
          subtitle: 'This device or browser cannot record audio here.',
          icon: <AlertCircle className={styles.inlineIcon} />,
        };
      case 'error':
        return {
          title: 'Could not start recording',
          subtitle: 'Try again in a moment.',
          icon: <AlertCircle className={styles.inlineIcon} />,
        };
      case 'idle':
      default:
        return {
          title: 'Hold to Talk',
          subtitle: 'Press and hold, then release to send.',
          icon: <TimerReset className={styles.inlineIcon} />,
        };
    }
  })();

  return (
    <div className={styles.container}>
      <button
        type="button"
        disabled={recorderState === 'requesting_permission'}
        className={`${styles.button} ${isRecording ? styles.recording : ''}`}
        onPointerDown={(e) => {
          e.preventDefault();
          clearError();
          e.currentTarget.setPointerCapture(e.pointerId);
          void startRecording();
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
          stopRecording();
        }}
        onPointerCancel={stopRecording}
        aria-label="Push to Talk"
      >
        <Mic className={styles.icon} />
      </button>

      <div className={`${styles.statusCard} ${isRecording ? styles.recordingCard : ''}`}>
        <div className={`${styles.statusTitle} ${isRecording ? styles.recordingStatus : ''}`}>
          {status.icon}
          <span>{status.title}</span>
        </div>
        <div className={styles.statusSubtitle}>{status.subtitle}</div>
        {errorMessage && (
          <div className={styles.errorText}>{errorMessage}</div>
        )}
      </div>
    </div>
  );
}
