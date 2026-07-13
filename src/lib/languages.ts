export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  greeting: string;
  tagline: string;
}

export const languages: Language[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', greeting: 'नमस्ते', tagline: 'हर भारतीय के लिए AI वकील सहायक' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', greeting: 'Hello', tagline: 'AI Lawyer Assistant for Every Indian' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', greeting: 'வணக்கம்', tagline: 'ஒவ்வொரு இந்தியருக்கும் AI வழக்கறிஞர் உதவியாளர்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', greeting: 'నమస్కారం', tagline: 'ప్రతి భారతీయునికి AI లాయర్ అసిస్టెంట్' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', greeting: 'নমস্কার', tagline: 'প্রতিটি ভারতীয়ের জন্য AI আইনজীবী সহকারী' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', greeting: 'नमस्कार', tagline: 'प्रत्येक भारतीयासाठी AI वकील सहाय्यक' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', greeting: 'નમસ્તે', tagline: 'દરેક ભારતીય માટે AI વકીલ સહાયક' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', greeting: 'ನಮಸ್ಕಾರ', tagline: 'ಪ್ರತಿ ಭಾರತೀಯರಿಗೆ AI ವಕೀಲ ಸಹಾಯಕ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', greeting: 'നമസ്കാരം', tagline: 'ഓരോ ഇന്ത്യക്കാരനും AI ലോയർ അസിസ്റ്റന്റ്' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', greeting: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', tagline: 'ਹਰ ਭਾਰਤੀ ਲਈ AI ਵਕੀਲ ਸਹਾਇਕ' },
];

export const defaultLanguage = languages[0]; // Hindi

export function getLanguageByCode(code: string): Language {
  return languages.find(l => l.code === code) || languages[1]; // fallback to English
}
