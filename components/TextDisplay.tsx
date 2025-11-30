import React, { useMemo, useState, useEffect, useRef } from 'react';
import { WordToken } from '../types';
import clsx from 'clsx';
import { Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TextDisplayProps {
  rawText: string;
  highlightIndex: number;
  onTokensGenerated: (tokens: WordToken[]) => void;
  onWordClick: (word: string) => void;
  onTextSelected: (text: string) => void;
}

export const TextDisplay: React.FC<TextDisplayProps> = ({ 
  rawText, 
  highlightIndex, 
  onTokensGenerated,
  onWordClick,
  onTextSelected
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);
  const [selectionPopup, setSelectionPopup] = useState<{x: number, y: number, text: string} | null>(null);
  const { t } = useTranslation();

  // Parse text into tokens
  const tokens = useMemo(() => {
    const t: WordToken[] = [];
    // Robust regex: capture any sequence of non-whitespace characters
    // This groups "word" and "word," as single tokens, which aligns with how most people read text chunks.
    const regex = /([^\s]+)/g; 
    let match;
    
    while ((match = regex.exec(rawText)) !== null) {
      t.push({
        id: `word-${match.index}`,
        text: match[0],
        cleanText: match[0].replace(/[^\w\s']/g, ""),
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }
    return t;
  }, [rawText]);

  // Report tokens back to parent
  useEffect(() => {
    onTokensGenerated(tokens);
  }, [tokens, onTokensGenerated]);

  // Auto-scroll to active word
  useEffect(() => {
    if (highlightIndex !== -1 && activeWordRef.current) {
        activeWordRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
    }
  }, [highlightIndex]);

  // Handle Text Selection
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !containerRef.current?.contains(selection.anchorNode)) {
        setSelectionPopup(null);
        return;
      }

      const text = selection.toString().trim();
      if (text.length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelectionPopup({
            x: rect.left + (rect.width / 2),
            y: rect.top - 10,
            text: text
        });
      }
    };

    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('keyup', handleSelectionChange);
    
    return () => {
        document.removeEventListener('mouseup', handleSelectionChange);
        document.removeEventListener('keyup', handleSelectionChange);
    };
  }, []);

  if (!rawText) return null;

  return (
    <>
        <div 
            ref={containerRef}
            className="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 min-h-[40vh] leading-[2.8] text-xl md:text-3xl font-sans text-slate-700 relative border-b-8 border-brand-light"
        >
        <div className="flex flex-wrap gap-x-[14px] gap-y-[12px]">
            {tokens.map((token, index) => {
            const isActive = index === highlightIndex;
            return (
                <span
                key={token.id}
                ref={isActive ? activeWordRef : null}
                onClick={(e) => {
                    e.stopPropagation();
                    onWordClick(token.cleanText);
                }}
                className={clsx(
                    "cursor-pointer rounded-lg px-3 py-1.5 transition-all duration-200 border-2 select-text relative will-change-transform",
                    isActive 
                    ? "bg-blue-600 text-white border-blue-600 scale-110 -translate-y-1 font-bold shadow-xl shadow-blue-500/40 z-10" 
                    : "border-transparent text-slate-700 hover:bg-sky-50 hover:text-sky-600 hover:scale-105"
                )}
                >
                {token.text}
                </span>
            );
            })}
        </div>
        </div>

        {/* Floating Play Button for Selection */}
        {selectionPopup && (
            <div 
                className="fixed z-50 transform -translate-x-1/2 -translate-y-full animate-in zoom-in-50 duration-200"
                style={{ left: selectionPopup.x, top: selectionPopup.y }}
            >
                <button
                    onClick={() => {
                        onTextSelected(selectionPopup.text);
                        setSelectionPopup(null);
                        window.getSelection()?.removeAllRanges();
                    }}
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full shadow-xl hover:bg-black transition-transform hover:scale-105 font-bold text-sm mb-3 whitespace-nowrap border-2 border-white/20"
                >
                    <Volume2 size={18} />
                    {t('text_display.read_selection')}
                </button>
                <div className="w-4 h-4 bg-slate-900 rotate-45 mx-auto -mt-5"></div>
            </div>
        )}
    </>
  );
};