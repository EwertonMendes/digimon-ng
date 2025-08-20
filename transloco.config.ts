import { TranslocoGlobalConfig } from '@jsverse/transloco-utils';

const config: TranslocoGlobalConfig = {
  rootTranslationsPath: './assets/i18n/',
  langs: ['en', 'es', 'pt-br'],
  defaultLang: 'en',
  keysManager: {}
};

export default config;
