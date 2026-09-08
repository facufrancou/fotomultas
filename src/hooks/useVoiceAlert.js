import { useCallback, useEffect, useRef } from 'react';

/** Envoltorio simple sobre SpeechSynthesis para avisos en español. */
export function useVoiceAlert(enabled) {
  const voiceRef = useRef(null);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!supported) return undefined;
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      voiceRef.current =
        voices.find((v) => v.lang?.toLowerCase().startsWith('es-ar')) ||
        voices.find((v) => v.lang?.toLowerCase().startsWith('es')) ||
        voices[0] ||
        null;
    };
    pickVoice();
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pickVoice);
  }, [supported]);

  const speak = useCallback(
    (text) => {
      if (!supported || !enabled) return;
      window.speechSynthesis.cancel(); // evita solaparse con un aviso anterior
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceRef.current?.lang || 'es-AR';
      if (voiceRef.current) utterance.voice = voiceRef.current;
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    },
    [enabled, supported]
  );

  return { speak, supported };
}
