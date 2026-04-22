'use client';

import { motion, AnimatePresence } from 'framer-motion';
import styles from './PushToTalkButton.module.css';
import { AlertCircle, LoaderCircle, Mic, MicOff, TimerReset } from 'lucide-react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { WaveformVisualizer } from '../WaveformVisualizer/WaveformVisualizer';

interface Props {
  onFinish: (blob: Blob) => void;
}

export function PushToTalkButton({ onFinish }: Props) {
  const {
    isRecording,
    recorderState,
    errorMessage,
    durationSeconds,
    analyser,
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
          icon: <LoaderCircle className="animate-spin text-primary" />,
        };
      case 'recording':
        return {
          title: `REC ${durationLabel}`,
          subtitle: 'Release to send securely.',
          icon: <Mic className="text-primary" />,
        };
      case 'permission_denied':
        return {
          title: 'Microphone blocked',
          subtitle: 'Allow mic access to proceed.',
          icon: <MicOff className="text-destructive" />,
        };
      case 'unsupported':
        return {
          title: 'Mic unavailable',
          subtitle: 'Device does not support capture.',
          icon: <AlertCircle className="text-destructive" />,
        };
      case 'error':
        return {
          title: 'Capture failed',
          subtitle: 'Try again in a moment.',
          icon: <AlertCircle className="text-destructive" />,
        };
      case 'idle':
      default:
        return {
          title: 'Push to Talk',
          subtitle: 'Release to capture site notes.',
          icon: <Mic className="opacity-40" />,
        };
    }
  })();

  return (
    <div className="relative flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      {/* Waveform Area */}
      <div className="h-16 flex items-center justify-center w-full">
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex justify-center"
            >
              <WaveformVisualizer 
                analyser={analyser} 
                isRecording={isRecording} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center gap-4 w-full">
        <motion.button
          type="button"
          disabled={recorderState === 'requesting_permission'}
          whileTap={{ scale: 0.85 }}
          animate={isRecording ? { 
            scale: 1.1,
            boxShadow: '0 0 40px -5px hsla(45, 100%, 50%, 0.4)'
          } : { 
            scale: 1,
            boxShadow: '0 0 0px 0px rgba(0,0,0,0)'
          }}
          className={`
            relative flex h-24 w-24 items-center justify-center rounded-3xl 
            transition-colors duration-300
            ${isRecording ? 'bg-primary text-black' : 'bg-card border-2 border-primary/20 text-primary'}
            disabled:opacity-50 touch-none select-none
          `}
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
          {isRecording ? (
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Mic className="h-10 w-10" />
            </motion.div>
          ) : (
            <Mic className="h-10 w-10" />
          )}
        </motion.button>

        <motion.div 
          animate={isRecording ? { y: -5, opacity: 1 } : { y: 0, opacity: 0.7 }}
          className="text-center space-y-1"
        >
          <div className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest">
            {status.icon}
            <span className={isRecording ? 'text-primary' : 'text-foreground'}>
              {status.title}
            </span>
          </div>
          <p className="text-[10px] uppercase font-mono text-muted-foreground tracking-wider">
            {status.subtitle}
          </p>
        </motion.div>
      </div>

      {errorMessage && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-12 bg-destructive/10 text-destructive text-[10px] font-bold uppercase px-3 py-1 rounded-full border border-destructive/20"
        >
          {errorMessage}
        </motion.div>
      )}
    </div>
  );
}
