import { useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';

export default function VoiceMessageButton({ onRecorded, onNotice }: {
  onRecorded: (blob: Blob, durationSeconds: number) => void;
  onNotice: (message: string) => void;
}) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => setSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000)), 250);
    return () => window.clearInterval(timer);
  }, [recording]);

  useEffect(() => () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach(track => track.stop());
  }, []);

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      onNotice('Voice recording is not supported by this browser. Try the latest Safari or Chrome over HTTPS.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      streamRef.current = stream;
      const mimeType = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'].find(type => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      chunksRef.current = [];
      startedAtRef.current = Date.now();
      setSeconds(0);
      recorder.ondataavailable = event => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onerror = () => onNotice('The recording stopped because the microphone encountered an error.');
      recorder.onstop = () => {
        const duration = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setRecording(false);
        if (blob.size) onRecorded(blob, duration);
        else onNotice('No audio was captured. Please try recording again.');
      };
      recorder.start(250);
      setRecording(true);
    } catch (error) {
      const message = error instanceof DOMException && error.name === 'NotAllowedError'
        ? 'Microphone access was denied. Allow microphone access in your browser settings and try again.'
        : error instanceof DOMException && error.name === 'NotFoundError'
          ? 'No microphone was found on this device.'
          : 'Could not start the microphone. Check browser permissions and try again.';
      onNotice(message);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  };

  return (
    <button
      type="button"
      className={`fni-voice-button${recording ? ' is-recording' : ''}`}
      aria-label={recording ? 'Stop and send voice message' : 'Record voice message'}
      title={recording ? `Stop recording · ${seconds}s` : 'Record voice message'}
      onClick={recording ? stopRecording : () => { void startRecording(); }}
    >
      {recording ? <><Square size={15} fill="currentColor" /><span>{seconds}s</span></> : <Mic size={19} />}
    </button>
  );
}
