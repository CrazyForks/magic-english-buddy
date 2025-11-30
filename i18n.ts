import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      app: {
        title: "Magic English Buddy",
        back: "Back to Editor",
      },
      home: {
        hero_title: "Ready to Practice?",
        hero_subtitle: "Paste your English homework below, or ask our Magic AI to write a story for you!",
        tab_write: "My Text",
        tab_generate: "Magic Generator",
        tab_preset: "Library",
        placeholder_write: "Paste English text here, or type your own story...",
        clear: "Clear",
        chars: "characters",
        topic_label: "What is the story about?",
        topic_placeholder: "e.g., A space cat visiting Mars...",
        difficulty_label: "Difficulty",
        diff_beginner: "beginner",
        diff_intermediate: "intermediate",
        btn_generating: "Writing Story...",
        btn_generate: "Write Magic Story",
        btn_start: "Start Reading",
        error_gen: "Oops! The magic failed temporarily. Please try again.",
        cat_fable: "Fables",
        cat_daily: "Daily Life",
        cat_science: "Science",
        cat_fun: "Fun Facts",
        preset_select_title: "Choose a story"
      },
      player: {
        debug_hide: "Hide Debug",
        debug_show: "Show Debug",
        guide_interactive_title: "Interactive Reading",
        guide_interactive_desc: "Press Play to read with highlighting.",
        guide_click_title: "Click Words",
        guide_click_desc: "Click any word to hear it pronounced.",
        guide_select_title: "Select Sentences",
        guide_select_desc: "Highlight any text with your mouse to read just that part."
      },
      controls: {
        options: "Options",
        slow: "Slow",
        fast: "Fast",
        loading_voices: "Loading voices..."
      },
      text_display: {
        read_selection: "Read Selection"
      }
    }
  },
  zh: {
    translation: {
      app: {
        title: "英语魔法伴侣",
        back: "返回编辑",
      },
      home: {
        hero_title: "准备好练习了吗？",
        hero_subtitle: "在下方粘贴你的英语作业，或者让魔法 AI 为你写个精彩故事！",
        tab_write: "我的文本",
        tab_generate: "魔法生成器",
        tab_preset: "预置题库",
        placeholder_write: "在这里粘贴英文文本，或者写下你的故事...",
        clear: "清空",
        chars: "字符",
        topic_label: "故事关于什么？",
        topic_placeholder: "例如：一只去火星探险的太空猫...",
        difficulty_label: "难度",
        diff_beginner: "初级",
        diff_intermediate: "中级",
        btn_generating: "正在创作...",
        btn_generate: "生成魔法故事",
        btn_start: "开始阅读",
        error_gen: "哎呀！魔法暂时失效了，请重试。",
        cat_fable: "寓言故事",
        cat_daily: "日常生活",
        cat_science: "趣味科学",
        cat_fun: "冷知识",
        preset_select_title: "选择一篇文章"
      },
      player: {
        debug_hide: "隐藏调试",
        debug_show: "显示调试",
        guide_interactive_title: "互动阅读",
        guide_interactive_desc: "点击播放，体验高亮跟读。",
        guide_click_title: "点击查词",
        guide_click_desc: "点击任意单词听发音。",
        guide_select_title: "划句朗读",
        guide_select_desc: "选中任意文本进行单独朗读。"
      },
      controls: {
        options: "设置",
        slow: "慢",
        fast: "快",
        loading_voices: "加载语音..."
      },
      text_display: {
        read_selection: "朗读选中内容"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
