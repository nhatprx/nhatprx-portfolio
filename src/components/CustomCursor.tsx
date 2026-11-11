import { useEffect, useState, useRef } from 'react'

export default function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isTouchDevice] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(pointer: coarse)').matches
  })

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isTouchDevice) return

    const onMouseMove = (e: MouseEvent) => {
      // Direct DOM update ensures absolute zero latency & 100% concentric alignment
      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      }
      if (!isVisible) setIsVisible(true)

      // Check if hovering over an interactive element
      const target = e.target as HTMLElement | null
      const interactive = target?.closest(
        'a, button, input, textarea, select, [role="button"], article, .cursor-pointer'
      )
      setIsHovered(!!interactive)
    }

    const onMouseDown = () => setIsClicked(true)
    const onMouseUp = () => setIsClicked(false)
    const onMouseEnter = () => setIsVisible(true)
    const onMouseLeave = () => setIsVisible(false)

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mouseenter', onMouseEnter)
    document.addEventListener('mouseleave', onMouseLeave)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mouseenter', onMouseEnter)
      document.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [isVisible, isTouchDevice])

  if (isTouchDevice || !isVisible) return null

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed top-0 left-0 z-[9999] will-change-transform"
      style={{
        transform: 'translate3d(-100px, -100px, 0)',
      }}
    >
      {/* Concentric Center Dot */}
      <div
        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white transition-all duration-150 ease-out ${
          isHovered ? 'w-2 h-2 scale-125' : 'w-1.5 h-1.5'
        }`}
      />

      {/* Concentric Outer Ring - ALWAYS locked to the exact same center */}
      <div
        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-200 ease-out ${
          isClicked
            ? 'w-7 h-7 border-white/80 bg-white/20 scale-75'
            : isHovered
            ? 'w-11 h-11 border-white/60 bg-white/10 scale-100'
            : 'w-6 h-6 border-white/30 bg-transparent'
        }`}
      />
    </div>
  )
}
