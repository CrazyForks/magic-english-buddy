import React, { useState } from 'react';
import { Play, Pause, Square, Settings, Type, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface ControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  speed: number;
  voices: SpeechSynthesisVoice[];
  selectedVoiceName: string;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSpeedChange: (speed: number) => void;
  onVoiceChange: (voiceName: string) => void;
  onGeminiTTS: () => void;
  isGeminiLoading: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  isPaused,
  speed,
  voices,
  selectedVoiceName,
  onPlay,
  onPause,
  onStop,
  onSpeedChange,
  onVoiceChange,
}) => {
  const [showMobileSettings, setShowMobileSettings] = useState(false);
  const { t } = useTranslation();

  const handlePlay = () => {
    // Auto collapse settings on mobile when playing starts
    setShowMobileSettings(false);
    onPlay();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 md:pb-8 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-[100]">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Top Row: Playback Controls & Mobile Settings Toggle */}
        <div className="w-full md:w-auto flex items-center justify-center md:justify-start relative mb-2 md:mb-0">
            {/* Playback Buttons */}
            <div className="flex items-center gap-6 order-1">
            {!isPlaying && !isPaused ? (
                <button
                onClick={handlePlay}
                className="bg-brand text-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl shadow-brand/30 hover:scale-110 active:scale-95 transition-all group"
                aria-label="Play"
                >
                <Play fill="currentColor" size={32} className="ml-1 group-hover:scale-110 transition-transform" />
                </button>
            ) : (
                <div className="flex gap-4 animate-in zoom-in duration-200">
                {isPaused ? (
                    <button
                    onClick={handlePlay}
                    className="bg-brand text-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-all"
                >
                    <Play fill="currentColor" size={28} className="ml-1" />
                </button>
                ) : (
                    <button
                    onClick={onPause}
                    className="bg-amber-400 text-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-all"
                    >
                    <Pause fill="currentColor" size={28} />
                    </button>
                )}
                <button
                    onClick={onStop}
                    className="bg-slate-100 text-slate-400 w-16 h-16 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-400 transition-colors"
                >
                    <Square fill="currentColor" size={24} />
                </button>
                </div>
            )}
            </div>

            {/* Mobile Settings Toggle Button (Absolute Right) */}
            {!showMobileSettings && (
                <button 
                    onClick={() => setShowMobileSettings(true)}
                    className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
                >
                    <Settings size={20} />
                </button>
            )}
        </div>

        {/* Settings Panel */}
        <div className={clsx(
            "w-full md:w-auto flex-col md:flex-row gap-3 items-center bg-slate-50 rounded-2xl border border-slate-100 shadow-inner transition-all overflow-hidden origin-bottom",
            showMobileSettings ? "flex p-3 animate-in slide-in-from-bottom-2 fade-in" : "hidden md:flex md:p-3"
        )}>
          
          {/* Mobile Collapse Header */}
          <div className="w-full flex justify-between items-center md:hidden pb-2 border-b border-slate-200 mb-1">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Settings size={12} /> {t('controls.options')}
             </span>
             <button 
                onClick={() => setShowMobileSettings(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
             >
                <ChevronDown size={18} />
             </button>
          </div>
          
          {/* Speed Slider */}
          <div className="flex items-center gap-3 w-full md:w-auto px-1">
            <div className="bg-white p-1.5 rounded-lg shadow-sm text-brand hidden md:block">
                <Settings size={18} />
            </div>
            <div className="flex items-center gap-2 flex-1">
                <span className="text-xs font-bold text-slate-400 select-none">{t('controls.slow')}</span>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={speed}
                  onInput={(e) => onSpeedChange(parseFloat((e.target as HTMLInputElement).value))}
                  className="w-full md:w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand"
                />
                <span className="text-xs font-bold text-slate-400 select-none">{t('controls.fast')}</span>
            </div>
            <div className="bg-white px-2 py-1 rounded text-xs font-bold font-mono text-brand border border-slate-100 min-w-[36px] text-center">
                {speed}x
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

          {/* Voice Selector */}
          <div className="flex items-center gap-3 w-full md:w-auto px-1">
             <div className="bg-white p-1.5 rounded-lg shadow-sm text-fun-pink hidden md:block">
                <Type size={18} />
            </div>
             <div className="relative w-full md:w-48">
                <select 
                    value={selectedVoiceName}
                    onChange={(e) => onVoiceChange(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg focus:ring-2 focus:ring-brand focus:border-brand block p-2 pr-8 truncate cursor-pointer appearance-none"
                    disabled={voices.length === 0}
                >
                    {voices.length === 0 && <option>{t('controls.loading_voices')}</option>}
                    {voices.map(v => (
                    <option key={v.name} value={v.name}>
                        {v.name.replace(/Microsoft|Google|English|United States/g, '').trim() || v.name}
                    </option>
                    ))}
                </select>
                {/* Custom Arrow */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};