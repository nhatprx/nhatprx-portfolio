import { useEffect, useState, useRef } from 'react'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isTouchDevice] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(pointer: coarse)').matches
  })

  // Use ref for fast trailing ring animation without heavy state lag
  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const targetPos = useRef({ x: -100, y: -100 })
  const currentPos = useRef({ x: -100, y: -100 })
  const rafId = useRef<number | null>(null)

  useEffect(() => {
    if (isTouchDevice) return

    const onMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY }
      setPosition({ x: e.clientX, y: e.clientY })
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

    // Smooth trailing animation loop for the outer ring
    const renderLoop = () => {
      const ease = 0.18
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0) translate(-50%, -50%)`
      }

      rafId.current = requestAnimationFrame(renderLoop)
    }

    rafId.current = requestAnimationFrame(renderLoop)

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mouseenter', onMouseEnter)
    document.addEventListener('mouseleave', onMouseLeave)

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mouseenter', onMouseEnter)
      document.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [isVisible, isTouchDevice])

  if (isTouchDevice || !isVisible) return null

  return (
    <>
      {/* Center Target Dot */}
      <div
        ref={cursorRef}
        className={`pointer-events-none fixed z-[9999] top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-75 ${
          isHovered ? 'w-2 h-2 bg-white scale-125' : 'w-1.5 h-1.5 bg-white'
        }`}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
        }}
      />

      {/* Trailing Outer Ring */}
      <div
        ref={ringRef}
        className={`pointer-events-none fixed z-[9998] top-0 left-0 rounded-full border transition-all duration-200 ease-out ${
          isClicked
            ? 'w-7 h-7 border-white/80 bg-white/20 scale-75'
            : isHovered
            ? 'w-12 h-12 border-white/60 bg-white/10 scale-100'
            : 'w-8 h-8 border-white/25 bg-transparent'
        }`}
      />
    </>
  )
}
