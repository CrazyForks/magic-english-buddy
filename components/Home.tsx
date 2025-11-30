import React, { useState } from 'react';
import { Sparkles, PlayCircle, PenTool, Eraser, Library, Book } from 'lucide-react';
import { generateStory } from '../services/geminiService';
import { useTranslation } from 'react-i18next';
import { PRESETS, PresetStory } from '../data/presets';
import clsx from 'clsx';

interface HomeProps {
  onStart: (text: string) => void;
  initialText: string;
}

export const Home: React.FC<HomeProps> = ({ onStart, initialText }) => {
  const [text, setText] = useState(initialText);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate'>('beginner');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<'write' | 'generate' | 'preset'>('write');
  const [activeCategory, setActiveCategory] = useState<PresetStory['category'] | 'all'>('all');
  const { t } = useTranslation();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const story = await generateStory(topic, difficulty);
      setText(story);
      setMode('write'); // Switch to write mode so they can see/edit it
    } catch (e) {
      alert(t('home.error_gen'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPreset = (content: string) => {
    setText(content);
    setMode('write');
  };

  const filteredPresets = activeCategory === 'all' 
    ? PRESETS 
    : PRESETS.filter(p => p.category === activeCategory);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-800">
          {t('home.hero_title')}
        </h2>
        <p className="text-lg text-slate-600 max-w-lg mx-auto">
          {t('home.hero_subtitle')}
        </p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-brand/5 border border-white overflow-hidden">
        
        {/* Toggle Header */}
        <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setMode('write')}
            className={clsx(
              "flex-1 py-4 font-bold text-center transition-colors flex items-center justify-center gap-2 whitespace-nowrap min-w-[120px]",
              mode === 'write' ? "bg-white text-brand border-b-4 border-brand" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
            )}
          >
            <PenTool size={18} />
            {t('home.tab_write')}
          </button>
          <button
            onClick={() => setMode('preset')}
            className={clsx(
              "flex-1 py-4 font-bold text-center transition-colors flex items-center justify-center gap-2 whitespace-nowrap min-w-[120px]",
              mode === 'preset' ? "bg-white text-fun-green border-b-4 border-fun-green" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
            )}
          >
            <Library size={18} />
            {t('home.tab_preset')}
          </button>
          <button
            onClick={() => setMode('generate')}
            className={clsx(
              "flex-1 py-4 font-bold text-center transition-colors flex items-center justify-center gap-2 whitespace-nowrap min-w-[120px]",
              mode === 'generate' ? "bg-white text-fun-pink border-b-4 border-fun-pink" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
            )}
          >
            <Sparkles size={18} />
            {t('home.tab_generate')}
          </button>
        </div>

        <div className="p-6 md:p-8">
          {mode === 'write' && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('home.placeholder_write')}
                className="w-full h-64 p-5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none resize-none text-lg text-slate-700 leading-relaxed transition-all"
              />
              <div className="flex justify-between items-center">
                 <button 
                  onClick={() => setText('')}
                  className="text-slate-400 hover:text-red-400 font-bold text-sm flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                 >
                   <Eraser size={16} /> {t('home.clear')}
                 </button>
                 <span className="text-slate-300 text-sm font-bold">{text.length} {t('home.chars')}</span>
              </div>
            </div>
          )}

          {mode === 'preset' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={clsx(
                            "px-4 py-2 rounded-full text-sm font-bold transition-all border-2",
                            activeCategory === 'all' 
                                ? "bg-slate-800 text-white border-slate-800" 
                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                        )}
                    >
                        All
                    </button>
                    {(['fable', 'daily', 'science', 'fun'] as const).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={clsx(
                                "px-4 py-2 rounded-full text-sm font-bold transition-all border-2",
                                activeCategory === cat 
                                    ? "bg-fun-green text-white border-fun-green shadow-lg shadow-fun-green/20" 
                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                            )}
                        >
                            {t(`home.cat_${cat}`)}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredPresets.map(story => (
                        <button
                            key={story.id}
                            onClick={() => handleSelectPreset(story.content)}
                            className="text-left p-4 rounded-xl border-2 border-slate-100 hover:border-fun-green hover:bg-green-50/50 transition-all group relative"
                        >
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-slate-700 group-hover:text-fun-green pr-6">{story.title}</h3>
                                <Book size={16} className="text-slate-300 group-hover:text-fun-green shrink-0 mt-1" />
                            </div>
                            <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                                {story.content}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
          )}

          {mode === 'generate' && (
            <div className="space-y-6 py-4 animate-in fade-in zoom-in-95 duration-200">
               <div className="space-y-2">
                 <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">{t('home.topic_label')}</label>
                 <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={t('home.topic_placeholder')}
                  className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-fun-pink focus:ring-4 focus:ring-fun-pink/10 outline-none text-lg"
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">{t('home.difficulty_label')}</label>
                 <div className="flex gap-4">
                   {['beginner', 'intermediate'].map((level) => (
                     <button
                      key={level}
                      onClick={() => setDifficulty(level as any)}
                      className={clsx(
                        "flex-1 py-3 rounded-xl font-bold border-2 transition-all capitalize",
                        difficulty === level 
                          ? "border-fun-pink bg-fun-pink/10 text-fun-pink" 
                          : "border-slate-100 text-slate-400 hover:border-slate-200"
                      )}
                     >
                       {t(`home.diff_${level}`)}
                     </button>
                   ))}
                 </div>
               </div>

               <button
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-fun-pink to-fun-purple text-white font-bold text-lg shadow-xl shadow-fun-pink/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
               >
                 {isGenerating ? (
                   <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                 ) : (
                   <Sparkles size={24} />
                 )}
                 {isGenerating ? t('home.btn_generating') : t('home.btn_generate')}
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Start Button Area */}
      {mode === 'write' && (
        <div className="flex justify-center">
          <button
            onClick={() => onStart(text)}
            disabled={!text.trim()}
            className="group relative px-8 py-4 bg-brand hover:bg-brand-dark text-white rounded-full font-display font-bold text-xl shadow-xl shadow-brand/30 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <div className="flex items-center gap-3">
              <span>{t('home.btn_start')}</span>
              <PlayCircle size={28} className="group-hover:rotate-90 transition-transform" />
            </div>
          </button>
        </div>
      )}

    </div>
  );
};
