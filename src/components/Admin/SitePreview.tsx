import { useState, useEffect, useRef } from 'react'
import Lenis from 'lenis'
import type { TranslationDict, SupportedLang } from '../../data/translations'
import PortfolioContent from '../PortfolioContent'
import SiteHeader from '../SiteHeader'

interface SitePreviewProps {
  dict: TranslationDict
  lang: SupportedLang
  activeSection?: string
  onLangChange?: (newLang: SupportedLang) => void
}

export default function SitePreview({ dict, lang, activeSection, onLangChange }: SitePreviewProps) {
  const [scrolledHeaderActions, setScrolledHeaderActions] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)

  // Initialize Lenis smooth scroll scoped to preview container
  useEffect(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    const lenis = new Lenis({
      wrapper: container,
      content: content,
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      prevent: () => false,
    })
    lenisRef.current = lenis

    lenis.on('scroll', (e: { scroll: number }) => {
      setScrolledHeaderActions(e.scroll > 160)
    })

    // ResizeObserver ensures lenis recalculates scroll limit whenever preview content grows
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize()
    })
    resizeObserver.observe(content)

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  // Recalculate scroll dimensions whenever dict changes
  useEffect(() => {
    lenisRef.current?.resize()
  }, [dict])

  const handleScrollToTop = () => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 0.9 })
    } else if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleScrollTo = (target: string) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { duration: 0.85, offset: -80 })
    } else if (containerRef.current) {
      const el = containerRef.current.querySelector(target)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Auto-scroll preview when activeSection changes in Admin
  useEffect(() => {
    if (!activeSection) return
    const mapTabToId: Record<string, string> = {
      hero: '#about',
      about: '#about',
      skills: '#skills',
      experience: '#work',
      projects: '#work',
      blog: '#blog',
      contact: '#contact',
    }
    const targetId = mapTabToId[activeSection]
    if (targetId) {
      if (lenisRef.current) {
        if (activeSection === 'contact') {
          lenisRef.current.scrollTo('bottom', { duration: 0.9 })
        } else {
          lenisRef.current.scrollTo(targetId, { duration: 0.85, offset: -80 })
        }
      } else if (containerRef.current) {
        if (activeSection === 'contact') {
          containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' })
        } else {
          const el = containerRef.current.querySelector(targetId)
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    }
  }, [activeSection])

  return (
    <div className="relative h-full flex flex-col bg-black select-none overflow-hidden font-sans">
      {/* Animated Faint Grey Grid Background with Vignette Overlay (Parity with Homepage) */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-grid-animated opacity-75" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_30%,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

      {/* Preview Sub-Header Bar */}
      <div className="relative z-40 px-4 py-2 bg-neutral-950/90 border-b border-white/10 flex items-center justify-between text-xs font-mono shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white tracking-widest text-[11px] uppercase">
            HOMEPAGE LIVE PREVIEW
          </span>
          <span className="text-[9px] text-white/40 px-1.5 py-0.5 border border-white/10 font-bold uppercase">
            {lang}
          </span>
        </div>
      </div>

      {/* Main Preview Viewport Area */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {/* Top Content Fade Mask / Shield (Hides content scrolling past floating header) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 right-0 h-24 z-20 bg-gradient-to-b from-black via-black/90 to-transparent"
        />

        {/* Floating Homepage Header Bar */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 z-30 p-3 sm:p-5">
          <div className="w-full">
            <SiteHeader
              t={dict}
              lang={lang}
              scrolledHeaderActions={scrolledHeaderActions}
              onScrollToTop={handleScrollToTop}
              onScrollToContact={() => handleScrollTo('#contact')}
              onLangChange={onLangChange}
              isAnimated={true}
            />
          </div>
        </div>

        {/* Preview Scroll Container with Scoped Lenis */}
        <div
          ref={containerRef}
          data-live-preview
          className="relative z-10 w-full h-full overflow-y-auto overscroll-contain scrollbar-none flex justify-center"
        >
          <div
            ref={contentRef}
            className="live-preview-content w-full pb-32 sm:pb-40 transition-all duration-300"
          >
            <PortfolioContent
              t={dict}
              isLivePreview={true}
              showTerminalInMobile={false}
              onScrollTo={handleScrollTo}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
