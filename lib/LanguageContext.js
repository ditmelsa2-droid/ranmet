'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { TRANSLATIONS, detectBrowserLanguage, SUPPORTED_LANGUAGES } from './i18n'

const LanguageContext = createContext({
  lang: 'vi',
  setLang: () => {},
  t: (key) => key,
  supportedLanguages: SUPPORTED_LANGUAGES
})

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('vi')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('ranmet_lang')
    if (saved && TRANSLATIONS[saved]) {
      setLangState(saved)
    } else {
      const detected = detectBrowserLanguage()
      setLangState(detected)
      localStorage.setItem('ranmet_lang', detected)
    }
    setMounted(true)
  }, [])

  function setLang(newLang) {
    if (TRANSLATIONS[newLang]) {
      setLangState(newLang)
      localStorage.setItem('ranmet_lang', newLang)
    }
  }

  function t(key, fallback = '') {
    const currentDict = TRANSLATIONS[lang] || TRANSLATIONS.vi
    return currentDict[key] || TRANSLATIONS.en[key] || fallback || key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
