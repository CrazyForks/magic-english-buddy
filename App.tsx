import React, { useState } from 'react';
import { Home } from './components/Home';
import { Player } from './components/Player';
import { BookOpen, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type ViewState = 'home' | 'player';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [storyText, setStoryText] = useState<string>("");
  const { t, i18n } = useTranslation();

  const handleStartPractice = (text: string) => {
    setStoryText(text);
    setView('player');
  };

  const handleBackToHome = () => {
    setView('home');
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en');
  };

  return (
    <div className="min-h-screen bg-brand-light font-sans selection:bg-fun-pink selection:text-white pb-10">
      {/* Global Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-brand-light p-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={handleBackToHome}
          >
            <div className="bg-brand text-white p-2 rounded-2xl shadow-lg shadow-brand/20 transition-transform group-hover:scale-110 group-hover:rotate-[-5deg]">
               <BookOpen size={24} />
            </div>
            <h1 className="text-xl md:text-2xl font-display font-bold text-brand-dark tracking-tight">
              {t('app.title')}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-white text-slate-600 font-bold text-sm transition-colors border border-transparent hover:border-slate-200"
            >
              <Languages size={18} />
              {i18n.language === 'en' ? '中文' : 'EN'}
            </button>

            {view === 'player' && (
              <button 
                onClick={handleBackToHome}
                className="text-sm font-bold text-slate-500 hover:text-brand bg-slate-100 hover:bg-white px-4 py-2 rounded-xl transition-all"
              >
                {t('app.back')}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 mt-4">
        {view === 'home' ? (
          <Home onStart={handleStartPractice} initialText={storyText} />
        ) : (
          <Player text={storyText} onBack={handleBackToHome} />
        )}
      </main>

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-2 bg-gradient-to-r from-fun-pink via-fun-yellow to-brand pointer-events-none z-40"></div>
    </div>
  );
};

export default App;