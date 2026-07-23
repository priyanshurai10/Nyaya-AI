import en from './en.json';
import hi from './hi.json';
import bn from './bn.json';
import ta from './ta.json';
import te from './te.json';
import kn from './kn.json';
import ml from './ml.json';
import mr from './mr.json';
import gu from './gu.json';
import pa from './pa.json';

export type LanguageCode = 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'kn' | 'ml' | 'mr' | 'gu' | 'pa';

export const locales: Record<LanguageCode, Record<string, string>> = {
  en,
  hi,
  bn,
  ta,
  te,
  kn,
  ml,
  mr,
  gu,
  pa,
};
