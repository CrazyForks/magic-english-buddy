import React, { useState, useEffect, useMemo } from 'react';
import { TextDisplay } from './TextDisplay';
import { Controls } from './Controls';
import { useWebSpeech } from '../hooks/useWebSpeech';
import { WordToken, DebugInfo } from '../types';
import { Bug } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PlayerProps {
  text: string;
  onBack: () => void;
}

const DebugOverlay: React.FC<{ info: DebugInfo }> = ({ info }) => (
  <div className="fixed bottom-32 left-4 p-4 bg-black/80 text-green-400 font-mono text-xs rounded-lg shadow-xl z-[101] backdrop-blur-md max-w-xs pointer-events-none opacity-80">
    <div className="flex items-center gap-2 mb-2 border-b border-green-400/30 pb-1">
        <Bug size={14} /> <span>TTS Debugger</span>
    </div>
    <div className="grid grid-cols-[80px_1fr] gap-x-2 gap-y-1">
        <span className="text-slate-400">Status:</span> 
        <span className="font-bold text-white">{info.playbackState}</span>
        
        <span className="text-slate-400">Voice:</span> 
        <span className="truncate text-blue-300" title={info.voiceName}>{info.voiceName || '-'}</span>

        <span className="text-slate-400">Type:</span> 
        <span className={info.isLocalVoice ? "text-green-400" : "text-red-400"}>
            {info.isLocalVoice ? "Local (Good)" : "Network (May fail)"}
        </span>

        <span className="text-slate-400">Char Idx:</span> 
        <span>{info.charIndex}</span>
        
        <span className="text-slate-400">Token:</span> 
        <span className="text-yellow-300 truncate">"{info.matchedTokenText}"</span>
        
        <span className="text-slate-400">Tokens:</span> 
        <span>{info.totalTokens}</span>

        <span className="text-slate-400">Last Evt:</span> 
        <span>{info.lastEventTime}</span>
    </div>
  </div>
);

export const Player: React.FC<PlayerProps> = ({ text, onBack }) => {
  const [tokens, setTokens] = useState<WordToken[]>([]);
  const [speed, setSpeed] = useState(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [showDebug, setShowDebug] = useState(false);
  const { t } = useTranslation();
  
  // Check for debug flag in URL
  const allowDebug = useMemo(() => {
    if (typeof window !== 'undefined') {
        return new URLSearchParams(window.location.search).get('debug') === 'true';
    }
    return false;
  }, []);

  // Initialize Voices
  useEffect(() => {
    const loadVoices = () => {
      let avail = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
      
      // Sort voices: Local Service voices first!
      // This is critical because remote voices often don't support onboundary events.
      avail.sort((a, b) => {
        if (a.localService === b.localService) return 0;
        return a.localService ? -1 : 1;
      });

      setVoices(avail);
      
      if (avail.length > 0) {
          const currentExists = avail.find(v => v.name === selectedVoiceName);
          if (!selectedVoiceName || !currentExists) {
             // Priority: 
             // 1. Local Microsoft/System voices (very reliable for events)
             // 2. Any Local voice
             // 3. Fallback
             const preferred = avail.find(v => v.localService && (v.name.includes('Microsoft') || v.name.includes('Samantha'))) || 
                               avail.find(v => v.localService) ||
                               avail[0];
             setSelectedVoiceName(preferred?.name || '');
          }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [selectedVoiceName]);

  const selectedVoice = voices.find(v => v.name === selectedVoiceName) || null;

  const { 
    isSpeaking, 
    isPaused, 
    highlightIndex, 
    debugInfo,
    play, 
    pause, 
    stop,
    speakSingleWord,
    speakText
  } = useWebSpeech({
    text,
    speed,
    tokens,
    selectedVoice,
    onEnd: () => {}
  });

  const handleSelection = (selectedText: string) => {
    if (selectedText.trim()) {
      if (isSpeaking) stop();
      speakText(selectedText);
    }
  };

  return (
    <>
      {/* 
        Increased padding bottom to pb-96 (24rem / 384px) to ensure the fixed Controls 
        never obscure the text content, regardless of screen size. 
      */}
      <div className="pb-96 animate-in fade-in zoom-in-95 duration-300 relative">
        
        {/* Debug Toggle - Only visible if ?debug=true */}
        {allowDebug && (
          <button 
              onClick={() => setShowDebug(!showDebug)}
              className="absolute -top-10 right-0 text-xs text-slate-300 hover:text-slate-500 font-mono"
          >
              [{showDebug ? t('player.debug_hide') : t('player.debug_show')}]
          </button>
        )}

        {/* Display Area */}
        <div className="relative">
          <TextDisplay 
            rawText={text}
            highlightIndex={highlightIndex} 
            onTokensGenerated={setTokens}
            onWordClick={(word) => {
              speakSingleWord(word);
            }}
            onTextSelected={handleSelection}
          />
          
          {/* Simple Guide */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center px-2">
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 text-sm text-slate-600 shadow-sm">
                  <span className="block font-bold text-brand mb-1 text-base">{t('player.guide_interactive_title')}</span>
                  {t('player.guide_interactive_desc')}
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 text-sm text-slate-600 shadow-sm">
                  <span className="block font-bold text-fun-pink mb-1 text-base">{t('player.guide_click_title')}</span>
                  {t('player.guide_click_desc')}
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 text-sm text-slate-600 shadow-sm">
                  <span className="block font-bold text-fun-purple mb-1 text-base">{t('player.guide_select_title')}</span>
                  {t('player.guide_select_desc')}
              </div>
          </div>
        </div>
      </div>

      {showDebug && <DebugOverlay info={debugInfo} />}

      {/* Fixed Controls */}
      <Controls 
        isPlaying={isSpeaking}
        isPaused={isPaused}
        speed={speed}
        voices={voices}
        selectedVoiceName={selectedVoiceName}
        onPlay={play}
        onPause={pause}
        onStop={stop}
        onSpeedChange={setSpeed}
        onVoiceChange={setSelectedVoiceName}
        onGeminiTTS={() => {}} 
        isGeminiLoading={false}
      />
    </>
  );
};