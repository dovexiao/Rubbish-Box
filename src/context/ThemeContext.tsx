import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from 'react';
import { cacheGet, cacheSet } from '@/utils';
import { lightTheme, darkTheme, Theme, ThemeType } from '@/context/theme';

interface ThemeContextType {
  themeType: ThemeType;
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (type: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // 默认使用深色,在换肤接口成功后，更新 themeType
  const [themeType, setThemeType] = useState<ThemeType>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  // 加载缓存中的主题设置
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await cacheGet({ key: 'themeType' });
        if (storedTheme === 'dark' || storedTheme === 'light') {
          setThemeType(storedTheme);
        }
      } catch (e) {
        console.warn('没有从 cache 中读取到 themeType :', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = () => {
    setThemeType(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      cacheSet({ key: 'themeType', data: newTheme });
      return newTheme;
    });
  };

  const setTheme = (type: ThemeType) => {
    setThemeType(type);
    cacheSet({ key: 'themeType', data: type });
  };

  const theme = useMemo(() => {
    return themeType === 'dark' ? darkTheme : lightTheme;
  }, [themeType]);

  // 可选：在加载完成前可以返回 null 或者 Loading 组件，
  // 但为了用户体验通常直接渲染默认主题（浅色）即可，避免闪烁
  // if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={{ themeType, theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // 兜底：在未被 ThemeProvider 包裹时提供一个默认主题，避免直接抛错导致页面崩溃
    return {
      themeType: 'dark',
      theme: darkTheme,
      toggleTheme: () => {},
      setTheme: () => {},
    } as ThemeContextType;
  }
  return context;
};
