'use client';

import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  analyser: AnalyserNode | null;
  className?: string;
  isRecording: boolean;
}

export function WaveformVisualizer({ analyser, className, isRecording }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser ? analyser.frequencyBinCount : 64;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      animationRef.current = requestAnimationFrame(draw);

      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Fallback: slight random pulse if no analyser
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.random() * 20;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        // Machinery Gold theme
        ctx.fillStyle = `hsla(45, 100%, 50%, ${barHeight / 100 + 0.1})`;
        
        // Draw centered bars
        ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth, barHeight);

        x += barWidth + 2;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isRecording]);

  return (
    <canvas 
      ref={canvasRef} 
      width={320} 
      height={64} 
      className={`${className} opacity-80`}
    />
  );
}
