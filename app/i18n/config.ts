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

import enProfile from './en/profile.json';
import zhProfile from './zh/profile.json';
import viProfile from './vi/profile.json';
import esProfile from './es/profile.json';

// scheduler page (/event-edit)
import enScheduler from './en/scheduler.json';
import zhScheduler from './zh/scheduler.json';
import viScheduler from './vi/scheduler.json';
import esScheduler from './es/scheduler.json';

// club page (/clubs/[id])
import enClub from './en/club.json';
import zhClub from './zh/club.json';
import viClub from './vi/club.json';
import esClub from './es/club.json';

const resources = {
  en: {
    common: enCommon,
    home: enHome,
    profile: enProfile,
    scheduler: enScheduler,
    club: enClub,
  },
  zh: {
    common: zhCommon,
    home: zhHome,
    profile: zhProfile,
    scheduler: zhScheduler,
    club: zhClub,
  },
  vi: {
    common: viCommon,
    home: viHome,
    profile: viProfile,
    scheduler: viScheduler,
    club: viClub,
  },
  es: {
    common: esCommon,
    home: esHome,
    profile: esProfile,
    scheduler: esScheduler,
    club: esClub,
  },
};

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    lng: 'en',
    ns: ['common', 'home', 'profile', 'scheduler', 'club'],      
    defaultNS: 'common',
    resources,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
