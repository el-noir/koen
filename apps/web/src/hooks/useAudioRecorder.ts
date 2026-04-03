import { useState, useCallback, useRef } from 'react';
import { useHaptics } from './useHaptics';

export function useAudioRecorder(onFinish: (blob: Blob) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const { vibrateStart, vibrateEnd } = useHaptics();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(chunks.current, { type: 'audio/webm' });
        onFinish(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      vibrateStart();
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }, [onFinish, vibrateStart]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      vibrateEnd();
    }
  }, [isRecording, vibrateEnd]);

  return { isRecording, startRecording, stopRecording };
}
