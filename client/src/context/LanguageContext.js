import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    Home: 'Home', About: 'About', Membership: 'Membership', Events: 'Events',
    Gallery: 'Gallery', Business: 'Business', News: 'News', Forum: 'Forum',
    'Cultural Heritage': 'Cultural Heritage', 'TN Connect': 'TN Connect',
    'Our Team': 'Our Team', Contact: 'Contact',
    'Sign In': 'Sign In', 'Join Now': 'Join Now',
    'My Profile & Card': 'My Profile & Card', 'Admin Dashboard': 'Admin Dashboard', 'Sign Out': 'Sign Out',
  },
  ta: {
    Home: 'முகப்பு', About: 'பற்றி', Membership: 'உறுப்பினர்', Events: 'நிகழ்வுகள்',
    Gallery: 'கேலரி', Business: 'வணிகம்', News: 'செய்திகள்', Forum: 'மன்றம்',
    'Cultural Heritage': 'கலாச்சார மரபு', 'TN Connect': 'TN இணைப்பு',
    'Our Team': 'எங்கள் குழு', Contact: 'தொடர்பு',
    'Sign In': 'உள்நுழை', 'Join Now': 'இப்போது சேர்',
    'My Profile & Card': 'என் சுயவிவரம்', 'Admin Dashboard': 'நிர்வாக பலகை', 'Sign Out': 'வெளியேறு',
  },
  gu: {
    Home: 'મુખ્ય પૃષ્ઠ', About: 'અમારા વિશે', Membership: 'સભ્યપદ', Events: 'ઇવેન્ટ્સ',
    Gallery: 'ગૅલેરી', Business: 'વ્યવસાય', News: 'સમાચાર', Forum: 'ફોરમ',
    'Cultural Heritage': 'સાંસ્કૃતિક વારસો', 'TN Connect': 'TN કનેક્ટ',
    'Our Team': 'અમારી ટીમ', Contact: 'સંપર્ક',
    'Sign In': 'સાઇન ઇન', 'Join Now': 'હવે જોડાઓ',
    'My Profile & Card': 'મારી પ્રોફાઇલ', 'Admin Dashboard': 'એડમિન ડૅશબોર્ડ', 'Sign Out': 'સાઇન આઉટ',
  },
  hi: {
    Home: 'मुख्य पृष्ठ', About: 'हमारे बारे में', Membership: 'सदस्यता', Events: 'कार्यक्रम',
    Gallery: 'गैलरी', Business: 'व्यापार', News: 'समाचार', Forum: 'मंच',
    'Cultural Heritage': 'सांस्कृतिक विरासत', 'TN Connect': 'TN कनेक्ट',
    'Our Team': 'हमारी टीम', Contact: 'संपर्क',
    'Sign In': 'साइन इन', 'Join Now': 'अभी जुड़ें',
    'My Profile & Card': 'मेरी प्रोफ़ाइल', 'Admin Dashboard': 'एडमिन डैशबोर्ड', 'Sign Out': 'साइन आउट',
  },
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('sshh_lang') || 'en');

  const switchLang = (code) => {
    setLang(code);
    localStorage.setItem('sshh_lang', code);
  };

  const t = (key) => translations[lang]?.[key] ?? translations.en[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export const LANGUAGES = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'ta', label: 'த',  full: 'தமிழ்' },
  { code: 'gu', label: 'ગ',  full: 'ગુજરાતી' },
  { code: 'hi', label: 'हि', full: 'हिंदी' },
];
