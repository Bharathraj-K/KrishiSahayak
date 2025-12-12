import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

// Create Language Context
const LanguageContext = createContext();

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en'); // Default to English
  const [isLoading, setIsLoading] = useState(false);

  // Get translation for current language
  const t = (key) => {
    return translations[currentLanguage]?.[key] || key;
  };

  // Change language function
  const changeLanguage = async (languageCode) => {
    setIsLoading(true);
    try {
      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      setCurrentLanguage(languageCode);
      
      // Here you could also save to AsyncStorage for persistence
      // await AsyncStorage.setItem('selectedLanguage', languageCode);
      
      console.log(`Language changed to: ${languageCode}`);
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get available languages
  const getAvailableLanguages = () => {
    return [
      { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
      { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
      { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
      { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
      { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
      { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    ];
  };

  // Get current language details
  const getCurrentLanguageDetails = () => {
    const languages = getAvailableLanguages();
    return languages.find(lang => lang.code === currentLanguage) || languages[0];
  };

  // Load saved language preference on app start
  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        // In a real app, you would load from AsyncStorage
        // const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
        // if (savedLanguage) {
        //   setCurrentLanguage(savedLanguage);
        // }
      } catch (error) {
        console.error('Error loading saved language:', error);
      }
    };

    loadSavedLanguage();
  }, []);

  const value = {
    currentLanguage,
    t,
    changeLanguage,
    getAvailableLanguages,
    getCurrentLanguageDetails,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;