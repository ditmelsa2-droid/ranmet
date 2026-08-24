'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { TRANSLATIONS, detectBrowserLanguage, SUPPORTED_LANGUAGES } from './i18n'
import { translateUiDictionary } from './translate'

const LanguageContext = createContext({
  lang: 'vi',
  setLang: () => {},
  t: (key, fallback = '') => key,
  supportedLanguages: SUPPORTED_LANGUAGES,
  isTranslatingLanguage: false
})

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('vi')
  const [dynamicDicts, setDynamicDicts] = useState({})
  const [isTranslatingLanguage, setIsTranslatingLanguage] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Load active language & cached AI dynamic dictionaries on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('ranmet_lang') || detectBrowserLanguage()
      setLangState(savedLang)

      // Load all cached AI dictionaries from localStorage
      const cachedDicts = {}
      for (const item of SUPPORTED_LANGUAGES) {
        const cached = localStorage.getItem(`ranmet_ai_dict_${item.code}`)
        if (cached) {
          try {
            cachedDicts[item.code] = JSON.parse(cached)
          } catch (e) {
            // ignore JSON parse error
          }
        }
      }
      setDynamicDicts(cachedDicts)

      // If active language is not pre-packaged and not yet cached, trigger AI translation
      if (!TRANSLATIONS[savedLang] && !cachedDicts[savedLang]) {
        fetchAiDictionary(savedLang)
      }
    } catch (err) {
      console.warn('Language init warning:', err)
    }
    setMounted(true)
  }, [])

  // Trigger Gemini AI Batch Translation for any world language
  const fetchAiDictionary = useCallback(async (targetCode) => {
    if (TRANSLATIONS[targetCode]) return
    if (dynamicDicts[targetCode]) return

    setIsTranslatingLanguage(true)
    try {
      const baseDict = TRANSLATIONS.en || TRANSLATIONS.vi
      const aiTranslated = await translateUiDictionary(baseDict, targetCode)
      if (aiTranslated && typeof aiTranslated === 'object') {
        setDynamicDicts((prev) => ({ ...prev, [targetCode]: aiTranslated }))
        try {
          localStorage.setItem(`ranmet_ai_dict_${targetCode}`, JSON.stringify(aiTranslated))
        } catch (e) {
          // ignore quota exceeded
        }
      }
    } catch (err) {
      console.error('Failed to translate UI dictionary with Gemini:', err)
    } finally {
      setIsTranslatingLanguage(false)
    }
  }, [dynamicDicts])

  function setLang(newLang) {
    setLangState(newLang)
    try {
      localStorage.setItem('ranmet_lang', newLang)
    } catch (e) {
      // ignore storage error
    }

    // If new language has no static or dynamic dictionary, auto translate via Gemini
    if (!TRANSLATIONS[newLang] && !dynamicDicts[newLang]) {
      fetchAiDictionary(newLang)
    }
  }

  function t(key, fallback = '') {
    // 1. Check static pre-compiled dictionary
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
      return TRANSLATIONS[lang][key]
    }

    // 2. Check dynamic Gemini AI translated dictionary
    if (dynamicDicts[lang] && dynamicDicts[lang][key]) {
      return dynamicDicts[lang][key]
    }

    // 3. Fallback to English, then Vietnamese, then fallback text
    return TRANSLATIONS.en[key] || TRANSLATIONS.vi[key] || fallback || key
  }

  return (
    <LanguageContext.Provider 
      value={{ 
        lang, 
        setLang, 
        t, 
        supportedLanguages: SUPPORTED_LANGUAGES,
        isTranslatingLanguage
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
