'use client';

import { useEffect } from 'react';
import '../i18n/config';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!i18n.isInitialized) {
      i18n.init();
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
} 