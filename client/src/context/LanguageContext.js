import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    /* Navigation */
    Home: 'Home', About: 'About', Membership: 'Membership', Events: 'Events',
    Gallery: 'Gallery', Business: 'Business', News: 'News', Forum: 'Forum',
    'Cultural Heritage': 'Cultural Heritage', 'TN Connect': 'TN Connect',
    'Our Team': 'Our Team', Contact: 'Contact',
    'Sign In': 'Sign In', 'Join Now': 'Join Now',
    'My Profile & Card': 'My Profile & Card', 'Admin Dashboard': 'Admin Dashboard', 'Sign Out': 'Sign Out',
    /* Common */
    'Read More': 'Read More', 'Learn More': 'Learn More', 'View All': 'View All',
    'Submit': 'Submit', 'Cancel': 'Cancel', 'Search': 'Search', 'Loading': 'Loading',
    /* Home page */
    'Join Our Community': 'Join Our Community', 'Become a Member': 'Become a Member',
    'Latest Events': 'Latest Events', 'Latest News': 'Latest News',
    'Community Gallery': 'Community Gallery', 'Business Directory': 'Business Directory',
    /* Events */
    'Upcoming Events': 'Upcoming Events', 'Register for Event': 'Register for Event',
    'Event Details': 'Event Details', 'Date': 'Date', 'Venue': 'Venue', 'Contact': 'Contact',
    /* Cultural Heritage */
    'Share a Cultural Post': 'Share a Cultural Post', 'Submit Post': 'Submit Post',
    /* TN Connect */
    'Submit Connect Request': 'Submit Connect Request', 'Request Submitted': 'Request Submitted!',
    /* Membership */
    'Apply for Membership': 'Apply for Membership', 'Member Directory': 'Member Directory',
    /* Register */
    'Account Credentials': 'Account Credentials', 'Personal Information': 'Personal Information',
    'Location Details': 'Location Details', 'Submit Registration': 'Submit Registration',
    'Full Name': 'Full Name', 'Email Address': 'Email Address', 'Password': 'Password',
    'Contact Number': 'Contact Number', 'Date of Birth': 'Date of Birth',
    "Father's Name": "Father's Name", "Mother's Name": "Mother's Name",
    'Spouse Name': 'Spouse Name', 'Occupation': 'Occupation', 'Education': 'Education',
    'Address': 'Address', 'District': 'District', 'City': 'City', 'State': 'State',
  },
  ta: {
    /* Navigation */
    Home: 'முகப்பு', About: 'பற்றி', Membership: 'உறுப்பினர்', Events: 'நிகழ்வுகள்',
    Gallery: 'கேலரி', Business: 'வணிகம்', News: 'செய்திகள்', Forum: 'மன்றம்',
    'Cultural Heritage': 'கலாச்சார மரபு', 'TN Connect': 'TN இணைப்பு',
    'Our Team': 'எங்கள் குழு', Contact: 'தொடர்பு',
    'Sign In': 'உள்நுழை', 'Join Now': 'இப்போது சேர்',
    'My Profile & Card': 'என் சுயவிவரம்', 'Admin Dashboard': 'நிர்வாக பலகை', 'Sign Out': 'வெளியேறு',
    /* Common */
    'Read More': 'மேலும் படிக்க', 'Learn More': 'மேலும் அறிய', 'View All': 'அனைத்தும் காண',
    'Submit': 'சமர்ப்பி', 'Cancel': 'ரத்து', 'Search': 'தேட', 'Loading': 'ஏற்றுகிறது',
    /* Home page */
    'Join Our Community': 'எங்கள் சமூகத்தில் சேரவும்', 'Become a Member': 'உறுப்பினராகவும்',
    'Latest Events': 'சமீபத்திய நிகழ்வுகள்', 'Latest News': 'சமீபத்திய செய்திகள்',
    'Community Gallery': 'சமூக கேலரி', 'Business Directory': 'வணிக அடைவு',
    /* Events */
    'Upcoming Events': 'வரும் நிகழ்வுகள்', 'Register for Event': 'நிகழ்வில் பதிவு செய்ய',
    'Event Details': 'நிகழ்வு விவரங்கள்', 'Date': 'தேதி', 'Venue': 'இடம்', 'Contact': 'தொடர்பு',
    /* Cultural Heritage */
    'Share a Cultural Post': 'கலாச்சார பதிவு பகிரவும்', 'Submit Post': 'பதிவு சமர்ப்பி',
    /* TN Connect */
    'Submit Connect Request': 'இணைப்பு கோரிக்கை சமர்ப்பி', 'Request Submitted': 'கோரிக்கை சமர்ப்பிக்கப்பட்டது!',
    /* Membership */
    'Apply for Membership': 'உறுப்பினர் விண்ணப்பி', 'Member Directory': 'உறுப்பினர் அடைவு',
    /* Register */
    'Account Credentials': 'கணக்கு விவரங்கள்', 'Personal Information': 'தனிப்பட்ட தகவல்',
    'Location Details': 'இட விவரங்கள்', 'Submit Registration': 'பதிவு சமர்ப்பி',
    'Full Name': 'முழு பெயர்', 'Email Address': 'மின்னஞ்சல்', 'Password': 'கடவுச்சொல்',
    'Contact Number': 'தொலைபேசி எண்', 'Date of Birth': 'பிறந்த தேதி',
    "Father's Name": 'தந்தை பெயர்', "Mother's Name": 'தாய் பெயர்',
    'Spouse Name': 'வாழ்க்கை துணை பெயர்', 'Occupation': 'தொழில்', 'Education': 'கல்வி',
    'Address': 'முகவரி', 'District': 'மாவட்டம்', 'City': 'நகரம்', 'State': 'மாநிலம்',
  },
  gu: {
    /* Navigation */
    Home: 'મુખ્ય પૃષ્ઠ', About: 'અમારા વિશે', Membership: 'સભ્યપદ', Events: 'ઇવેન્ટ્સ',
    Gallery: 'ગૅલેરી', Business: 'વ્યવસાય', News: 'સમાચાર', Forum: 'ફોરમ',
    'Cultural Heritage': 'સાંસ્કૃતિક વારસો', 'TN Connect': 'TN કનેક્ટ',
    'Our Team': 'અમારી ટીમ', Contact: 'સંપર્ક',
    'Sign In': 'સાઇન ઇન', 'Join Now': 'હવે જોડાઓ',
    'My Profile & Card': 'મારી પ્રોફાઇલ', 'Admin Dashboard': 'એડમિન ડૅશબોર્ડ', 'Sign Out': 'સાઇન આઉટ',
    /* Common */
    'Read More': 'વધુ વાંચો', 'Learn More': 'વધુ જાણો', 'View All': 'બધું જુઓ',
    'Submit': 'સબમિટ', 'Cancel': 'રદ', 'Search': 'શોધો', 'Loading': 'લોડ થઈ રહ્યું છે',
    /* Home page */
    'Join Our Community': 'અમારા સમુદાયમાં જોડાઓ', 'Become a Member': 'સભ્ય બનો',
    'Latest Events': 'તાજેતરના ઇવેન્ટ્સ', 'Latest News': 'તાજેતરના સમાચાર',
    'Community Gallery': 'સામુદાયિક ગૅલેરી', 'Business Directory': 'વ્યવસાય ડિરેક્ટરી',
    /* Register */
    'Account Credentials': 'ખાતાની માહિતી', 'Personal Information': 'વ્યક્તિગત માહિતી',
    'Location Details': 'સ્થળ વિવરણ', 'Submit Registration': 'નોંધણી સબમિટ',
    'Full Name': 'પૂરું નામ', 'Email Address': 'ઇમેઇલ', 'Password': 'પાસવર્ડ',
    'Contact Number': 'ફોન નંબર', 'Date of Birth': 'જન્મ તારીખ',
    "Father's Name": 'પિતાનું નામ', "Mother's Name": 'માતાનું નામ',
    'Spouse Name': 'જીવનસાથીનું નામ', 'Occupation': 'વ્યવસાય', 'Education': 'શિક્ષણ',
    'Address': 'સરનામું', 'District': 'જિલ્લો', 'City': 'શહેર', 'State': 'રાજ્ય',
  },
  hi: {
    /* Navigation */
    Home: 'मुख्य पृष्ठ', About: 'हमारे बारे में', Membership: 'सदस्यता', Events: 'कार्यक्रम',
    Gallery: 'गैलरी', Business: 'व्यापार', News: 'समाचार', Forum: 'मंच',
    'Cultural Heritage': 'सांस्कृतिक विरासत', 'TN Connect': 'TN कनेक्ट',
    'Our Team': 'हमारी टीम', Contact: 'संपर्क',
    'Sign In': 'साइन इन', 'Join Now': 'अभी जुड़ें',
    'My Profile & Card': 'मेरी प्रोफ़ाइल', 'Admin Dashboard': 'एडमिन डैशबोर्ड', 'Sign Out': 'साइन आउट',
    /* Common */
    'Read More': 'और पढ़ें', 'Learn More': 'और जानें', 'View All': 'सभी देखें',
    'Submit': 'जमा करें', 'Cancel': 'रद्द करें', 'Search': 'खोजें', 'Loading': 'लोड हो रहा है',
    /* Home page */
    'Join Our Community': 'हमारे समुदाय में शामिल हों', 'Become a Member': 'सदस्य बनें',
    'Latest Events': 'नवीनतम कार्यक्रम', 'Latest News': 'नवीनतम समाचार',
    'Community Gallery': 'सामुदायिक गैलरी', 'Business Directory': 'व्यापार निर्देशिका',
    /* Register */
    'Account Credentials': 'खाता जानकारी', 'Personal Information': 'व्यक्तिगत जानकारी',
    'Location Details': 'स्थान विवरण', 'Submit Registration': 'पंजीकरण जमा करें',
    'Full Name': 'पूरा नाम', 'Email Address': 'ईमेल', 'Password': 'पासवर्ड',
    'Contact Number': 'फ़ोन नंबर', 'Date of Birth': 'जन्म तिथि',
    "Father's Name": 'पिता का नाम', "Mother's Name": 'माता का नाम',
    'Spouse Name': 'जीवनसाथी का नाम', 'Occupation': 'व्यवसाय', 'Education': 'शिक्षा',
    'Address': 'पता', 'District': 'जिला', 'City': 'शहर', 'State': 'राज्य',
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
