import { useState, useEffect, useRef, useCallback } from 'react';
import { WordToken, DebugInfo } from '../types';

interface UseWebSpeechProps {
  text: string;
  speed: number;
  tokens: WordToken[];
  selectedVoice: SpeechSynthesisVoice | null;
  onEnd: () => void;
}

export const useWebSpeech = ({ text, speed, tokens, selectedVoice, onEnd }: UseWebSpeechProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    charIndex: -1,
    matchedTokenText: '-',
    isSpeaking: false,
    totalTokens: 0,
    lastEventTime: '-',
    playbackState: 'idle',
    voiceName: '',
    isLocalVoice: false
  });
  
  // Use a ref to store the utterance to prevent garbage collection
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const tokensRef = useRef<WordToken[]>(tokens);

  // Keep tokens ref in sync
  useEffect(() => {
    tokensRef.current = tokens;
    setDebugInfo(prev => ({ ...prev, totalTokens: tokens.length }));
  }, [tokens]);

  const getSynth = () => window.speechSynthesis;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const synth = getSynth();
      synth.cancel();
      if ((window as any).__ttsUtterance) {
        delete (window as any).__ttsUtterance;
      }
    };
  }, []);

  // Handle settings changes (Auto-restart)
  useEffect(() => {
    if (isSpeaking && !isPaused) {
       const currentText = utteranceRef.current?.text;
       // Only restart if the text is consistent and matches the main story
       // (Don't auto restart if we are reading a single selected word)
       if (currentText && currentText === text) {
          const synth = getSynth();
          synth.cancel();
          const timer = setTimeout(() => {
            play();
          }, 50);
          return () => clearTimeout(timer);
       }
    }
  }, [speed, selectedVoice?.name]); 

  const handleError = (e: SpeechSynthesisErrorEvent) => {
    if (e.error === 'canceled' || e.error === 'interrupted') return;
    console.error("SpeechSynthesis error:", e.error, e);
    setIsSpeaking(false);
    setIsPaused(false);
    setDebugInfo(prev => ({ ...prev, playbackState: `Error: ${e.error}` }));
  };

  const updateDebug = (charIndex: number, tokenText: string, state: string) => {
    setDebugInfo(prev => ({
        ...prev,
        charIndex,
        matchedTokenText: tokenText,
        lastEventTime: new Date().toISOString().split('T')[1].slice(0, 12),
        playbackState: state,
        isSpeaking: true,
        voiceName: selectedVoice?.name,
        isLocalVoice: selectedVoice?.localService
    }));
  };

  const stop = useCallback(() => {
    const synth = getSynth();
    synth.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setHighlightIndex(-1);
    utteranceRef.current = null;
    setDebugInfo(prev => ({ ...prev, playbackState: 'Stopped', isSpeaking: false }));
  }, []);

  const speakText = useCallback((arbitraryText: string) => {
      const synth = getSynth();
      synth.cancel(); 
      setIsPaused(false);
      setIsSpeaking(true);
      setHighlightIndex(-1);
      
      const utterance = new SpeechSynthesisUtterance(arbitraryText);
      (window as any).__ttsUtterance = utterance; 
      utteranceRef.current = utterance;

      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = speed;
      
      utterance.onend = () => {
          setIsSpeaking(false);
          utteranceRef.current = null;
      };
      utterance.onerror = handleError;
      synth.speak(utterance);
  }, [selectedVoice, speed]);

  const play = useCallback(() => {
    const synth = getSynth();

    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      setDebugInfo(prev => ({ ...prev, playbackState: 'Resumed' }));
      return;
    }

    synth.cancel();
    setHighlightIndex(-1);
    setDebugInfo(prev => ({ 
        ...prev, 
        playbackState: 'Starting...', 
        totalTokens: tokensRef.current.length,
        voiceName: selectedVoice?.name,
        isLocalVoice: selectedVoice?.localService
    }));

    const utterance = new SpeechSynthesisUtterance(text);
    // CRITICAL: Attach to window to prevent Garbage Collection
    (window as any).__ttsUtterance = utterance;
    utteranceRef.current = utterance;

    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = speed;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setDebugInfo(prev => ({ ...prev, playbackState: 'Speaking' }));
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setHighlightIndex(-1);
      setDebugInfo(prev => ({ ...prev, playbackState: 'Finished', isSpeaking: false }));
      onEnd();
    };

    utterance.onerror = handleError;

    // --- Core Highlighting Logic ---
    utterance.onboundary = (event) => {
      // Log for debugging
      console.log(`[TTS Boundary] Name: ${event.name}, CharIdx: ${event.charIndex}, Time: ${event.elapsedTime}`);
      
      const charIndex = event.charIndex;
      const currentTokens = tokensRef.current;
      
      if (typeof charIndex === 'number' && currentTokens.length > 0) {
        
        // 1. Direct Match
        let matchIndex = currentTokens.findIndex(t => 
            charIndex >= t.startIndex && charIndex < t.endIndex
        );

        // 2. Sticky/Closest Logic
        if (matchIndex === -1) {
            let lastTokenIndex = -1;
            for (let i = currentTokens.length - 1; i >= 0; i--) {
                if (currentTokens[i].startIndex < charIndex) {
                    lastTokenIndex = i;
                    break;
                }
            }
            if (lastTokenIndex !== -1) {
                matchIndex = lastTokenIndex;
            }
        }

        if (matchIndex !== -1) {
            setHighlightIndex(matchIndex);
            updateDebug(charIndex, currentTokens[matchIndex].text, 'Speaking (Match)');
        } else {
            updateDebug(charIndex, 'No Token', 'Speaking (Gap)');
        }
      }
    };

    synth.speak(utterance);
  }, [text, speed, selectedVoice, isPaused, onEnd]); 

  const pause = useCallback(() => {
    const synth = getSynth();
    if (synth.speaking && !synth.paused) {
      synth.pause();
      setIsPaused(true);
      setIsSpeaking(false); 
      setDebugInfo(prev => ({ ...prev, playbackState: 'Paused' }));
    }
  }, []);

  const speakSingleWord = useCallback((word: string) => {
    const synth = getSynth();
    synth.cancel();
    setIsSpeaking(true);
    setHighlightIndex(-1); 
    
    const utterance = new SpeechSynthesisUtterance(word);
    (window as any).__ttsUtterance = utterance;
    
    utteranceRef.current = utterance;
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = Math.max(0.6, speed * 0.8);
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = handleError;
    
    synth.speak(utterance);
  }, [selectedVoice, speed]);

  return {
    isSpeaking,
    isPaused,
    highlightIndex,
    debugInfo,
    play,
    pause,
    stop,
    speakSingleWord,
    speakText
  };
};