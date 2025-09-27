export const i18n = {
  defaultLocale: "zh",
  locales: ["en", "zh"],
} as const;

export type Locale = (typeof i18n)["locales"][number];

// 新增的映射对象
export const localeMap = {
  en: "English",
  zh: "中文",
} as const;
