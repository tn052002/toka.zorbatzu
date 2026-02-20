import en from './locales/en';

export type Locale = 'en' | 'vi';
export type Messages = typeof en;
export type MessagePath = keyof Messages;
