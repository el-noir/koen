import { useState, useCallback, useEffect, useRef } from 'react';
import { useHaptics } from './useHaptics';

export type AudioRecorderState =
  | 'idle'
  | 'requesting_permission'
  | 'recording'
  | 'permission_denied'
  | 'unsupported'
  | 'error';

export function useAudioRecorder(onFinish: (blob: Blob) => void | Promise<void>) {
  const [isRecording, setIsRecording] = useState(false);
  const [recorderState, setRecorderState] = useState<AudioRecorderState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const chunks = useRef<Blob[]>([]);
  const { vibrateStart, vibrateEnd } = useHaptics();

  const clearTimingState = useCallback(() => {
    if (durationIntervalRef.current !== null) {
      window.clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    startedAtRef.current = null;
    setDurationSeconds(0);
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
    setRecorderState((current) => (current === 'permission_denied' || current === 'unsupported' || current === 'error'
      ? 'idle'
      : current));
  }, []);

  const startRecording = useCallback(async () => {
    if (mediaRecorder.current?.state === 'recording') {
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setRecorderState('unsupported');
      setErrorMessage('This browser cannot access the microphone.');
      return;
    }

    if (typeof MediaRecorder === 'undefined') {
      setRecorderState('unsupported');
      setErrorMessage('This browser cannot record audio yet.');
      return;
    }

    try {
      setErrorMessage(null);
      setRecorderState('requesting_permission');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(chunks.current, { type: 'audio/webm' });
        void Promise.resolve(onFinish(audioBlob));
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        mediaRecorder.current = null;
        clearTimingState();
        setRecorderState('idle');
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setRecorderState('recording');
      startedAtRef.current = Date.now();
      setDurationSeconds(0);
      durationIntervalRef.current = window.setInterval(() => {
        if (!startedAtRef.current) {
          return;
        }

        setDurationSeconds(Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000)));
      }, 250);
      vibrateStart();
    } catch (err) {
      console.error('Failed to start recording', err);
      clearTimingState();

      if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        setRecorderState('permission_denied');
        setErrorMessage('Microphone access was denied. Allow it in the browser and try again.');
        return;
      }

      setRecorderState('error');
      setErrorMessage('KOEN could not start the microphone. Try again.');
    }
  }, [clearTimingState, onFinish, vibrateStart]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current?.state === 'recording' && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      vibrateEnd();
    }
  }, [isRecording, vibrateEnd]);

  useEffect(() => () => {
    clearTimingState();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, [clearTimingState]);

  return {
    isRecording,
    recorderState,
    errorMessage,
    durationSeconds,
    startRecording,
    stopRecording,
    clearError,
  };
}
