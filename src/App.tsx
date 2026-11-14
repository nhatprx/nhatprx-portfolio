import { useState, useEffect, useCallback } from 'react'
import 'lenis/dist/lenis.css'
import Ec2Terminal from './components/Ec2Terminal'
import ServerTelemetry from './components/ServerTelemetry'
import { TRANSLATIONS, type SupportedLang, type TranslationDict } from './data/translations'
import CustomCursor from './components/CustomCursor'
import AdminPortal from './components/Admin/AdminPortal'
import BlogPostModal from './components/BlogPostModal'
import { loadRemoteTranslations } from './services/contentStorage'
import PortfolioContent from './components/PortfolioContent'
import SiteHeader from './components/SiteHeader'
import ScreenLoader from './components/ScreenLoader'
import JourneyBar from './components/JourneyBar'
import { usePageScroll } from './hooks/usePageScroll'

export default function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [loaderMounted, setLoaderMounted] = useState(true)
  const [isLangSwitching, setIsLangSwitching] = useState(false)
  const [loadingLabel, setLoadingLabel] = useState('INITIALIZING ENVIRONMENT...')

  // Start with factory defaults, immediately replace with S3 data once fetched.
  // Never use stale localStorage cache on first load.
  const [allTranslations, setAllTranslations] = useState(() => TRANSLATIONS)

  // Load the shared content (S3-backed) on mount and refresh every 30s.
  // This ensures every visitor always sees the latest edits from S3, never stale cache.
  useEffect(() => {
    let isMounted = true
    const load = async () => {
      try {
        const remote = await loadRemoteTranslations()
        if (isMounted) setAllTranslations(remote)
      } catch (err) {
        console.error('Failed to load S3 content:', err)
        // Fall back to defaults on error; don't use stale localStorage
      }
    }
    // Fetch immediately on mount (don't wait for interval)
    load()
    // Poll every 30s for fresh changes
    const interval = setInterval(load, 30000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])
  const [isAdminOpen, setIsAdminOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.location.hash === '#admin' || window.location.pathname === '/admin'
  })

  const {
    showTopBtn,
    scrolledHeaderActions,
    scrollProgress,
    activeSection,
    scrollTo,
    resetScrollImmediate,
  } = usePageScroll(isAdminOpen)

  const [activeBlogSlug, setActiveBlogSlug] = useState<string | null>(null)
  const [workTab, setWorkTab] = useState<'experience' | 'projects'>('projects')
  const [activeExp, setActiveExp] = useState(0)
  const [activeProj, setActiveProj] = useState(0)

  const [lang, setLang] = useState<SupportedLang>(() => {
    const saved = localStorage.getItem('nhatprx_lang') as SupportedLang
    if (saved && ['en', 'vi', 'fr', 'ja'].includes(saved)) return saved
    return 'en'
  })

  const t = allTranslations[lang] || TRANSLATIONS[lang]

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminOpen(window.location.hash === '#admin' || window.location.pathname === '/admin')
    }
    const handleKeyNav = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        window.location.hash = '#admin'
      }
    }
    window.addEventListener('hashchange', handleLocationChange)
    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('keydown', handleKeyNav)
    return () => {
      window.removeEventListener('hashchange', handleLocationChange)
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('keydown', handleKeyNav)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
      resetScrollImmediate()
      const unmountTimer = setTimeout(() => {
        setLoaderMounted(false)
      }, 350)
      return () => clearTimeout(unmountTimer)
    }, 450)
    return () => clearTimeout(timer)
  }, [resetScrollImmediate])

  // Storytelling scroll reveal observer
  useEffect(() => {
    if (typeof window === 'undefined') return
    const elements = document.querySelectorAll('.story-reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [lang, workTab])

  // Stable identity: AdminPortal's auto-save effect depends on this callback.
  // An inline arrow would change identity on every App render, re-triggering
  // that effect and looping the render cycle (which blocks typing).
  const handleUpdateTranslations = useCallback(
    (updated: Record<SupportedLang, TranslationDict>) => {
      setAllTranslations(updated)
    },
    []
  )

  const handleLangChange = (newLang: SupportedLang) => {
    if (newLang === lang) return

    setIsLangSwitching(true)

    const labelMap: Record<SupportedLang, string> = {
      en: 'SWITCHING TO ENGLISH...',
      vi: 'ĐANG CHUYỂN SANG TIẾNG VIỆT...',
      fr: 'CHARGEMENT EN FRANÇAIS...',
      ja: '日本語に切り替え中...',
    }
    setLoadingLabel(labelMap[newLang] || 'SWITCHING LOCALE...')

    setTimeout(() => {
      setLang(newLang)
      localStorage.setItem('nhatprx_lang', newLang)
      setTimeout(() => {
        setIsLangSwitching(false)
      }, 300)
    }, 250)
  }

  return (
    <div className="relative min-h-screen bg-black text-white font-sans selection:bg-emerald-400 selection:text-black">
      {/* Animated faint grey grid background */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-animated opacity-75" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_30%,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

      {/* Interactive Custom Cursor */}
      <CustomCursor />

      {/* Screen Loader (Initial & Language Switch) */}
      <ScreenLoader
        mounted={loaderMounted}
        isInitialLoading={isInitialLoading}
        isLangSwitching={isLangSwitching}
        loadingLabel={loadingLabel}
      />

      <main className="relative z-10 w-full min-h-screen">
        {/* Top Content Fade Mask / Shield (Hides content scrolling past header) */}
        <div
          aria-hidden="true"
          className="fixed top-0 left-0 w-full xl:w-1/2 h-24 sm:h-28 xl:h-32 pointer-events-none z-30 bg-gradient-to-b from-black via-black/90 to-transparent"
        />

        {/* Top Header - Floating Slab Strictly Constrained to Left Column */}
        <div className="fixed top-0 left-0 w-full xl:w-1/2 z-40 p-3 sm:p-6 xl:px-10 xl:pt-6 pointer-events-none">
          <SiteHeader
            t={t}
            lang={lang}
            scrolledHeaderActions={scrolledHeaderActions}
            onScrollToTop={() => scrollTo(0)}
            onScrollToContact={() => scrollTo('#contact')}
            onLangChange={handleLangChange}
            isAnimated={!isInitialLoading}
          />
        </div>

        {/* Left Scrollable Content Column (50/50 Split) */}
        <div
          className={`w-full xl:w-1/2 xl:min-h-screen flex flex-col transition-all duration-700 delay-100 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
            !isInitialLoading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <PortfolioContent
            t={t}
            showTerminalInMobile={true}
            onSelectBlog={(slug) => setActiveBlogSlug(slug)}
            onScrollTo={(target) => scrollTo(target)}
            workTab={workTab}
            setWorkTab={setWorkTab}
            activeExp={activeExp}
            setActiveExp={setActiveExp}
            activeProj={activeProj}
            setActiveProj={setActiveProj}
          />
        </div>

        {/* Desktop Fixed Terminal & Live Metric on the Right (Aligned to Top Header & Bottom Baseline) */}
        <aside
          aria-label="Interactive Live Cloud Node Terminal & Telemetry"
          className={`hidden xl:flex fixed top-0 right-0 bottom-0 w-1/2 pt-6 pb-12 sm:pb-16 xl:pb-20 pr-4 sm:pr-10 xl:pr-14 pl-4 2xl:pl-8 flex-col justify-between pointer-events-none z-30 transition-opacity duration-700 delay-150 ease-out motion-reduce:transition-none ${
            !isInitialLoading ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-full h-full flex flex-col gap-3.5 pointer-events-auto min-h-0">
            <div className="flex-1 w-full shadow-2xl min-h-[360px]">
              <Ec2Terminal identity={t.identity} />
            </div>

            {/* Streamlined Minimal Live Telemetry Metric under Terminal */}
            <div className="w-full shadow-xl shrink-0">
              <ServerTelemetry />
            </div>
          </div>
        </aside>
      </main>

      {/* Bottom Floating Bar: Journey Bar + Move on Top Button */}
      <JourneyBar
        t={t}
        showTopBtn={showTopBtn}
        activeSection={activeSection}
        workTab={workTab}
        scrollProgress={scrollProgress}
        onScrollTo={(target) => scrollTo(target)}
      />

      {/* Blog Post Detail Modal */}
      {(() => {
        const activePost = activeBlogSlug ? t.blog.posts.find((p) => p.slug === activeBlogSlug) : null
        if (!activePost) return null
        return (
          <BlogPostModal
            post={activePost}
            t={t}
            onClose={() => setActiveBlogSlug(null)}
            onSelectPost={(slug) => setActiveBlogSlug(slug)}
            allPosts={t.blog.posts}
          />
        )
      })()}

      {/* Hidden Admin Portal */}
      {isAdminOpen && (
        <AdminPortal
          onClose={() => {
            setIsAdminOpen(false)
            if (window.location.hash === '#admin') {
              window.history.replaceState(null, '', window.location.pathname)
            }
          }}
          onUpdateTranslations={handleUpdateTranslations}
        />
      )}
    </div>
  )
}
