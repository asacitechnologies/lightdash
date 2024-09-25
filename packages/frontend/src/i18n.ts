// src/i18n.ts
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Importe les fichiers de traduction
import enTranslation from './locales/en/translation.json';
import frTranslation from './locales/fr/translation.json';

i18n
  .use(LanguageDetector) // Détecte automatiquement la langue de l'utilisateur
  .use(initReactI18next) // Passe i18n à react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      fr: {
        translation: frTranslation,
      },
    },
    fallbackLng: 'fr', // Langue par défaut
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      order: ['localStorage', 'navigator'], // Détecte la langue via le navigateur ou localStorage
    },
  });

export default i18n;
