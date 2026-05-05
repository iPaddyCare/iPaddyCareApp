import { useLanguage } from '../context/LanguageContext';
import en from './en.json';
import si from './si.json';
import ta from './ta.json';

const dictionaries = {
  English: en,
  'සිංහල': si,
  'தமிழ்': ta,
};

export const useTranslation = (namespace) => {
  const { selectedLanguage } = useLanguage();
  const dict = dictionaries[selectedLanguage] || en;
  return (key) => {
    if (key == null) return key;
    // Already namespaced (e.g. "common.error"): direct lookup.
    if (key.indexOf('.') !== -1 && dict[key] !== undefined) {
      return dict[key];
    }
    if (namespace) {
      const nsKey = `${namespace}.${key}`;
      if (dict[nsKey] !== undefined) return dict[nsKey];
      const commonKey = `common.${key}`;
      if (dict[commonKey] !== undefined) return dict[commonKey];
    }
    if (dict[key] !== undefined) return dict[key];
    return key;
  };
};
