export const SUPPORTED_LANGUAGES = ['en', 'zh', 'es', 'vi'] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
