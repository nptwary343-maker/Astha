'use client';

import { useI18n } from '@/context/I18nContext';
import { Languages } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'bn' : 'en');
  };

  return (
    <motion.button
      onClick={toggleLanguage}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-orange-600 to-red-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-orange-600/50 transition-all duration-300"
      title={locale === 'en' ? 'Switch to Bengali' : 'ইংরেজিতে পরিবর্তন করুন'}
    >
      <div className="flex flex-col items-center">
        <Languages size={20} />
        <span className="text-[9px] font-bold mt-0.5">
          {locale === 'en' ? 'বাং' : 'EN'}
        </span>
      </div>
    </motion.button>
  );
}
