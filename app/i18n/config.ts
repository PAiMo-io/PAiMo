import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './en/common.json';
import zhCommon from './zh/common.json';
import viCommon from './vi/common.json';
import esCommon from './es/common.json';

import enHome from './en/home.json';
import zhHome from './zh/home.json';
import viHome from './vi/home.json';
import esHome from './es/home.json';

const resources = {
  en: {
    common: enCommon,
    home: enHome,
  },
  zh: {
    common: zhCommon,
    home: zhHome,
  },
  vi: {
    common: viCommon,
    home: viHome,
  },
  es: {
    common: esCommon,
    home: esHome,
  },
};

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    lng: 'en',
    ns: ['common', 'home'],      
    defaultNS: 'common',
    resources,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
