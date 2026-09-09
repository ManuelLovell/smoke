import { useSyncExternalStore } from 'react';
import { enTranslations, type TranslationDictionary, type TranslationKey } from './translations/en';

const LOCALE_STORAGE_KEY = 'smoke.locale';

const localeLoaders = {
  en: async () => enTranslations,
  es: async () => ({ ...enTranslations, ...(await import('./translations/es')).esTranslations }),
  fr: async () => ({ ...enTranslations, ...(await import('./translations/fr')).frTranslations }),
  de: async () => ({ ...enTranslations, ...(await import('./translations/de')).deTranslations }),
} as const;

export type Locale = keyof typeof localeLoaders;

type TranslationVariables = Record<string, string | number | boolean | null | undefined>;

const availableLocales = Object.keys(localeLoaders) as Locale[];

const normalizeLocale = (value: string | null | undefined): Locale => {
  if (!value) {
    return 'en';
  }

  const normalized = value.trim().toLowerCase();
  const directMatch = availableLocales.find((locale) => locale === normalized);
  if (directMatch) {
    return directMatch;
  }

  const prefixMatch = availableLocales.find((locale) => normalized.startsWith(`${locale}-`));
  return prefixMatch || 'en';
};

const interpolate = (template: string, variables?: TranslationVariables): string => {
  if (!variables) {
    return template;
  }

  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    const value = variables[key];
    return value === undefined || value === null ? '' : String(value);
  });
};

class TranslationService {
  private locale: Locale;

  private dictionary: TranslationDictionary;

  private version = 0;

  private readonly dictionaryCache = new Map<Locale, TranslationDictionary>([['en', enTranslations]]);

  private readonly pendingLoads = new Map<Locale, Promise<void>>();

  private readonly listeners = new Set<() => void>();

  constructor() {
    this.locale = this.resolveInitialLocale();
    this.dictionary = this.dictionaryCache.get(this.locale) || enTranslations;

    if (this.locale !== 'en') {
      void this.ensureLocaleLoaded(this.locale);
    }
  }

  private resolveInitialLocale(): Locale {
    if (typeof window === 'undefined') {
      return 'en';
    }

    const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (savedLocale) {
      return normalizeLocale(savedLocale);
    }

    if (Array.isArray(window.navigator.languages) && window.navigator.languages.length > 0) {
      return normalizeLocale(window.navigator.languages[0]);
    }

    return normalizeLocale(window.navigator.language);
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private emit = (): void => {
    this.listeners.forEach((listener) => listener());
  };

  private getSnapshot = (): string => {
    return `${this.locale}:${this.version}`;
  };

  private ensureLocaleLoaded = async (locale: Locale): Promise<void> => {
    const cachedDictionary = this.dictionaryCache.get(locale);
    if (cachedDictionary) {
      if (this.locale === locale && this.dictionary !== cachedDictionary) {
        this.dictionary = cachedDictionary;
        this.version += 1;
        this.emit();
      }
      return;
    }

    const existingLoad = this.pendingLoads.get(locale);
    if (existingLoad) {
      return existingLoad;
    }

    const loadPromise = localeLoaders[locale]().then((dictionary) => {
      this.dictionaryCache.set(locale, dictionary);

      if (this.locale === locale) {
        this.dictionary = dictionary;
        this.version += 1;
        this.emit();
      }
    }).finally(() => {
      this.pendingLoads.delete(locale);
    });

    this.pendingLoads.set(locale, loadPromise);
    return loadPromise;
  };

  getLocale = (): Locale => {
    return this.locale;
  };

  setLocale = (nextLocale: string): void => {
    const resolvedLocale = normalizeLocale(nextLocale);
    if (resolvedLocale === this.locale) {
      return;
    }

    this.locale = resolvedLocale;
    this.dictionary = this.dictionaryCache.get(resolvedLocale) || enTranslations;
    this.version += 1;

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, resolvedLocale);
    }

    this.emit();

    if (!this.dictionaryCache.has(resolvedLocale)) {
      void this.ensureLocaleLoaded(resolvedLocale);
    }
  };

  getAvailableLocales = (): Locale[] => {
    return [...availableLocales];
  };

  t = (key: TranslationKey, variables?: TranslationVariables): string => {
    return interpolate(this.dictionary[key] || enTranslations[key], variables);
  };
}

export const Translation = new TranslationService();

export const useTranslation = () => {
  useSyncExternalStore(Translation.subscribe, Translation['getSnapshot'], Translation['getSnapshot']);
  const locale = Translation.getLocale();

  return {
    locale,
    setLocale: Translation.setLocale,
    availableLocales: Translation.getAvailableLocales(),
    t: Translation.t,
  };
};