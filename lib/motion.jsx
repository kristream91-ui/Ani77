import React, { useEffect, useRef, useState } from 'react'

/**
 * Scroll-reveal. Adds `.in` when the element first enters the viewport.
 * Falls back to visible immediately if IntersectionObserver is unavailable.
 */
export function useReveal({ threshold = 0.12, rootMargin = '0px 0px -60px 0px' } = {}) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true)
            io.unobserve(e.target)
          }
        })
      },
      { threshold, rootMargin }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, rootMargin])

  return [ref, shown]
}

/** Wraps children in a div that fades up as it scrolls into view. */
export function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }) {
  const [ref, shown] = useReveal()
  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? 'in' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}

/** Animated number that counts up when it scrolls into view. */
export function useCountUp(target, duration = 900) {
  const [ref, shown] = useReveal({ threshold: 0.4 })
  const [value, setValue] = useState(0)

  // Safety net: a stat must never read 0 just because the observer didn't fire.
  useEffect(() => {
    const id = setTimeout(() => setValue((v) => (v === 0 && target !== 0 ? target : v)), 1600)
    return () => clearTimeout(id)
  }, [target])

  useEffect(() => {
    if (!shown) return
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setValue(target)
      return
    }
    let raf
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [shown, target, duration])

  return [ref, value]
}

/** Stagger helper: nth child gets `index * step` ms of animation delay. */
export const stagger = (i, step = 22, max = 200) => ({
  animationDelay: `${Math.min(i * step, max)}ms`
})
