'use client';

import React from 'react';
import styles from './PushToTalkButton.module.css';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';

interface Props {
  onFinish: (blob: Blob) => void;
}

export function PushToTalkButton({ onFinish }: Props) {
  const { isRecording, startRecording, stopRecording } = useAudioRecorder(onFinish);

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={`${styles.button} ${isRecording ? styles.recording : ''}`}
        onPointerDown={(e) => {
          e.preventDefault();
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
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={styles.icon}
        >
          {isRecording ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          )}
        </svg>
      </button>
      <div className={`${styles.status} ${isRecording ? styles.recordingStatus : ''}`}>
        {isRecording ? 'Recording...' : 'Hold to Talk'}
      </div>
    </div>
  );
}
