import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './en/common.json';
import zhCommon from './zh/common.json';
import viCommon from './vi/common.json';
import esCommon from './es/common.json';

const resources = {
  en: {
    common: enCommon,
  },
  zh: {
    common: zhCommon,
  },
  vi: {
    common: viCommon,
  },
  es: {
    common: esCommon,
  },
};

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    lng: 'en',
    ns: ['common'],      
    defaultNS: 'common',
    resources,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
