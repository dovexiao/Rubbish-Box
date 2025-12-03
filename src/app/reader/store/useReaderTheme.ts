import { create } from 'zustand';
import AsyncStorage from "@react-native-async-storage/async-storage"

// 主题配置接口
export type ReaderTheme =  {
  name: string
  bgColor: string
  fontWeight: string
  textColor: string
  titleColor: string
  spineColor: string
  highlightColor: string
}

// 预定义主题
const READER_THEMES: ReaderTheme[] = [
  {
    name: "原始",
    bgColor: "#FFFFFF",
    fontWeight: "normal",
    textColor: "#252525",
    titleColor: "#2c3e50",
    spineColor: "rgba(0, 0, 0, 0.08)", // 浅灰色书脊，与白色背景形成轻微对比
    highlightColor: "rgba(37, 37, 37, 0.12)", // 浅灰色高亮，深色文字清晰可见
  },
  {
    name: "安静",
    bgColor: "#4A4A4C",
    fontWeight: "normal",
    textColor: "#DADADA",
    titleColor: "#2c3e50",
    spineColor: "rgba(0, 0, 0, 0.15)", // 更深的灰色书脊，与深灰背景形成对比
    highlightColor: "rgba(255, 255, 255, 0.12)", // 浅色高亮，浅色文字清晰可见
  },
  {
    name: "纸张",
    bgColor: "#EEEDED",
    fontWeight: "normal",
    textColor: "#252525",
    titleColor: "#f1f1f1",
    spineColor: "rgba(0, 0, 0, 0.06)", // 浅灰色书脊，与纸张色背景协调
    highlightColor: "rgba(37, 37, 37, 0.1)", // 浅灰色高亮，深色文字清晰可见
  },
  {
    name: "粗体",
    bgColor: "#FFFFFF",
    fontWeight: "bold",
    textColor: "#252525",
    titleColor: "#f1f1f1",
    spineColor: "rgba(0, 0, 0, 0.08)", // 浅灰色书脊，与白色背景形成轻微对比
    highlightColor: "rgba(37, 37, 37, 0.12)", // 浅灰色高亮，深色文字清晰可见
  },
  {
    name: "安静",
    bgColor: "#F4E1C6",
    fontWeight: "normal",
    textColor: "#1F1F1F",
    titleColor: "#f1f1f1",
    spineColor: "rgba(0, 0, 0, 0.05)", // 浅色书脊，与米色背景协调
    highlightColor: "rgba(31, 31, 31, 0.1)", // 浅米色高亮，深色文字清晰可见
  },
  {
    name: "专注",
    bgColor: "#FEFCF3",
    fontWeight: "normal",
    textColor: "#323232",
    titleColor: "#f1f1f1",
    spineColor: "rgba(0, 0, 0, 0.04)", // 极浅色书脊，与米白色背景协调
    highlightColor: "rgba(50, 50, 50, 0.1)", // 浅米白色高亮，深色文字清晰可见
  },
]

type ReaderThemeState = {
    currentThemeIndex: number;
    fontSize: number;
    themes: ReaderTheme[];
    setCurrentThemeIndex: (index: number) => void;
    setFontSize: (size: number) => void;
    setThemes: (themes: ReaderTheme[]) => void;

    saveReaderSettings: () => Promise<void>;
    loadReaderSettings: () => Promise<void>;
    changeTheme: (index: number) => void;
    increaseFontSize: () => void;
    decreaseFontSize: () => void;
    setFontSizeValue: (size: number) => void;
}

export const useReaderThemeStore = create<ReaderThemeState>((set, get) => ({
    currentThemeIndex: 0,
    fontSize: 30,
    themes: READER_THEMES,
    setCurrentThemeIndex: (index: number) => set({ currentThemeIndex: index }),
    setFontSize: (size: number) => set({ fontSize: size }),
    setThemes: (themes: ReaderTheme[]) => set({ themes: themes }),

    saveReaderSettings: async () => {
        try {
            const settings = {
                theme: get().currentThemeIndex,
                fontSize: get().fontSize,
            }
            await AsyncStorage.setItem('reader_settings_global', JSON.stringify(settings));
        } catch (error) {
            console.error('保存阅读设置失败:', error);
        }
    },
    loadReaderSettings: async () => {
        try {
            const settings = await AsyncStorage.getItem('reader_settings_global');
            if (settings) {
                const settingsObj = JSON.parse(settings);
                set({ currentThemeIndex: settingsObj.theme, fontSize: settingsObj.fontSize });
            }
            console.log('阅读设置加载成功:', settings);
        } catch (error) {
            console.error('加载阅读设置失败:', error);
        }
    },
    changeTheme: (index: number) => {
        if (index >= 0 && index < get().themes.length) {
            set({ currentThemeIndex: index });
        }
    },
    increaseFontSize: () => {
        set({ fontSize: Math.min(get().fontSize + 1, 35) });
    },
    decreaseFontSize: () => {
        set({ fontSize: Math.max(get().fontSize - 1, 25) });
    },
    setFontSizeValue: (size: number) => {
        set({ fontSize: Math.max(25, Math.min(35, size)) });
    },
}));