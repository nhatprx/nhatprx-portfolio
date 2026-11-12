import { useState, useEffect, useRef, useCallback } from 'react'
import Lenis from 'lenis'

export function usePageScroll(isAdminOpen: boolean) {
  const [showTopBtn, setShowTopBtn] = useState(false)
  const [scrolledHeaderActions, setScrolledHeaderActions] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeSection, setActiveSection] = useState('about')
  const lenisRef = useRef<Lenis | null>(null)

  // Initialize Lenis smooth scrolling with optimized checkpoint responsiveness
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
    })
    lenisRef.current = lenis

    // Force immediate anchor to top Hero section on reload / first load
    window.scrollTo(0, 0)
    lenis.scrollTo(0, { immediate: true })

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  // Pause Lenis smooth scrolling on main page while admin is open
  useEffect(() => {
    if (isAdminOpen) {
      lenisRef.current?.stop()
      return () => {
        lenisRef.current?.start()
      }
    }
  }, [isAdminOpen])

  const scrollTo = useCallback((target: string | number) => {
    if (typeof target === 'number') {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, { duration: 0.9 })
      } else {
        window.scrollTo({ top: target, behavior: 'smooth' })
      }
      return
    }

    if (target === '#hero' || target === '#about' || target === '#top') {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { duration: 0.9 })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }

    // Normalize alias IDs to their canonical section containers
    let resolvedTarget = target
    if (target === '#tech-stack') resolvedTarget = '#skills'
    if (target === '#experience' || target === '#projects') resolvedTarget = '#work'

    const el = document.querySelector(resolvedTarget) as HTMLElement | null
    if (!el) return

    // Position section cleanly below the fixed header (header height: 68px on lg, 58px on mobile)
    const elTop = el.getBoundingClientRect().top + window.scrollY
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024
    const headerHeight = isDesktop ? 68 : 58
    const targetY = Math.max(0, Math.round(elTop - headerHeight))

    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetY, { duration: 0.85 })
    } else {
      window.scrollTo({ top: targetY, behavior: 'smooth' })
    }
  }, [])

  const resetScrollImmediate = useCallback(() => {
    window.scrollTo(0, 0)
    lenisRef.current?.scrollTo(0, { immediate: true })
  }, [])

  // Scroll position & active section observer
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const innerHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const maxScroll = docHeight - innerHeight

      setScrolledHeaderActions(scrollY > 200)
      setShowTopBtn(scrollY > 200)

      const pct = maxScroll > 0 ? Math.min(100, Math.max(0, Math.round((scrollY / maxScroll) * 100))) : 0
      setScrollProgress(pct)

      // 1. Bottom boundary: activate contact when near or at bottom
      if (maxScroll > 0 && innerHeight + scrollY >= docHeight - 60) {
        setActiveSection('contact')
        return
      }

      // 2. Top boundary: activate about when near top
      if (scrollY < 160) {
        setActiveSection('about')
        return
      }

      // 3. Focal scan line: reading zone at 35% of viewport height
      const scanLine = Math.round(innerHeight * 0.35)
      const sectionIds = ['contact', 'blog', 'work', 'skills', 'about']

      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= scanLine && rect.bottom > 116) {
            setActiveSection(id)
            break
          }
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return {
    showTopBtn,
    scrolledHeaderActions,
    scrollProgress,
    activeSection,
    scrollTo,
    resetScrollImmediate,
  }
}

